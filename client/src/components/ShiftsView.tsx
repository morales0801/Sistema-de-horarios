import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Coffee, 
  Palmtree, 
  AlertCircle 
} from 'lucide-react';
import { Shift } from '../types';

interface ShiftsViewProps {
  shifts: Shift[];
  onCreate: (shift: Partial<Shift>) => Promise<void>;
  onUpdate: (id: string, shift: Partial<Shift>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const COLOR_PALETTES = [
  { name: 'Sky Blue', color: '#0284c7', bgColor: '#e0f2fe', borderColor: '#7dd3fc', textColor: '#0369a1' },
  { name: 'Amber', color: '#d97706', bgColor: '#fef3c7', borderColor: '#fcd34d', textColor: '#b45309' },
  { name: 'Purple', color: '#7c3aed', bgColor: '#f3e8ff', borderColor: '#d8b4fe', textColor: '#6d28d9' },
  { name: 'Emerald', color: '#059669', bgColor: '#d1fae5', borderColor: '#6ee7b7', textColor: '#047857' },
  { name: 'Cyan', color: '#0891b2', bgColor: '#cffafe', borderColor: '#67e8f9', textColor: '#0e7490' },
  { name: 'Rose', color: '#e11d48', bgColor: '#ffe4e6', borderColor: '#fda4af', textColor: '#be123c' },
  { name: 'Indigo', color: '#4f46e5', bgColor: '#e0e7ff', borderColor: '#a5b4fc', textColor: '#3730a3' },
  { name: 'Slate', color: '#475569', bgColor: '#f1f5f9', borderColor: '#cbd5e1', textColor: '#334155' }
];

export const ShiftsView: React.FC<ShiftsViewProps> = ({
  shifts,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [durationHours, setDurationHours] = useState(8);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [isLeave, setIsLeave] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingShift(null);
    setName('');
    setCode('');
    setStartTime('08:00');
    setEndTime('16:00');
    setDurationHours(8);
    setPaletteIndex(0);
    setIsBreak(false);
    setIsLeave(false);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (shift: Shift) => {
    setEditingShift(shift);
    setName(shift.name);
    setCode(shift.code);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setDurationHours(shift.durationHours);
    setIsBreak(shift.isBreak);
    setIsLeave(shift.isLeave);

    const foundIdx = COLOR_PALETTES.findIndex(p => p.color === shift.color);
    setPaletteIndex(foundIdx !== -1 ? foundIdx : 0);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del turno es obligatorio.');
      return;
    }
    const pal = COLOR_PALETTES[paletteIndex];
    setIsSubmitting(true);
    try {
      const data: Partial<Shift> = {
        name: name.trim(),
        code: (code.trim() || name.substring(0, 2)).toUpperCase(),
        startTime: isBreak || isLeave ? '00:00' : startTime,
        endTime: isBreak || isLeave ? '00:00' : endTime,
        durationHours: isBreak || isLeave ? 0 : Number(durationHours),
        color: pal.color,
        bgColor: pal.bgColor,
        borderColor: pal.borderColor,
        textColor: pal.textColor,
        isBreak,
        isLeave
      };

      if (editingShift) {
        await onUpdate(editingShift.id, data);
      } else {
        await onCreate(data);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el turno');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar el turno "${name}"?`)) {
      await onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">
            Catálogo y Tipos de Turnos
          </h2>
          <p className="text-xs text-slate-500">
            Define los horarios, códigos, duraciones y colores de turnos disponibles
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Turno</span>
        </button>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {shifts.map(shift => (
          <div
            key={shift.id}
            className="rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all hover:shadow-md"
            style={{
              backgroundColor: shift.bgColor,
              borderColor: shift.borderColor,
              color: shift.textColor,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-bold font-mono px-2 py-0.5 rounded-md shadow-2xs"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}
                >
                  {shift.code}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(shift)}
                    className="p-1 rounded hover:bg-white/60 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(shift.id, shift.name)}
                    className="p-1 rounded hover:bg-white/60 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-base leading-tight mb-1">
                {shift.name}
              </h3>

              <div className="text-xs font-mono opacity-90 flex items-center gap-1.5 mt-2">
                {shift.isBreak ? (
                  <span className="flex items-center gap-1">
                    <Coffee className="w-3.5 h-3.5" /> Día Libre / Descanso
                  </span>
                ) : shift.isLeave ? (
                  <span className="flex items-center gap-1">
                    <Palmtree className="w-3.5 h-3.5" /> Permiso / Vacaciones
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {shift.startTime} - {shift.endTime}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-current/20 flex items-center justify-between text-xs font-semibold">
              <span>Duración:</span>
              <span className="font-mono bg-white/70 px-2 py-0.5 rounded">
                {shift.durationHours} horas
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                {editingShift ? 'Editar Turno' : 'Nuevo Turno'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Turno *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Turno Intermedio"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Código</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="INT"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono uppercase text-center"
                  />
                </div>
              </div>

              {/* Type checkboxes */}
              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBreak}
                    onChange={(e) => {
                      setIsBreak(e.target.checked);
                      if (e.target.checked) setIsLeave(false);
                    }}
                    className="rounded text-blue-600"
                  />
                  <span>Es día libre / descanso</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLeave}
                    onChange={(e) => {
                      setIsLeave(e.target.checked);
                      if (e.target.checked) setIsBreak(false);
                    }}
                    className="rounded text-blue-600"
                  />
                  <span>Es permiso / vacación</span>
                </label>
              </div>

              {!isBreak && !isLeave && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hora Inicio</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hora Fin</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Horas Totales</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="24"
                      value={durationHours}
                      onChange={(e) => setDurationHours(Number(e.target.value))}
                      className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-xl font-mono text-center"
                    />
                  </div>
                </div>
              )}

              {/* Color Palette Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Color e Identidad Visual</label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PALETTES.map((p, idx) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setPaletteIndex(idx)}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-transform ${
                        paletteIndex === idx ? 'ring-2 ring-slate-800 scale-105 shadow-xs' : 'hover:scale-102'
                      }`}
                      style={{
                        backgroundColor: p.bgColor,
                        borderColor: p.borderColor,
                        color: p.textColor,
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editingShift ? 'Guardar Cambios' : 'Crear Turno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
