import React, { useState } from 'react';
import { X, Copy, Calendar, AlertCircle } from 'lucide-react';
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

interface CopyWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeekStart: Date;
  onCopy: (fromWeekStart: string, toWeekStart: string) => Promise<void>;
}

export const CopyWeekModal: React.FC<CopyWeekModalProps> = ({
  isOpen,
  onClose,
  currentWeekStart,
  onCopy,
}) => {
  const currentMonday = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const prevMonday = subWeeks(currentMonday, 1);
  const nextMonday = addWeeks(currentMonday, 1);

  const [fromWeek, setFromWeek] = useState<string>(format(prevMonday, 'yyyy-MM-dd'));
  const [toWeek, setToWeek] = useState<string>(format(currentMonday, 'yyyy-MM-dd'));
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromWeek === toWeek) {
      setError('La semana de origen y la semana de destino deben ser diferentes.');
      return;
    }
    setError(null);
    setIsCopying(true);
    try {
      await onCopy(fromWeek, toWeek);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al copiar la semana');
    } finally {
      setIsCopying(false);
    }
  };

  const getWeekLabel = (d: Date) => {
    const monday = startOfWeek(d, { weekStartsOn: 1 });
    return `Semana del ${format(monday, "d 'de' MMMM yyyy", { locale: es })}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Copy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 leading-tight">
                Copiar Horarios de Semana
              </h3>
              <p className="text-xs text-slate-500">Duplica la programación completa entre semanas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              Copiar desde (Semana Origen):
            </label>
            <select
              value={fromWeek}
              onChange={(e) => setFromWeek(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            >
              <option value={format(subWeeks(currentMonday, 2), 'yyyy-MM-dd')}>
                {getWeekLabel(subWeeks(currentMonday, 2))} (Hace 2 semanas)
              </option>
              <option value={format(prevMonday, 'yyyy-MM-dd')}>
                {getWeekLabel(prevMonday)} (Semana Anterior)
              </option>
              <option value={format(currentMonday, 'yyyy-MM-dd')}>
                {getWeekLabel(currentMonday)} (Semana Actual)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              Pegar en (Semana Destino):
            </label>
            <select
              value={toWeek}
              onChange={(e) => setToWeek(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            >
              <option value={format(currentMonday, 'yyyy-MM-dd')}>
                {getWeekLabel(currentMonday)} (Semana Actual)
              </option>
              <option value={format(nextMonday, 'yyyy-MM-dd')}>
                {getWeekLabel(nextMonday)} (Semana Siguiente)
              </option>
              <option value={format(addWeeks(currentMonday, 2), 'yyyy-MM-dd')}>
                {getWeekLabel(addWeeks(currentMonday, 2))} (En 2 semanas)
              </option>
            </select>
          </div>

          <p className="text-xs text-slate-500 bg-amber-50 border border-amber-200/60 p-3 rounded-xl text-amber-800">
            <strong>Nota:</strong> Los turnos existentes en la semana de destino serán reemplazados por los de la semana de origen.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCopying}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-4 h-4" />
              {isCopying ? 'Copiando...' : 'Copiar Horarios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
