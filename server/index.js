const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Log incoming API requests
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// --- Collaborators Endpoints ---
app.get('/api/collaborators', (req, res) => {
  try {
    const filterActive = req.query.active === 'true';
    const collaborators = db.getCollaborators(filterActive);
    res.json(collaborators);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/collaborators', (req, res) => {
  try {
    const created = db.createCollaborator(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/collaborators/:id', (req, res) => {
  try {
    const updated = db.updateCollaborator(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/collaborators/:id', (req, res) => {
  try {
    const success = db.deleteCollaborator(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }
    res.json({ message: 'Colaborador eliminado con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Shifts Endpoints ---
app.get('/api/shifts', (req, res) => {
  try {
    const shifts = db.getShifts();
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shifts', (req, res) => {
  try {
    const created = db.createShift(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/shifts/:id', (req, res) => {
  try {
    const updated = db.updateShift(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/shifts/:id', (req, res) => {
  try {
    const success = db.deleteShift(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    res.json({ message: 'Turno eliminado con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Schedules Endpoints ---
app.get('/api/schedules', (req, res) => {
  try {
    const { startDate, endDate, collaboratorId } = req.query;
    const schedules = db.getSchedules({ startDate, endDate, collaboratorId });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/schedules', (req, res) => {
  try {
    const { collaboratorId, date, shiftId, notes } = req.body;
    if (!collaboratorId || !date) {
      return res.status(400).json({ error: 'collaboratorId y date son requeridos' });
    }
    const result = db.upsertSchedule({ collaboratorId, date, shiftId, notes });
    res.json(result || { removed: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/schedules/batch', (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Se esperaba un arreglo de asignaciones' });
    }
    const results = db.batchUpsertSchedules(items);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/schedules/:id', (req, res) => {
  try {
    const success = db.deleteSchedule(req.params.id);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/schedules/copy-week', (req, res) => {
  try {
    const { fromWeekStart, toWeekStart } = req.body;
    if (!fromWeekStart || !toWeekStart) {
      return res.status(400).json({ error: 'fromWeekStart y toWeekStart son requeridos (YYYY-MM-DD)' });
    }
    const copied = db.copyWeek({ fromWeekStart, toWeekStart });
    res.json({ message: 'Semana copiada con éxito', count: copied.length, schedules: copied });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/schedules/clear-week', (req, res) => {
  try {
    const { weekStart } = req.body;
    if (!weekStart) {
      return res.status(400).json({ error: 'weekStart es requerido' });
    }
    db.clearWeek({ weekStart });
    res.json({ message: 'Horarios de la semana eliminados con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Attendance & Clock-in Endpoints ---
app.post('/api/attendance/clock', (req, res) => {
  try {
    const { collaboratorId, pin, type, device, notes, clientDate, clientTime } = req.body;
    if (!collaboratorId || !type) {
      return res.status(400).json({ error: 'collaboratorId y type son requeridos' });
    }
    const result = db.clockAttendance({ collaboratorId, pin, type, device, notes, clientDate, clientTime });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/attendance', (req, res) => {
  try {
    const { date, collaboratorId } = req.query;
    const records = db.getAttendance({ date, collaboratorId });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/attendance/today', (req, res) => {
  try {
    const { date } = req.query;
    const summary = db.getTodayAttendanceSummary(date);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/attendance/status/:collaboratorId', (req, res) => {
  try {
    const { date } = req.query;
    const dateStr = date || new Date().toISOString().split('T')[0];
    const status = db.getCollaboratorDayStatus(req.params.collaboratorId, dateStr);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/attendance/:id', (req, res) => {
  try {
    const ok = db.deleteAttendancePunch(req.params.id);
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Departments Endpoints ---
app.get('/api/departments', (req, res) => {
  try {
    const depts = db.getDepartments();
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/departments', (req, res) => {
  try {
    const { name } = req.body;
    const depts = db.addDepartment(name);
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Stats and Summary ---
app.get('/api/stats', (req, res) => {
  try {
    const { weekStart } = req.query;
    if (!weekStart) {
      return res.status(400).json({ error: 'weekStart is required (YYYY-MM-DD)' });
    }
    const start = new Date(`${weekStart}T00:00:00`);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const endStr = end.toISOString().split('T')[0];

    const schedules = db.getSchedules({ startDate: weekStart, endDate: endStr });
    const collaborators = db.getCollaborators();
    const shifts = db.getShifts();

    const shiftMap = new Map(shifts.map(s => [s.id, s]));

    // Calculate hours per collaborator
    const collabStats = collaborators.map(c => {
      const cSchedules = schedules.filter(s => s.collaboratorId === c.id);
      let totalHours = 0;
      let workedDays = 0;
      let offDays = 0;
      let leaveDays = 0;

      cSchedules.forEach(s => {
        const shift = shiftMap.get(s.shiftId);
        if (shift) {
          totalHours += shift.durationHours || 0;
          if (shift.isBreak) offDays++;
          else if (shift.isLeave) leaveDays++;
          else workedDays++;
        }
      });

      return {
        collaboratorId: c.id,
        name: c.name,
        targetHours: c.targetWeeklyHours,
        scheduledHours: totalHours,
        diffHours: totalHours - c.targetWeeklyHours,
        workedDays,
        offDays,
        leaveDays,
        isOvertime: totalHours > c.targetWeeklyHours,
        isUnder: totalHours < c.targetWeeklyHours
      };
    });

    const totalHoursScheduled = collabStats.reduce((sum, item) => sum + item.scheduledHours, 0);

    res.json({
      weekStart,
      weekEnd: endStr,
      totalHoursScheduled,
      collaboratorStats: collabStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Reset Demo Data ---
app.post('/api/reset-demo', (req, res) => {
  try {
    db.resetDemo();
    res.json({ message: 'Datos demo restablecidos con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static client files in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.use((req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(clientDist, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(200).send('API del Sistema de Horarios funcionando en el puerto ' + PORT);
      }
    });
  } else {
    res.status(404).json({ error: 'Ruta no encontrada' });
  }
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  Servidor de Horarios corriendo en http://localhost:${PORT}`);
  console.log(`  API disponible en http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});
