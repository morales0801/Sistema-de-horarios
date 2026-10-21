export interface Collaborator {
  id: string;
  code?: string;
  pin?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  avatarColor: string;
  targetWeeklyHours: number;
  active: boolean;
}

export interface Shift {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  isBreak: boolean;
  isLeave: boolean;
}

export interface Schedule {
  id: string;
  collaboratorId: string;
  date: string; // YYYY-MM-DD
  shiftId: string;
  notes?: string;
}

export interface CollaboratorStat {
  collaboratorId: string;
  name: string;
  targetHours: number;
  scheduledHours: number;
  diffHours: number;
  workedDays: number;
  offDays: number;
  leaveDays: number;
  isOvertime: boolean;
  isUnder: boolean;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalHoursScheduled: number;
  collaboratorStats: CollaboratorStat[];
}

export type PunchType = 'in' | 'out' | 'break_start' | 'break_end';

export interface AttendancePunch {
  id: string;
  collaboratorId: string;
  date: string;
  type: PunchType;
  timestamp: string;
  time: string;
  device?: string;
  notes?: string;
}

export interface CollaboratorAttendanceStatus {
  collaborator: Collaborator;
  date: string;
  schedule?: Schedule | null;
  shift?: Shift | null;
  punches: AttendancePunch[];
  currentState: 'not_arrived' | 'working' | 'on_break' | 'left' | 'off';
  firstInTime: string | null;
  lastOutTime: string | null;
  totalWorkedHours: number;
  totalWorkedMinutes: number;
  punctuality: string;
  delayMinutes: number;
}
