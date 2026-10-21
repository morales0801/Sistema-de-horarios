import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  X,
  Plus
} from 'lucide-react';
import { Collaborator, Shift, Schedule } from '../types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addMonths, 
  subMonths, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay 
} from 'date-fns';
import { es } from 'date-fns/locale';

interface MonthlyViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  collaborators: Collaborator[];
  shifts: Shift[];
  schedules: Schedule[];
  onCellClick: (collaborator: Collaborator, dateStr: string) => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  currentDate,
  onDateChange,
  collaborators,
  shifts,
  schedules,
  onCellClick,
}) => {
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const shiftMap = new Map(shifts.map(s => [s.id, s]));
  const collabMap = new Map(collaborators.map(c => [c.id, c]));

  // Schedules grouped by date
  const schedulesByDate = new Map<string, Schedule[]>();
  schedules.forEach(s => {
    const list = schedulesByDate.get(s.date) || [];
    list.push(s);
    schedulesByDate.set(s.date, list);
  });

  const getDaySummary = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const daySchedules = schedulesByDate.get(dateStr) || [];
    let working = 0;
    let off = 0;

    daySchedules.forEach(s => {
      const shift = shiftMap.get(s.shiftId);
      if (shift) {
        if (shift.isBreak || shift.isLeave) off++;
        else working++;
      }
    });

    return { daySchedules, working, off, total: daySchedules.length };
  };

  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="space-y-4">
      {/* Month Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200/60">
            <button
              onClick={() => onDateChange(subMonths(currentDate, 1))}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors"
              title="Mes anterior"
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
              onClick={() => onDateChange(addMonths(currentDate, 1))}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/60 border border-blue-100 rounded-xl">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-900 capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Haz clic en cualquier día para ver la lista de turnos programados.
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-500 text-center">
          {dayNames.map(d => (
            <div key={d} className="py-2.5">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const { daySchedules, working, off } = getDaySummary(day);
            const isSelected = selectedDayDate && isSameDay(day, selectedDayDate);

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDayDate(day)}
                className={`min-h-[110px] p-2 flex flex-col justify-between cursor-pointer transition-all hover:bg-blue-50/30 ${
                  !isCurrentMonth ? 'bg-slate-50/40 text-slate-400' : 'bg-white text-slate-800'
                } ${isSelected ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/20' : ''}`}
              >
                {/* Header: day number and tags */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                    isToday 
                      ? 'bg-blue-600 text-white font-bold' 
                      : isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {format(day, 'd')}
                  </span>

                  {working > 0 && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.2 rounded-full">
                      {working} activos
                    </span>
                  )}
                </div>

                {/* Body: Mini preview badges */}
                <div className="space-y-1 my-1 overflow-hidden">
                  {daySchedules.slice(0, 3).map(sch => {
                    const collab = collabMap.get(sch.collaboratorId);
                    const shift = shiftMap.get(sch.shiftId);
                    if (!collab || !shift) return null;

                    return (
                      <div
                        key={sch.id}
                        className="text-[10px] truncate px-1.5 py-0.5 rounded font-medium flex items-center gap-1 border"
                        style={{
                          backgroundColor: shift.bgColor,
                          borderColor: shift.borderColor,
                          color: shift.textColor,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: shift.color }} />
                        <span className="truncate">{collab.name.split(' ')[0]}: {shift.code}</span>
                      </div>
                    );
                  })}

                  {daySchedules.length > 3 && (
                    <div className="text-[10px] text-slate-500 font-medium pl-1">
                      +{daySchedules.length - 3} más...
                    </div>
                  )}
                </div>

                {/* Footer status */}
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-50">
                  <span>{off > 0 ? `${off} desc.` : ''}</span>
                  <span className="text-slate-300 group-hover:text-blue-500">Ver día →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Modal / Drawer */}
      {selectedDayDate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900 capitalize">
                  {format(selectedDayDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                </h3>
                <p className="text-xs text-slate-500">Programación de turnos del día</p>
              </div>
              <button
                onClick={() => setSelectedDayDate(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2.5">
              {(() => {
                const dateStr = format(selectedDayDate, 'yyyy-MM-dd');
                const daySchedules = schedulesByDate.get(dateStr) || [];

                return collaborators.map(collab => {
                  const sch = daySchedules.find(s => s.collaboratorId === collab.id);
                  const shift = sch ? shiftMap.get(sch.shiftId) : null;

                  return (
                    <div
                      key={collab.id}
                      onClick={() => {
                        setSelectedDayDate(null);
                        onCellClick(collab, dateStr);
                      }}
                      className="p-3 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: collab.avatarColor }}
                        >
                          {collab.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-900">{collab.name}</div>
                          <div className="text-[11px] text-slate-500">{collab.role} • {collab.department}</div>
                        </div>
                      </div>

                      {shift ? (
                        <div
                          className="px-2.5 py-1 rounded-lg border text-xs font-medium text-right shadow-2xs"
                          style={{
                            backgroundColor: shift.bgColor,
                            borderColor: shift.borderColor,
                            color: shift.textColor,
                          }}
                        >
                          <div className="font-bold">{shift.name}</div>
                          <div className="text-[10px] font-mono">
                            {shift.isBreak || shift.isLeave ? 'Descanso' : `${shift.startTime} - ${shift.endTime}`}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Asignar
                        </span>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedDayDate(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/60 rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
