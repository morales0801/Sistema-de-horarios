import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Copy, 
  Trash2, 
  Filter, 
  Search, 
  Info,
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Collaborator, Shift, Schedule } from '../types';
import { 
  getWeekDays, 
  formatDateIso, 
  formatDayHeader, 
  formatWeekRange 
} from '../utils/dateUtils';
import { addWeeks, subWeeks } from 'date-fns';

interface WeeklyGridProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  collaborators: Collaborator[];
  shifts: Shift[];
  schedules: Schedule[];
  departments: string[];
  onCellClick: (collaborator: Collaborator, dateStr: string) => void;
  onOpenCopyModal: () => void;
  onClearWeek: () => void;
}

export const WeeklyGrid: React.FC<WeeklyGridProps> = ({
  currentDate,
  onDateChange,
  collaborators,
  shifts,
  schedules,
  departments,
  onCellClick,
  onOpenCopyModal,
  onClearWeek,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const weekDays = getWeekDays(currentDate);
  const shiftMap = new Map(shifts.map(s => [s.id, s]));

  // Index schedules by "collabId-date"
  const scheduleMap = new Map<string, Schedule>();
  schedules.forEach(s => {
    scheduleMap.set(`${s.collaboratorId}-${s.date}`, s);
  });

  // Filter collaborators
  const filteredCollaborators = collaborators.filter(collab => {
    if (selectedDept !== 'all' && collab.department !== selectedDept) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = collab.name.toLowerCase().includes(q);
      const matchRole = collab.role.toLowerCase().includes(q);
      const matchDept = collab.department.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchDept) return false;
    }
    return true;
  });

  // Calculate stats per collaborator for this week
  const getCollabWeekStats = (collabId: string, targetHours: number) => {
    let totalHours = 0;
    let daysWorked = 0;

    weekDays.forEach(day => {
      const dateStr = formatDateIso(day);
      const sch = scheduleMap.get(`${collabId}-${dateStr}`);
      if (sch) {
        const shift = shiftMap.get(sch.shiftId);
        if (shift && !shift.isBreak && !shift.isLeave) {
          totalHours += shift.durationHours || 0;
          daysWorked++;
        }
      }
    });

    return {
      totalHours,
      daysWorked,
      targetHours,
      isOvertime: totalHours > targetHours,
      isUnder: totalHours < targetHours,
      isComplete: totalHours === targetHours
    };
  };

  // Calculate day coverage
  const getDayCoverage = (dateStr: string) => {
    let morningCount = 0;
    let afternoonCount = 0;
    let nightCount = 0;
    let offCount = 0;
    let totalWorking = 0;

    collaborators.forEach(collab => {
      const sch = scheduleMap.get(`${collab.id}-${dateStr}`);
      if (sch) {
        const shift = shiftMap.get(sch.shiftId);
        if (shift) {
          if (shift.id === 'shift-morning') morningCount++;
          else if (shift.id === 'shift-afternoon') afternoonCount++;
          else if (shift.id === 'shift-night') nightCount++;
          else if (shift.isBreak || shift.isLeave) offCount++;

          if (!shift.isBreak && !shift.isLeave) totalWorking++;
        }
      }
    });

    return { morningCount, afternoonCount, nightCount, offCount, totalWorking };
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        
        {/* Week navigation buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200/60">
            <button
              onClick={() => onDateChange(subWeeks(currentDate, 1))}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors shadow-2xs hover:shadow-xs"
              title="Semana anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDateChange(new Date())}
              className="px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-white rounded-lg transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={() => onDateChange(addWeeks(currentDate, 1))}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors shadow-2xs hover:shadow-xs"
              title="Semana siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/60 border border-blue-100 rounded-xl">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-900 capitalize">
              {formatWeekRange(currentDate)}
            </span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar colaborador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs px-3 py-2 pr-8 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium"
            >
              <option value="all">Todos los Departamentos</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Action: Copy Week */}
          <button
            onClick={onOpenCopyModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all shadow-2xs"
            title="Copiar turnos de otra semana"
          >
            <Copy className="w-3.5 h-3.5 text-blue-600" />
            <span>Copiar Semana</span>
          </button>

          {/* Action: Clear Week */}
          <button
            onClick={onClearWeek}
            className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all"
            title="Borrar todos los turnos de esta semana"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        </div>

      </div>

      {/* Main Grid Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {/* Collab column header */}
                <th className="py-3.5 px-4 min-w-[220px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                  Colaborador ({filteredCollaborators.length})
                </th>

                {/* 7 Days headers */}
                {weekDays.map((day) => {
                  const { dayName, dayNumber, isToday } = formatDayHeader(day);
                  return (
                    <th
                      key={day.toISOString()}
                      className={`py-3 px-2 text-center min-w-[130px] border-r border-slate-200/70 transition-colors ${
                        isToday ? 'bg-blue-50/70 text-blue-900 font-bold' : ''
                      }`}
                    >
                      <div className="capitalize text-xs tracking-normal">
                        {dayName}
                      </div>
                      <div className={`text-sm mt-0.5 inline-block px-2 py-0.5 rounded-full ${
                        isToday ? 'bg-blue-600 text-white font-bold' : 'text-slate-800 font-semibold'
                      }`}>
                        {dayNumber}
                      </div>
                    </th>
                  );
                })}

                {/* Total Hours Header */}
                <th className="py-3.5 px-4 text-center min-w-[110px]">
                  Horas Semanales
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCollaborators.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No se encontraron colaboradores con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredCollaborators.map((collab) => {
                  const stats = getCollabWeekStats(collab.id, collab.targetWeeklyHours);
                  return (
                    <tr 
                      key={collab.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      {/* Left: Collaborator Info */}
                      <td className="py-3 px-4 sticky left-0 bg-white group-hover:bg-slate-50/90 z-10 border-r border-slate-200 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs"
                            style={{ backgroundColor: collab.avatarColor || '#3b82f6' }}
                          >
                            {collab.name.charAt(0)}
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-semibold text-slate-900 truncate leading-tight">
                              {collab.name}
                            </div>
                            <div className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                              <span>{collab.role}</span>
                              <span>•</span>
                              <span className="text-slate-400">{collab.department}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 7 Day cells */}
                      {weekDays.map((day) => {
                        const dateStr = formatDateIso(day);
                        const sch = scheduleMap.get(`${collab.id}-${dateStr}`);
                        const shift = sch ? shiftMap.get(sch.shiftId) : null;
                        const { isToday } = formatDayHeader(day);

                        return (
                          <td
                            key={dateStr}
                            onClick={() => onCellClick(collab, dateStr)}
                            className={`py-2 px-2 text-center border-r border-slate-100 cursor-pointer transition-all relative ${
                              isToday ? 'bg-blue-50/20' : ''
                            } hover:bg-blue-50/40`}
                          >
                            {shift ? (
                              <div
                                className="p-2 rounded-xl text-left border shadow-2xs transition-transform hover:scale-[1.02] relative overflow-hidden"
                                style={{
                                  backgroundColor: shift.bgColor,
                                  borderColor: shift.borderColor,
                                  color: shift.textColor,
                                }}
                              >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="font-bold text-xs truncate">
                                    {shift.name}
                                  </span>
                                  <span 
                                    className="text-[10px] font-mono font-bold px-1 py-0.2 rounded"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
                                  >
                                    {shift.code}
                                  </span>
                                </div>

                                <div className="text-[11px] font-mono flex items-center gap-1 opacity-90">
                                  <Clock className="w-2.5 h-2.5 shrink-0" />
                                  <span>
                                    {shift.isBreak || shift.isLeave 
                                      ? (shift.isBreak ? 'Descanso' : 'Permiso') 
                                      : `${shift.startTime} - ${shift.endTime}`}
                                  </span>
                                </div>

                                {sch?.notes && (
                                  <div className="mt-1 text-[10px] truncate bg-white/70 px-1 py-0.5 rounded text-slate-700 font-sans" title={sch.notes}>
                                    💬 {sch.notes}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="h-14 rounded-xl border border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 flex items-center justify-center text-slate-300 hover:text-blue-500 transition-all">
                                <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Right: Hours & Compliance */}
                      <td className="py-3 px-3 text-center border-l border-slate-100">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1 font-semibold text-xs">
                            <span className={
                              stats.isOvertime ? 'text-amber-600 font-bold' : 
                              stats.isComplete ? 'text-emerald-600 font-bold' : 
                              'text-slate-700'
                            }>
                              {stats.totalHours}h
                            </span>
                            <span className="text-slate-400">/ {stats.targetHours}h</span>
                          </div>

                          {/* Mini Progress Bar */}
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                            <div
                              className={`h-full rounded-full transition-all ${
                                stats.isOvertime ? 'bg-amber-500' :
                                stats.isComplete ? 'bg-emerald-500' :
                                'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(100, (stats.totalHours / stats.targetHours) * 100)}%` }}
                            />
                          </div>

                          <div className="mt-1 text-[10px]">
                            {stats.isOvertime && (
                              <span className="text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" /> +{stats.totalHours - stats.targetHours}h
                              </span>
                            )}
                            {stats.isComplete && (
                              <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Completo
                              </span>
                            )}
                            {stats.isUnder && (
                              <span className="text-slate-500 font-medium bg-slate-50 px-1.5 py-0.5 rounded">
                                -{stats.targetHours - stats.totalHours}h
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Coverage Summary Footer */}
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200 text-xs">
                <td className="py-3 px-4 font-bold text-slate-700 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>Personal en Turno</span>
                  </div>
                </td>

                {weekDays.map(day => {
                  const dateStr = formatDateIso(day);
                  const cov = getDayCoverage(dateStr);
                  const { isToday } = formatDayHeader(day);

                  return (
                    <td 
                      key={dateStr} 
                      className={`py-2 px-2 text-center border-r border-slate-200 ${isToday ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="text-xs font-bold text-slate-800">
                        {cov.totalWorking} activos
                      </div>
                      <div className="text-[10px] text-slate-500 flex justify-center gap-1.5 mt-0.5">
                        <span title="Mañana" className="text-sky-700 font-medium">M:{cov.morningCount}</span>
                        <span title="Tarde" className="text-amber-700 font-medium">T:{cov.afternoonCount}</span>
                        <span title="Noche" className="text-purple-700 font-medium">N:{cov.nightCount}</span>
                      </div>
                    </td>
                  );
                })}

                <td className="py-3 px-3 text-center text-xs font-bold text-slate-600">
                  Resumen
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
