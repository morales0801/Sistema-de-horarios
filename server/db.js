const fs = require('fs');
const path = require('path');
const {
  departments,
  initialShifts,
  initialCollaborators,
  generateSeedSchedules,
  generateSeedAttendance
} = require('./initialData');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class Database {
  constructor() {
    this.data = {
      departments: [],
      shifts: [],
      collaborators: [],
      schedules: [],
      attendance: []
    };
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure all arrays exist
        this.data.departments = this.data.departments || departments;
        this.data.shifts = this.data.shifts || initialShifts;
        this.data.collaborators = this.data.collaborators || initialCollaborators;
        this.data.schedules = this.data.schedules || [];
        this.data.attendance = this.data.attendance || generateSeedAttendance();

        // Ensure collaborators have code and pin
        this.data.collaborators.forEach((c, idx) => {
          if (!c.code) c.code = String(1001 + idx);
          if (!c.pin) c.pin = '1234';
        });
      } else {
        this.resetDemo();
      }
    } catch (err) {
      console.error('Error loading database, resetting to initial state:', err);
      this.resetDemo();
    }
  }

  resetDemo() {
    this.data = {
      departments: [...departments],
      shifts: JSON.parse(JSON.stringify(initialShifts)),
      collaborators: JSON.parse(JSON.stringify(initialCollaborators)),
      schedules: generateSeedSchedules(),
      attendance: generateSeedAttendance()
    };
    this.save();
  }

  save() {
    try {
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error saving database to file:', err);
    }
  }

  // --- Collaborators ---
  getCollaborators(filterActive = false) {
    if (filterActive) {
      return this.data.collaborators.filter(c => c.active);
    }
    return this.data.collaborators;
  }

  getCollaboratorById(id) {
    return this.data.collaborators.find(c => c.id === id);
  }

  getCollaboratorByCode(code) {
    return this.data.collaborators.find(c => c.code === code);
  }

  createCollaborator(collab) {
    const nextCode = String(1001 + this.data.collaborators.length);
    const newCollab = {
      id: collab.id || `col-${Date.now()}`,
      code: collab.code || nextCode,
      pin: collab.pin || '1234',
      name: collab.name || 'Sin Nombre',
      email: collab.email || '',
      phone: collab.phone || '',
      department: collab.department || 'General',
      role: collab.role || 'Colaborador',
      avatarColor: collab.avatarColor || '#3b82f6',
      targetWeeklyHours: Number(collab.targetWeeklyHours) || 40,
      active: collab.active !== undefined ? collab.active : true
    };
    this.data.collaborators.push(newCollab);
    this.save();
    return newCollab;
  }

  updateCollaborator(id, updates) {
    const index = this.data.collaborators.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.collaborators[index] = {
      ...this.data.collaborators[index],
      ...updates,
      targetWeeklyHours: updates.targetWeeklyHours !== undefined 
        ? Number(updates.targetWeeklyHours) 
        : this.data.collaborators[index].targetWeeklyHours
    };
    this.save();
    return this.data.collaborators[index];
  }

  deleteCollaborator(id) {
    const index = this.data.collaborators.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.data.collaborators.splice(index, 1);
    this.data.schedules = this.data.schedules.filter(s => s.collaboratorId !== id);
    this.data.attendance = this.data.attendance.filter(a => a.collaboratorId !== id);
    this.save();
    return true;
  }

  // --- Shifts ---
  getShifts() {
    return this.data.shifts;
  }

  getShiftById(id) {
    return this.data.shifts.find(s => s.id === id);
  }

  createShift(shift) {
    const newShift = {
      id: shift.id || `shift-${Date.now()}`,
      name: shift.name || 'Nuevo Turno',
      code: (shift.code || 'T').toUpperCase(),
      startTime: shift.startTime || '09:00',
      endTime: shift.endTime || '17:00',
      durationHours: Number(shift.durationHours) || 8,
      color: shift.color || '#3b82f6',
      bgColor: shift.bgColor || '#eff6ff',
      borderColor: shift.borderColor || '#93c5fd',
      textColor: shift.textColor || '#1e40af',
      isBreak: Boolean(shift.isBreak),
      isLeave: Boolean(shift.isLeave)
    };
    this.data.shifts.push(newShift);
    this.save();
    return newShift;
  }

  updateShift(id, updates) {
    const index = this.data.shifts.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.data.shifts[index] = {
      ...this.data.shifts[index],
      ...updates,
      durationHours: updates.durationHours !== undefined 
        ? Number(updates.durationHours) 
        : this.data.shifts[index].durationHours
    };
    this.save();
    return this.data.shifts[index];
  }

  deleteShift(id) {
    const index = this.data.shifts.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.data.shifts.splice(index, 1);
    this.save();
    return true;
  }

  // --- Schedules ---
  getSchedules({ startDate, endDate, collaboratorId } = {}) {
    let result = this.data.schedules;
    if (startDate) {
      result = result.filter(s => s.date >= startDate);
    }
    if (endDate) {
      result = result.filter(s => s.date <= endDate);
    }
    if (collaboratorId) {
      result = result.filter(s => s.collaboratorId === collaboratorId);
    }
    return result;
  }

  upsertSchedule({ collaboratorId, date, shiftId, notes = '' }) {
    if (!shiftId || shiftId === 'none') {
      const idx = this.data.schedules.findIndex(
        s => s.collaboratorId === collaboratorId && s.date === date
      );
      if (idx !== -1) {
        this.data.schedules.splice(idx, 1);
        this.save();
      }
      return null;
    }

    const existingIdx = this.data.schedules.findIndex(
      s => s.collaboratorId === collaboratorId && s.date === date
    );

    if (existingIdx !== -1) {
      this.data.schedules[existingIdx] = {
        ...this.data.schedules[existingIdx],
        shiftId,
        notes
      };
      this.save();
      return this.data.schedules[existingIdx];
    } else {
      const newSchedule = {
        id: `sch-${collaboratorId}-${date}`,
        collaboratorId,
        date,
        shiftId,
        notes
      };
      this.data.schedules.push(newSchedule);
      this.save();
      return newSchedule;
    }
  }

  batchUpsertSchedules(items) {
    const results = [];
    for (const item of items) {
      const res = this.upsertSchedule(item);
      if (res) results.push(res);
    }
    return results;
  }

  deleteSchedule(id) {
    const idx = this.data.schedules.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.data.schedules.splice(idx, 1);
    this.save();
    return true;
  }

  copyWeek({ fromWeekStart, toWeekStart }) {
    const fromDate = new Date(`${fromWeekStart}T00:00:00`);
    const toDate = new Date(`${toWeekStart}T00:00:00`);

    const fromEndDate = new Date(fromDate);
    fromEndDate.setDate(fromDate.getDate() + 6);
    const fromEndStr = fromEndDate.toISOString().split('T')[0];

    const toEndDate = new Date(toDate);
    toEndDate.setDate(toDate.getDate() + 6);
    const toEndStr = toEndDate.toISOString().split('T')[0];

    const sourceSchedules = this.data.schedules.filter(
      s => s.date >= fromWeekStart && s.date <= fromEndStr
    );

    this.data.schedules = this.data.schedules.filter(
      s => !(s.date >= toWeekStart && s.date <= toEndStr)
    );

    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / msPerDay);

    const newSchedules = sourceSchedules.map(s => {
      const origDate = new Date(`${s.date}T00:00:00`);
      const newD = new Date(origDate);
      newD.setDate(origDate.getDate() + diffDays);
      const newDateStr = newD.toISOString().split('T')[0];

      return {
        id: `sch-${s.collaboratorId}-${newDateStr}`,
        collaboratorId: s.collaboratorId,
        date: newDateStr,
        shiftId: s.shiftId,
        notes: s.notes || ''
      };
    });

    this.data.schedules.push(...newSchedules);
    this.save();
    return newSchedules;
  }

  clearWeek({ weekStart }) {
    const start = new Date(`${weekStart}T00:00:00`);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const endStr = end.toISOString().split('T')[0];

    this.data.schedules = this.data.schedules.filter(
      s => !(s.date >= weekStart && s.date <= endStr)
    );
    this.save();
    return true;
  }

  // --- Attendance (Fichajes y Marcaciones) ---
  getAttendance({ date, collaboratorId } = {}) {
    let result = this.data.attendance;
    if (date) {
      result = result.filter(a => a.date === date);
    }
    if (collaboratorId) {
      result = result.filter(a => a.collaboratorId === collaboratorId);
    }
    // Sort chronologically
    return result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  clockAttendance({ collaboratorId, pin, type, device = 'App Colaborador', notes = '', clientDate, clientTime }) {
    const collab = this.getCollaboratorById(collaboratorId);
    if (!collab) {
      throw new Error('Colaborador no encontrado');
    }

    if (pin && collab.pin && collab.pin !== pin) {
      throw new Error('PIN incorrecto. Por favor verifica tu código de seguridad.');
    }

    const now = new Date();
    // Use client's local date/time if sent, otherwise fallback to server time
    const dateStr = clientDate || now.toISOString().split('T')[0];
    const timeStr = clientTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // Check last punch to prevent erratic clicks
    const todayPunches = this.getAttendance({ date: dateStr, collaboratorId });
    const lastPunch = todayPunches[todayPunches.length - 1];

    if (lastPunch && lastPunch.type === type) {
      throw new Error(`Ya has registrado tu ${type === 'in' ? 'Entrada' : type === 'out' ? 'Salida' : 'Pausa'}.`);
    }

    const punch = {
      id: `att-${collaboratorId}-${Date.now()}`,
      collaboratorId,
      date: dateStr,
      type, // 'in' | 'out' | 'break_start' | 'break_end'
      timestamp: now.toISOString(),
      time: timeStr,
      device,
      notes
    };

    this.data.attendance.push(punch);
    this.save();

    return {
      punch,
      collaborator: collab,
      summary: this.getCollaboratorDayStatus(collaboratorId, dateStr)
    };
  }

  deleteAttendancePunch(id) {
    const idx = this.data.attendance.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.data.attendance.splice(idx, 1);
    this.save();
    return true;
  }

  getCollaboratorDayStatus(collaboratorId, dateStr) {
    const collab = this.getCollaboratorById(collaboratorId);
    const punches = this.getAttendance({ date: dateStr, collaboratorId });
    const schedule = this.data.schedules.find(s => s.collaboratorId === collaboratorId && s.date === dateStr);
    const shift = schedule ? this.getShiftById(schedule.shiftId) : null;

    let currentState = 'not_arrived'; // 'not_arrived' | 'working' | 'on_break' | 'left' | 'off'
    if (shift && (shift.isBreak || shift.isLeave)) {
      currentState = 'off';
    }

    let firstIn = null;
    let lastOut = null;
    let totalWorkedMinutes = 0;
    let lastInTime = null;

    punches.forEach(p => {
      const pTime = new Date(p.timestamp);
      if (p.type === 'in' || p.type === 'break_end') {
        currentState = 'working';
        if (p.type === 'in' && !firstIn) firstIn = p;
        lastInTime = pTime;
      } else if (p.type === 'break_start') {
        currentState = 'on_break';
        if (lastInTime) {
          totalWorkedMinutes += Math.round((pTime.getTime() - lastInTime.getTime()) / 60000);
          lastInTime = null;
        }
      } else if (p.type === 'out') {
        currentState = 'left';
        lastOut = p;
        if (lastInTime) {
          totalWorkedMinutes += Math.round((pTime.getTime() - lastInTime.getTime()) / 60000);
          lastInTime = null;
        }
      }
    });

    // If still currently working, add minutes from last in until now
    if (currentState === 'working' && lastInTime) {
      const now = new Date();
      totalWorkedMinutes += Math.round((now.getTime() - lastInTime.getTime()) / 60000);
    }

    // Punctuality check
    let punctuality = 'Sin turno';
    let delayMinutes = 0;
    if (shift && !shift.isBreak && !shift.isLeave && firstIn) {
      const [schedH, schedM] = shift.startTime.split(':').map(Number);
      const [inH, inM] = firstIn.time.split(':').map(Number);
      const scheduledMinutes = schedH * 60 + schedM;
      const actualMinutes = inH * 60 + inM;
      delayMinutes = actualMinutes - scheduledMinutes;

      if (delayMinutes <= 5) {
        punctuality = 'A tiempo';
      } else {
        punctuality = `Retraso (${delayMinutes} min)`;
      }
    } else if (shift && !shift.isBreak && !shift.isLeave && !firstIn) {
      punctuality = 'No ha ingresado';
    }

    const hours = (totalWorkedMinutes / 60).toFixed(1);

    return {
      collaborator: collab,
      date: dateStr,
      schedule,
      shift,
      punches,
      currentState,
      firstInTime: firstIn ? firstIn.time : null,
      lastOutTime: lastOut ? lastOut.time : null,
      totalWorkedHours: Number(hours),
      totalWorkedMinutes,
      punctuality,
      delayMinutes
    };
  }

  getTodayAttendanceSummary(customDate) {
    const dateStr = customDate || new Date().toISOString().split('T')[0];
    return this.data.collaborators.map(c => this.getCollaboratorDayStatus(c.id, dateStr));
  }

  // --- Departments ---
  getDepartments() {
    return this.data.departments;
  }

  addDepartment(name) {
    if (!name || this.data.departments.includes(name)) return this.data.departments;
    this.data.departments.push(name);
    this.save();
    return this.data.departments;
  }
}

const db = new Database();

module.exports = db;
