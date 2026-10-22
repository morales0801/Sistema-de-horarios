import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Check, Trash2, FileText } from 'lucide-react';
import { Collaborator, Shift, Schedule } from '../types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface ShiftPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborator: Collaborator | null;
  dateStr: string;
  currentSchedule: Schedule | null;
  shifts: Shift[];
  onSave: (shiftId: string, notes: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export const ShiftPickerModal: React.FC<ShiftPickerModalProps> = ({
  isOpen,
  onClose,
  collaborator,
  dateStr,
  currentSchedule,
  shifts,
  onSave,
  onDelete,
}) => {
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedShiftId(currentSchedule?.shiftId || '');
      setNotes(currentSchedule?.notes || '');
    }
  }, [isOpen, currentSchedule]);

  if (!isOpen || !collaborator) return null;

  let formattedDate = dateStr;
  try {
    formattedDate = format(parseISO(dateStr), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  } catch (e) {
    // fallback
  }

  const handleSelectAndSave = async (shiftId: string) => {
    setIsSubmitting(true);
    try {
      await onSave(shiftId, notes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShiftId) {
      await handleDelete();
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave(selectedShiftId, notes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs"
              style={{ backgroundColor: collaborator.avatarColor || '#3b82f6' }}
            >
              {collaborator.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 leading-tight">
                {collaborator.name}
              </h3>
              <p className="text-xs text-slate-500 capitalize flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                {formattedDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              Selecciona el Turno
            </label>
            <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {shifts.map((shift) => {
                const isSelected = selectedShiftId === shift.id;
                return (
                  <button
                    key={shift.id}
                    type="button"
                    onClick={() => setSelectedShiftId(shift.id)}
                    className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between relative group ${
                      isSelected
                        ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: shift.color }}
                        />
                        <span className="font-semibold text-sm text-slate-900 leading-none">
                          {shift.name}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="text-blue-600 bg-blue-100 p-0.5 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {shift.isBreak || shift.isLeave ? 'Sin horario' : `${shift.startTime} - ${shift.endTime}`}
                      </span>
                      <span className="font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {shift.durationHours}h
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes field */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Nota u Observación (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Cubre guardia, apertura, cambio solicitado..."
              className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {currentSchedule ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Quitar turno
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedShiftId}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Guardar Turno
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
