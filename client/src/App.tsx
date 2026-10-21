import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { WeeklyGrid } from './components/WeeklyGrid';
import { MonthlyView } from './components/MonthlyView';
import { CollaboratorsView } from './components/CollaboratorsView';
import { ShiftsView } from './components/ShiftsView';
import { StatsReportView } from './components/StatsReportView';
import { AttendanceAdminView } from './components/AttendanceAdminView';
import { CollaboratorKiosk } from './components/CollaboratorKiosk';
import { ShiftPickerModal } from './components/ShiftPickerModal';
import { CopyWeekModal } from './components/CopyWeekModal';
import { api } from './services/api';
import { 
  Collaborator, 
  Shift, 
  Schedule, 
  WeeklyStats, 
  CollaboratorAttendanceStatus, 
  AttendancePunch, 
  PunchType 
} from './types';
import { getWeekDays, formatDateIso } from './utils/dateUtils';
import { startOfWeek, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('weekly');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Check if opened as dedicated employee kiosk via URL ?mode=kiosk or ?kiosk=true
  const [isKioskMode, setIsKioskMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'kiosk' || params.get('kiosk') === 'true';
  });

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [stats, setStats] = useState<WeeklyStats | null>(null);

  // Attendance state
  const [todayAttendance, setTodayAttendance] = useState<CollaboratorAttendanceStatus[]>([]);
  const [todayPunches, setTodayPunches] = useState<AttendancePunch[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Shift Picker Modal State
  const [pickerModal, setPickerModal] = useState<{
    isOpen: boolean;
    collaborator: Collaborator | null;
    dateStr: string;
    currentSchedule: Schedule | null;
  }>({
    isOpen: false,
    collaborator: null,
    dateStr: '',
    currentSchedule: null,
  });

  // Copy Week Modal State
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load initial reference data
  const loadReferenceData = async () => {
    try {
      const [collabs, shs, depts] = await Promise.all([
        api.getCollaborators(),
        api.getShifts(),
        api.getDepartments(),
      ]);
      setCollaborators(collabs);
      setShifts(shs);
      setDepartments(depts);
    } catch (err: any) {
      console.error('Error cargando datos iniciales:', err);
      showToast('Error al conectar con el servidor', 'error');
    }
  };

  // Load schedules and stats
  const loadScheduleData = useCallback(async () => {
    try {
      const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekStartStr = format(monday, 'yyyy-MM-dd');
      
      const [scheds, weekStats] = await Promise.all([
        api.getSchedules(),
        api.getStats(weekStartStr),
      ]);

      setSchedules(scheds);
      setStats(weekStats);
    } catch (err: any) {
      console.error('Error cargando horarios:', err);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  // Load attendance data
  const loadAttendanceData = useCallback(async () => {
    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const [summary, punches] = await Promise.all([
        api.getTodayAttendance(todayStr),
        api.getAttendanceRecords(todayStr),
      ]);
      setTodayAttendance(summary);
      setTodayPunches(punches);
    } catch (err) {
      console.error('Error cargando asistencia:', err);
    }
  }, []);

  useEffect(() => {
    loadReferenceData();
    loadAttendanceData();
  }, [loadAttendanceData]);

  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  // Open Shift Picker on cell click
  const handleCellClick = (collaborator: Collaborator, dateStr: string) => {
    const existing = schedules.find(
      s => s.collaboratorId === collaborator.id && s.date === dateStr
    ) || null;

    setPickerModal({
      isOpen: true,
      collaborator,
      dateStr,
      currentSchedule: existing,
    });
  };

  // Save Shift
  const handleSaveShift = async (shiftId: string, notes: string) => {
    if (!pickerModal.collaborator) return;
    try {
      await api.saveSchedule(
        pickerModal.collaborator.id,
        pickerModal.dateStr,
        shiftId,
        notes
      );
      await loadScheduleData();
      await loadAttendanceData();
      showToast('Turno asignado correctamente');
    } catch (err: any) {
      showToast(err.message || 'Error al guardar el turno', 'error');
    }
  };

  // Delete Shift
  const handleDeleteShift = async () => {
    if (!pickerModal.collaborator) return;
    try {
      await api.saveSchedule(
        pickerModal.collaborator.id,
        pickerModal.dateStr,
        'none'
      );
      await loadScheduleData();
      await loadAttendanceData();
      showToast('Turno quitado');
    } catch (err: any) {
      showToast('Error al quitar el turno', 'error');
    }
  };

  // Copy Week
  const handleCopyWeek = async (fromWeekStart: string, toWeekStart: string) => {
    try {
      const res = await api.copyWeek(fromWeekStart, toWeekStart);
      await loadScheduleData();
      showToast(`¡${res.count} turnos copiados con éxito!`);
    } catch (err: any) {
      showToast(err.message || 'Error al copiar la semana', 'error');
      throw err;
    }
  };

  // Clear Week
  const handleClearWeek = async () => {
    const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekStartStr = format(monday, 'yyyy-MM-dd');
    if (window.confirm('¿Seguro que deseas borrar todos los turnos asignados en esta semana?')) {
      try {
        await api.clearWeek(weekStartStr);
        await loadScheduleData();
        showToast('Horarios de la semana eliminados');
      } catch (err: any) {
        showToast('Error al limpiar horarios', 'error');
      }
    }
  };

  // Attendance Handlers
  const handleManualPunch = async (collaboratorId: string, type: PunchType, notes?: string) => {
    try {
      await api.clockAttendance({
        collaboratorId,
        type,
        device: 'Panel Administrador (Manual)',
        notes: notes || 'Marcación manual por supervisor'
      });
      await loadAttendanceData();
      showToast('Marcación manual registrada correctamente');
    } catch (err: any) {
      showToast(err.message || 'Error al registrar marcación', 'error');
    }
  };

  const handleDeletePunch = async (id: string) => {
    try {
      await api.deleteAttendancePunch(id);
      await loadAttendanceData();
      showToast('Marcación eliminada');
    } catch (err: any) {
      showToast('Error al eliminar marcación', 'error');
    }
  };

  const handleExportAttendanceCsv = () => {
    const collabMap = new Map(collaborators.map(c => [c.id, c]));
    const headers = ['Hora', 'Colaborador', 'Departamento', 'Cargo', 'Tipo de Marcación', 'Dispositivo', 'Notas'];

    const rows = todayPunches.map(p => {
      const c = collabMap.get(p.collaboratorId);
      const typeLabel = 
        p.type === 'in' ? 'Entrada' :
        p.type === 'out' ? 'Salida' :
        p.type === 'break_start' ? 'Inicio Pausa' : 'Fin Pausa';

      return [
        `"${p.time}"`,
        `"${c?.name || 'Desconocido'}"`,
        `"${c?.department || ''}"`,
        `"${c?.role || ''}"`,
        `"${typeLabel}"`,
        `"${p.device || 'PC Windows'}"`,
        `"${p.notes || ''}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `asistencia_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Reporte de asistencia descargado con éxito');
  };

  // Collaborators CRUD handlers
  const handleCreateCollaborator = async (data: Partial<Collaborator>) => {
    const created = await api.createCollaborator(data);
    setCollaborators(prev => [...prev, created]);
    const depts = await api.getDepartments();
    setDepartments(depts);
    showToast('Colaborador creado con éxito');
  };

  const handleUpdateCollaborator = async (id: string, data: Partial<Collaborator>) => {
    const updated = await api.updateCollaborator(id, data);
    setCollaborators(prev => prev.map(c => c.id === id ? updated : c));
    const depts = await api.getDepartments();
    setDepartments(depts);
    showToast('Colaborador actualizado');
  };

  const handleDeleteCollaborator = async (id: string) => {
    await api.deleteCollaborator(id);
    setCollaborators(prev => prev.filter(c => c.id !== id));
    await loadScheduleData();
    await loadAttendanceData();
    showToast('Colaborador eliminado');
  };

  // Shifts CRUD handlers
  const handleCreateShift = async (data: Partial<Shift>) => {
    const created = await api.createShift(data);
    setShifts(prev => [...prev, created]);
    showToast('Tipo de turno creado');
  };

  const handleUpdateShift = async (id: string, data: Partial<Shift>) => {
    const updated = await api.updateShift(id, data);
    setShifts(prev => prev.map(s => s.id === id ? updated : s));
    showToast('Turno actualizado');
  };

  const handleDeleteShiftType = async (id: string) => {
    await api.deleteShift(id);
    setShifts(prev => prev.filter(s => s.id !== id));
    await loadScheduleData();
    showToast('Turno eliminado');
  };

  // Reset Demo Data
  const handleResetDemo = async () => {
    if (window.confirm('¿Deseas restablecer todos los colaboradores, turnos, horarios y registros de asistencia?')) {
      try {
        await api.resetDemo();
        await loadReferenceData();
        await loadScheduleData();
        await loadAttendanceData();
        showToast('Datos de demostración restablecidos');
      } catch (err: any) {
        showToast('Error al restablecer demo', 'error');
      }
    }
  };

  // Print schedule
  const handlePrint = () => {
    window.print();
  };

  // Export CSV Schedule
  const handleExportCsv = () => {
    const weekDays = getWeekDays(currentDate);
    const shiftMap = new Map(shifts.map(s => [s.id, s]));
    const scheduleMap = new Map<string, Schedule>();
    schedules.forEach(s => scheduleMap.set(`${s.collaboratorId}-${s.date}`, s));

    const headers = [
      'Colaborador',
      'Departamento',
      'Cargo',
      ...weekDays.map(d => format(d, 'EEEE d MMM', { locale: es })),
      'Horas Totales',
      'Objetivo Semanal'
    ];

    const rows = collaborators.map(collab => {
      let totalHours = 0;
      const dayValues = weekDays.map(d => {
        const dateStr = formatDateIso(d);
        const sch = scheduleMap.get(`${collab.id}-${dateStr}`);
        if (!sch) return 'Libre / Sin turno';
        const shift = shiftMap.get(sch.shiftId);
        if (!shift) return 'Sin turno';
        if (!shift.isBreak && !shift.isLeave) {
          totalHours += shift.durationHours;
        }
        return `${shift.name} (${shift.isBreak || shift.isLeave ? shift.code : `${shift.startTime}-${shift.endTime}`})`;
      });

      return [
        `"${collab.name}"`,
        `"${collab.department}"`,
        `"${collab.role}"`,
        ...dayValues.map(v => `"${v}"`),
        totalHours,
        collab.targetWeeklyHours
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `horarios_${format(currentDate, 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo CSV descargado con éxito');
  };

  // Count active working collaborators right now
  const workingNowCount = todayAttendance.filter(s => s.currentState === 'working').length;

  // IF IN DEDICATED COLLABORATOR KIOSK MODE
  if (isKioskMode) {
    return (
      <CollaboratorKiosk
        collaborators={collaborators}
        onBackToAdmin={() => {
          setIsKioskMode(false);
          // clean URL search param if present
          window.history.pushState({}, '', window.location.pathname);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold ${
            toast.type === 'success' 
              ? 'bg-slate-900 text-white border border-slate-700' 
              : 'bg-rose-600 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeCollaboratorsCount={workingNowCount}
        onPrint={handlePrint}
        onExportCsv={handleExportCsv}
        onResetDemo={handleResetDemo}
        onOpenKiosk={() => setIsKioskMode(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-500">Cargando sistema de horarios y asistencia...</p>
          </div>
        ) : (
          <>
            {activeTab === 'weekly' && (
              <WeeklyGrid
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                collaborators={collaborators}
                shifts={shifts}
                schedules={schedules}
                departments={departments}
                onCellClick={handleCellClick}
                onOpenCopyModal={() => setIsCopyModalOpen(true)}
                onClearWeek={handleClearWeek}
              />
            )}

            {activeTab === 'monthly' && (
              <MonthlyView
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                collaborators={collaborators}
                shifts={shifts}
                schedules={schedules}
                onCellClick={handleCellClick}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceAdminView
                todayStatuses={todayAttendance}
                allPunches={todayPunches}
                collaborators={collaborators}
                departments={departments}
                onOpenKiosk={() => setIsKioskMode(true)}
                onManualPunch={handleManualPunch}
                onDeletePunch={handleDeletePunch}
                onExportCsv={handleExportAttendanceCsv}
              />
            )}

            {activeTab === 'collaborators' && (
              <CollaboratorsView
                collaborators={collaborators}
                departments={departments}
                onCreate={handleCreateCollaborator}
                onUpdate={handleUpdateCollaborator}
                onDelete={handleDeleteCollaborator}
              />
            )}

            {activeTab === 'shifts' && (
              <ShiftsView
                shifts={shifts}
                onCreate={handleCreateShift}
                onUpdate={handleUpdateShift}
                onDelete={handleDeleteShiftType}
              />
            )}

            {activeTab === 'stats' && (
              <StatsReportView
                currentDate={currentDate}
                stats={stats}
                collaborators={collaborators}
                onExportCsv={handleExportCsv}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <ShiftPickerModal
        isOpen={pickerModal.isOpen}
        onClose={() => setPickerModal(prev => ({ ...prev, isOpen: false }))}
        collaborator={pickerModal.collaborator}
        dateStr={pickerModal.dateStr}
        currentSchedule={pickerModal.currentSchedule}
        shifts={shifts}
        onSave={handleSaveShift}
        onDelete={handleDeleteShift}
      />

      <CopyWeekModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        currentWeekStart={currentDate}
        onCopy={handleCopyWeek}
      />
    </div>
  );
}

export default App;
