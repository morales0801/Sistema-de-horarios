import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  LogIn, 
  LogOut, 
  Coffee, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  Download, 
  Search, 
  Filter, 
  Trash2,
  Plus,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { Collaborator, CollaboratorAttendanceStatus, AttendancePunch, PunchType } from '../types';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface AttendanceAdminViewProps {
  todayStatuses: CollaboratorAttendanceStatus[];
  allPunches: AttendancePunch[];
  collaborators: Collaborator[];
  departments: string[];
  currentDateStr: string;
  onDateChange: (dateStr: string) => void;
  onRefresh: () => void;
  onOpenKiosk: () => void;
  onManualPunch: (collaboratorId: string, type: PunchType, notes?: string) => Promise<void>;
  onDeletePunch: (id: string) => Promise<void>;
  onExportCsv: () => void;
}

export const AttendanceAdminView: React.FC<AttendanceAdminViewProps> = ({
  todayStatuses,
  allPunches,
  collaborators,
  departments,
  currentDateStr,
  onDateChange,
  onRefresh,
  onOpenKiosk,
  onManualPunch,
  onDeletePunch,
  onExportCsv,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'presence' | 'log'>('presence');

  // Manual Punch Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualCollabId, setManualCollabId] = useState<string>(collaborators[0]?.id || '');
  const [manualType, setManualType] = useState<PunchType>('in');
  const [manualNotes, setManualNotes] = useState<string>('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Counters
  const workingNow = todayStatuses.filter(s => s.currentState === 'working');
  const onBreakNow = todayStatuses.filter(s => s.currentState === 'on_break');
  const finishedToday = todayStatuses.filter(s => s.currentState === 'left');
  const notArrived = todayStatuses.filter(s => s.currentState === 'not_arrived');

  const parsedCurrentDate = parseISO(currentDateStr);
  const formattedDisplayDate = format(parsedCurrentDate, "EEEE, d 'de' MMMM yyyy", { locale: es });

  const handlePrevDay = () => {
    const prev = subDays(parsedCurrentDate, 1);
    onDateChange(format(prev, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    const next = addDays(parsedCurrentDate, 1);
    onDateChange(format(next, 'yyyy-MM-dd'));
  };

  const handleToday = () => {
    onDateChange(format(new Date(), 'yyyy-MM-dd'));
  };

  const filteredStatuses = todayStatuses.filter(s => {
    if (selectedDept !== 'all' && s.collaborator.department !== selectedDept) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.collaborator.name.toLowerCase().includes(q) ||
        s.collaborator.role.toLowerCase().includes(q) ||
        s.collaborator.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const collabMap = new Map(collaborators.map(c => [c.id, c]));

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCollabId) return;
    setIsSubmittingManual(true);
    try {
      await onManualPunch(manualCollabId, manualType, manualNotes.trim() || 'Marcación manual por administrador');
      setIsManualModalOpen(false);
      setManualNotes('');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              Control de Asistencia y Fichajes en Tiempo Real
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              En Vivo
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Monitorea el ingreso, salida y pausas de los colaboradores registrados desde sus computadoras
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-colors"
            title="Actualizar marcaciones ahora"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </button>

          {/* Open Kiosk App Button */}
          <button
            onClick={onOpenKiosk}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
            title="Abrir la pantalla de marcación que usan los colaboradores"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Abrir App de Marcación</span>
          </button>

          {/* Manual punch */}
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Marcación Manual</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Date Navigation Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200/60">
            <button
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors shadow-2xs hover:shadow-xs"
              title="Día anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-white rounded-lg transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors shadow-2xs hover:shadow-xs"
              title="Día siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/60 border border-blue-100 rounded-xl">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs sm:text-sm font-semibold text-blue-900 capitalize">
              {formattedDisplayDate}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Seleccionar fecha:</span>
          <input
            type="date"
            value={currentDateStr}
            onChange={(e) => e.target.value && onDateChange(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-mono"
          />
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Trabajando Ahora
            </span>
            <div className="text-2xl font-bold text-emerald-600 mt-1 flex items-center gap-2">
              <span>{workingNow.length}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">En puesto de trabajo</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <LogIn className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              En Pausa / Almuerzo
            </span>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {onBreakNow.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Pausa temporal</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Coffee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Jornada Terminada
            </span>
            <div className="text-2xl font-bold text-slate-700 mt-1">
              {finishedToday.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Marcaron salida</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Por Ingresar
            </span>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {notArrived.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Tienen turno hoy</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* View Switcher and Filters */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Subtabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('presence')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'presence'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tablero de Presencia ({filteredStatuses.length})
          </button>
          <button
            onClick={() => setActiveSubTab('log')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'log'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Registro de Fichajes de Hoy ({allPunches.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar colaborador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium"
          >
            <option value="all">Todos los Deptos.</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SUBTAB 1: PRESENCE CARDS */}
      {activeSubTab === 'presence' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStatuses.map((st) => {
            const { collaborator, shift, currentState, firstInTime, lastOutTime, totalWorkedHours, punctuality, delayMinutes } = st;

            return (
              <div
                key={collaborator.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top user row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                        style={{ backgroundColor: collaborator.avatarColor }}
                      >
                        {collaborator.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight">
                          {collaborator.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {collaborator.role} • {collaborator.department}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {currentState === 'working' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          En Turno
                        </span>
                      )}
                      {currentState === 'on_break' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Coffee className="w-3 h-3" />
                          En Pausa
                        </span>
                      )}
                      {currentState === 'left' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <CheckCircle2 className="w-3 h-3 text-slate-500" />
                          Finalizado
                        </span>
                      )}
                      {currentState === 'not_arrived' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Por Llegar
                        </span>
                      )}
                      {currentState === 'off' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                          Día Libre
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scheduled Shift Info */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1 mb-3">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Turno Programado:</span>
                      <span className="font-semibold text-slate-800">
                        {shift ? shift.name : 'Sin turno'}
                      </span>
                    </div>
                    {shift && !shift.isBreak && !shift.isLeave && (
                      <div className="flex items-center justify-between font-mono text-slate-500 text-[11px]">
                        <span>Horario previsto:</span>
                        <span>{shift.startTime} - {shift.endTime}</span>
                      </div>
                    )}
                  </div>

                  {/* Punch timestamps */}
                  <div className="space-y-1 text-xs text-slate-600 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Entrada real:</span>
                      <span className="font-semibold text-slate-800">{firstInTime || '--:--:--'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Salida real:</span>
                      <span className="font-semibold text-slate-800">{lastOutTime || '--:--:--'}</span>
                    </div>
                  </div>
                </div>

                {/* Card footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    {punctuality === 'A tiempo' && (
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Puntual
                      </span>
                    )}
                    {delayMinutes > 5 && (
                      <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        ⚠ Retraso: +{delayMinutes}m
                      </span>
                    )}
                    {currentState === 'not_arrived' && (
                      <span className="text-slate-400">Pendiente de ingreso</span>
                    )}
                  </div>

                  <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg font-mono">
                    {totalWorkedHours}h trabajadas
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUBTAB 2: RAW PUNCHES LOG TABLE */}
      {activeSubTab === 'log' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Hora</th>
                  <th className="py-3 px-4">Colaborador</th>
                  <th className="py-3 px-4">Tipo de Marcación</th>
                  <th className="py-3 px-4">Dispositivo</th>
                  <th className="py-3 px-4">Notas / Observaciones</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {allPunches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No hay registros de marcaciones para hoy todavía.
                    </td>
                  </tr>
                ) : (
                  allPunches.map(p => {
                    const c = collabMap.get(p.collaboratorId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {p.time}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{c?.name || 'Desconocido'}</div>
                          <div className="text-[11px] text-slate-500">{c?.role} • {c?.department}</div>
                        </td>
                        <td className="py-3 px-4">
                          {p.type === 'in' && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                              Entrada
                            </span>
                          )}
                          {p.type === 'out' && (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
                              Salida
                            </span>
                          )}
                          {p.type === 'break_start' && (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                              Inicio Pausa
                            </span>
                          )}
                          {p.type === 'break_end' && (
                            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                              Fin Pausa
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {p.device || 'PC Windows'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {p.notes || <span className="text-slate-300 italic">Sin notas</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm('¿Eliminar esta marcación?')) {
                                onDeletePunch(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar marcación"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Punch Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                Registrar Marcación Manual
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Colaborador *
                </label>
                <select
                  value={manualCollabId}
                  onChange={(e) => setManualCollabId(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  {collaborators.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Marcación *
                </label>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value as PunchType)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="in">🟢 Entrada</option>
                  <option value="out">🔴 Salida</option>
                  <option value="break_start">☕ Inicio de Pausa / Almuerzo</option>
                  <option value="break_end">🔄 Fin de Pausa / Reanudación</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo / Observación
                </label>
                <input
                  type="text"
                  placeholder="Ej. Olvido de fichaje, falla de internet..."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Guardar Marcación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
