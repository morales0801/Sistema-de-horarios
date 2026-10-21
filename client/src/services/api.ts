import { 
  Collaborator, 
  Shift, 
  Schedule, 
  WeeklyStats, 
  AttendancePunch, 
  CollaboratorAttendanceStatus, 
  PunchType 
} from '../types';

const API_BASE = '/api';

export const api = {
  // Collaborators
  async getCollaborators(): Promise<Collaborator[]> {
    const res = await fetch(`${API_BASE}/collaborators`);
    if (!res.ok) throw new Error('Error al cargar colaboradores');
    return res.json();
  },

  async createCollaborator(data: Partial<Collaborator>): Promise<Collaborator> {
    const res = await fetch(`${API_BASE}/collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear colaborador');
    return res.json();
  },

  async updateCollaborator(id: string, data: Partial<Collaborator>): Promise<Collaborator> {
    const res = await fetch(`${API_BASE}/collaborators/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar colaborador');
    return res.json();
  },

  async deleteCollaborator(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/collaborators/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar colaborador');
  },

  // Shifts
  async getShifts(): Promise<Shift[]> {
    const res = await fetch(`${API_BASE}/shifts`);
    if (!res.ok) throw new Error('Error al cargar turnos');
    return res.json();
  },

  async createShift(data: Partial<Shift>): Promise<Shift> {
    const res = await fetch(`${API_BASE}/shifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear turno');
    return res.json();
  },

  async updateShift(id: string, data: Partial<Shift>): Promise<Shift> {
    const res = await fetch(`${API_BASE}/shifts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar turno');
    return res.json();
  },

  async deleteShift(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/shifts/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar turno');
  },

  // Schedules
  async getSchedules(startDate?: string, endDate?: string, collaboratorId?: string): Promise<Schedule[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (collaboratorId) params.append('collaboratorId', collaboratorId);

    const res = await fetch(`${API_BASE}/schedules?${params.toString()}`);
    if (!res.ok) throw new Error('Error al cargar asignaciones');
    return res.json();
  },

  async saveSchedule(collaboratorId: string, date: string, shiftId: string, notes?: string): Promise<Schedule | null> {
    const res = await fetch(`${API_BASE}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collaboratorId, date, shiftId, notes }),
    });
    if (!res.ok) throw new Error('Error al guardar horario');
    return res.json();
  },

  async copyWeek(fromWeekStart: string, toWeekStart: string): Promise<{ count: number; schedules: Schedule[] }> {
    const res = await fetch(`${API_BASE}/schedules/copy-week`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromWeekStart, toWeekStart }),
    });
    if (!res.ok) throw new Error('Error al copiar semana');
    return res.json();
  },

  async clearWeek(weekStart: string): Promise<void> {
    const res = await fetch(`${API_BASE}/schedules/clear-week`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekStart }),
    });
    if (!res.ok) throw new Error('Error al limpiar horarios de la semana');
  },

  // Departments
  async getDepartments(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/departments`);
    if (!res.ok) return [];
    return res.json();
  },

  // Stats
  async getStats(weekStart: string): Promise<WeeklyStats> {
    const res = await fetch(`${API_BASE}/stats?weekStart=${weekStart}`);
    if (!res.ok) throw new Error('Error al cargar estadísticas');
    return res.json();
  },

  // Reset
  async resetDemo(): Promise<void> {
    const res = await fetch(`${API_BASE}/reset-demo`, { method: 'POST' });
    if (!res.ok) throw new Error('Error al restablecer demo');
  },

  // Attendance (Fichajes y Marcaciones)
  async clockAttendance(params: {
    collaboratorId: string;
    pin?: string;
    type: PunchType;
    device?: string;
    notes?: string;
  }): Promise<{ punch: AttendancePunch; collaborator: Collaborator; summary: CollaboratorAttendanceStatus }> {
    const res = await fetch(`${API_BASE}/attendance/clock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al registrar marcación' }));
      throw new Error(err.error || 'Error al registrar marcación');
    }
    return res.json();
  },

  async getTodayAttendance(date?: string): Promise<CollaboratorAttendanceStatus[]> {
    const query = date ? `?date=${date}` : '';
    const res = await fetch(`${API_BASE}/attendance/today${query}`);
    if (!res.ok) throw new Error('Error al cargar asistencia del día');
    return res.json();
  },

  async getCollaboratorStatus(collaboratorId: string, date?: string): Promise<CollaboratorAttendanceStatus> {
    const query = date ? `?date=${date}` : '';
    const res = await fetch(`${API_BASE}/attendance/status/${collaboratorId}${query}`);
    if (!res.ok) throw new Error('Error al cargar estado del colaborador');
    return res.json();
  },

  async getAttendanceRecords(date?: string, collaboratorId?: string): Promise<AttendancePunch[]> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (collaboratorId) params.append('collaboratorId', collaboratorId);

    const res = await fetch(`${API_BASE}/attendance?${params.toString()}`);
    if (!res.ok) throw new Error('Error al cargar registros de asistencia');
    return res.json();
  },

  async deleteAttendancePunch(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/attendance/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar marcación');
  }
};
