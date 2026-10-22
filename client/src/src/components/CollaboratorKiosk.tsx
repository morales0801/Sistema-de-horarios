import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Coffee, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Laptop, 
  ArrowLeft,
  Calendar,
  Lock,
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { Collaborator, CollaboratorAttendanceStatus, PunchType } from '../types';
import { api } from '../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CollaboratorKioskProps {
  collaborators: Collaborator[];
  onBackToAdmin?: () => void;
}

export const CollaboratorKiosk: React.FC<CollaboratorKioskProps> = ({
  collaborators,
  onBackToAdmin,
}) => {
  // Current time ticker
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Selected collaborator (persisted in localStorage for dedicated PC)
  const [selectedCollabId, setSelectedCollabId] = useState<string>(() => {
    return localStorage.getItem('shiftflow_kiosk_collab_id') || '';
  });

  const [pinInput, setPinInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<CollaboratorAttendanceStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedCollab = collaborators.find(c => c.id === selectedCollabId) || null;

  // Load collaborator day status whenever selected
  const fetchStatus = async (collabId: string) => {
    if (!collabId) return;
    setLoadingStatus(true);
    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const data = await api.getCollaboratorStatus(collabId, todayStr);
      setStatus(data);
    } catch (err) {
      console.error('Error fetching collaborator status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (selectedCollabId) {
      fetchStatus(selectedCollabId);
      localStorage.setItem('shiftflow_kiosk_collab_id', selectedCollabId);
    }
  }, [selectedCollabId]);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleClock = async (type: PunchType) => {
    if (!selectedCollab) return;

    // Check PIN if collaborator has one
    if (selectedCollab.pin && selectedCollab.pin !== pinInput && pinInput.length > 0) {
      showFeedback('PIN de seguridad incorrecto', 'error');
      return;
    }

    const now = new Date();
    const localDate = format(now, 'yyyy-MM-dd');
    const localTime = format(now, 'HH:mm:ss');

    setIsSubmitting(true);
    try {
      const res = await api.clockAttendance({
        collaboratorId: selectedCollab.id,
        pin: pinInput || selectedCollab.pin,
        type,
        device: navigator.userAgent.includes('Windows') ? 'PC Windows (App Colaborador)' : 'Terminal Colaborador',
        notes: notes.trim(),
        clientDate: localDate,
        clientTime: localTime
      });

      setStatus(res.summary);
      setNotes('');
      setPinInput('');

      const typeLabel = 
        type === 'in' ? 'Entrada registrada' :
        type === 'out' ? 'Salida registrada' :
        type === 'break_start' ? 'Inicio de pausa registrado' : 'Reanudación de turno registrada';

      showFeedback(`¡${typeLabel} a las ${res.punch.time}!`);
    } catch (err: any) {
      showFeedback(err.message || 'Error al registrar marcación', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetCollab = () => {
    setSelectedCollabId('');
    setStatus(null);
    setPinInput('');
    localStorage.removeItem('shiftflow_kiosk_collab_id');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600">
      
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-slate-700/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">ShiftFlow</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Terminal de Marcación
              </span>
            </div>
            <p className="text-xs text-slate-400">Punto de marcación de asistencia para colaboradores</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Administración</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center py-6 max-w-2xl w-full mx-auto">
        
        {/* Live Clock Display */}
        <div className="text-center mb-6">
          <div className="font-mono text-5xl sm:text-7xl font-extrabold tracking-tight text-white drop-shadow-md">
            {format(currentTime, 'HH:mm:ss')}
          </div>
          <p className="text-sm sm:text-base text-slate-400 capitalize mt-1 flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            {format(currentTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div className="w-full mb-4 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold border shadow-lg ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          </div>
        )}

        {/* Card for User Selection or Punching */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl border border-slate-700/80 p-6 sm:p-8 w-full shadow-2xl relative overflow-hidden">
          
          {!selectedCollab ? (
            /* STEP 1: Select Collaborator */
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-white">¿Quién está en esta computadora?</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Selecciona tu nombre. Se guardará en este equipo para tus próximas marcaciones.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {collaborators.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCollabId(c.id)}
                    className="p-3 bg-slate-900/60 hover:bg-slate-700/80 border border-slate-700 hover:border-blue-500/60 rounded-2xl flex items-center gap-3 transition-all text-left group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                      style={{ backgroundColor: c.avatarColor }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="font-semibold text-sm text-slate-200 group-hover:text-white truncate">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {c.role} • {c.department}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* STEP 2: Collaborator Clock Dashboard */
            <div className="space-y-6">
              
              {/* User Profile Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                    style={{ backgroundColor: selectedCollab.avatarColor }}
                  >
                    {selectedCollab.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">
                      {selectedCollab.name}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {selectedCollab.role} • <span className="text-blue-400">{selectedCollab.department}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleResetCollab}
                  className="text-xs text-slate-400 hover:text-slate-200 bg-slate-700/50 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-600 transition-colors flex items-center gap-1.5"
                  title="Cambiar de usuario en este equipo"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Cambiar</span>
                </button>
              </div>

              {/* Status and Scheduled Shift Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Today's Shift */}
                <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Turno Programado Hoy
                  </span>
                  {status?.shift ? (
                    <div>
                      <div className="font-bold text-sm text-slate-200 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.shift.color }} />
                        <span>{status.shift.name}</span>
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-1">
                        {status.shift.isBreak || status.shift.isLeave 
                          ? (status.shift.isBreak ? 'Día Libre' : 'Permiso/Vacaciones')
                          : `${status.shift.startTime} - ${status.shift.endTime} (${status.shift.durationHours}h)`
                        }
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">Sin turno programado para hoy</div>
                  )}
                </div>

                {/* Current State */}
                <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Estado en Tiempo Real
                  </span>
                  <div className="flex items-center gap-2">
                    {status?.currentState === 'working' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        TRABAJANDO
                      </span>
                    )}
                    {status?.currentState === 'on_break' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <Coffee className="w-3.5 h-3.5 text-amber-400" />
                        EN PAUSA / ALMUERZO
                      </span>
                    )}
                    {status?.currentState === 'left' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        TURNO FINALIZADO
                      </span>
                    )}
                    {status?.currentState === 'not_arrived' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        POR INGRESAR
                      </span>
                    )}
                    {status?.currentState === 'off' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-400">
                        DÍA LIBRE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-2">
                    <span>Horas hoy: <strong className="text-white font-mono">{status?.totalWorkedHours || 0}h</strong></span>
                    {status?.punctuality && (
                      <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                        status.punctuality === 'A tiempo' ? 'text-emerald-400 bg-emerald-950/60' : 'text-amber-400 bg-amber-950/60'
                      }`}>
                        {status.punctuality}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Big Punch Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                
                {/* MARCAR ENTRADA */}
                <button
                  type="button"
                  disabled={isSubmitting || status?.currentState === 'working' || status?.currentState === 'on_break'}
                  onClick={() => handleClock('in')}
                  className="py-4 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-emerald-900/30 flex flex-col items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <LogIn className="w-6 h-6" />
                  <span className="text-sm">MARCAR ENTRADA</span>
                </button>

                {/* MARCAR SALIDA */}
                <button
                  type="button"
                  disabled={isSubmitting || status?.currentState !== 'working'}
                  onClick={() => handleClock('out')}
                  className="py-4 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:hover:bg-rose-600 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-rose-900/30 flex flex-col items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <LogOut className="w-6 h-6" />
                  <span className="text-sm">MARCAR SALIDA</span>
                </button>

                {/* INICIAR PAUSA / ALMUERZO */}
                <button
                  type="button"
                  disabled={isSubmitting || status?.currentState !== 'working'}
                  onClick={() => handleClock('break_start')}
                  className="py-3 px-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-30 disabled:hover:bg-amber-600 disabled:cursor-not-allowed text-white font-semibold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all text-xs"
                >
                  <Coffee className="w-4 h-4" />
                  <span>INICIAR PAUSA / ALMUERZO</span>
                </button>

                {/* REANUDAR TURNO */}
                <button
                  type="button"
                  disabled={isSubmitting || status?.currentState !== 'on_break'}
                  onClick={() => handleClock('break_end')}
                  className="py-3 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 disabled:cursor-not-allowed text-white font-semibold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all text-xs"
                >
                  <Play className="w-4 h-4" />
                  <span>REANUDAR TRABAJO</span>
                </button>

              </div>

              {/* Optional Notes */}
              <div>
                <input
                  type="text"
                  placeholder="Nota u observación opcional (ej. Retraso justificado, cambio de equipo...)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Today's Punches History */}
              {status?.punches && status.punches.length > 0 && (
                <div className="pt-2 border-t border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Tus Marcaciones de Hoy ({status.punches.length})
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {status.punches.map((p) => (
                      <div
                        key={p.id}
                        className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            p.type === 'in' ? 'bg-emerald-400' :
                            p.type === 'out' ? 'bg-rose-400' :
                            p.type === 'break_start' ? 'bg-amber-400' : 'bg-blue-400'
                          }`} />
                          <span className="font-sans font-semibold text-slate-200">
                            {p.type === 'in' ? 'ENTRADA' :
                             p.type === 'out' ? 'SALIDA' :
                             p.type === 'break_start' ? 'INICIO PAUSA' : 'FIN PAUSA'}
                          </span>
                        </div>
                        <span className="text-slate-400">{p.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      {/* Footer Info */}
      <footer className="text-center text-xs text-slate-500 pt-3 border-t border-slate-800">
        Dispositivo: <span className="text-slate-400 font-mono">PC Windows (ShiftFlow Kiosk)</span> • Todas las marcaciones se sincronizan en tiempo real con el panel administrativo.
      </footer>
    </div>
  );
};
