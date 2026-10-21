import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  Building2, 
  Clock, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  AlertCircle
} from 'lucide-react';
import { Collaborator } from '../types';

interface CollaboratorsViewProps {
  collaborators: Collaborator[];
  departments: string[];
  onCreate: (collab: Partial<Collaborator>) => Promise<void>;
  onUpdate: (id: string, collab: Partial<Collaborator>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const PRESET_COLORS = [
  '#2563eb', // blue
  '#059669', // emerald
  '#d97706', // amber
  '#7c3aed', // purple
  '#dc2626', // red
  '#0891b2', // cyan
  '#ea580c', // orange
  '#4f46e5', // indigo
  '#db2777', // pink
  '#475569'  // slate
];

export const CollaboratorsView: React.FC<CollaboratorsViewProps> = ({
  collaborators,
  departments,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollab, setEditingCollab] = useState<Collaborator | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [customDept, setCustomDept] = useState('');
  const [role, setRole] = useState('');
  const [targetWeeklyHours, setTargetWeeklyHours] = useState(40);
  const [avatarColor, setAvatarColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCollab(null);
    setName('');
    setEmail('');
    setPhone('');
    setDepartment(departments[0] || 'General');
    setCustomDept('');
    setRole('');
    setTargetWeeklyHours(40);
    setAvatarColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (collab: Collaborator) => {
    setEditingCollab(collab);
    setName(collab.name);
    setEmail(collab.email);
    setPhone(collab.phone);
    setDepartment(collab.department);
    setCustomDept('');
    setRole(collab.role);
    setTargetWeeklyHours(collab.targetWeeklyHours);
    setAvatarColor(collab.avatarColor || PRESET_COLORS[0]);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre completo es obligatorio.');
      return;
    }
    const finalDept = department === 'custom' ? customDept.trim() : department;
    if (!finalDept) {
      setError('Selecciona o ingresa un departamento.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data: Partial<Collaborator> = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department: finalDept,
        role: role.trim() || 'Colaborador',
        targetWeeklyHours: Number(targetWeeklyHours) || 40,
        avatarColor,
        active: true
      };

      if (editingCollab) {
        await onUpdate(editingCollab.id, data);
      } else {
        await onCreate(data);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Error al guardar colaborador');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a "${name}"? También se eliminarán sus horarios asignados.`)) {
      await onDelete(id);
    }
  };

  const filtered = collaborators.filter(c => {
    if (selectedDept !== 'all' && c.department !== selectedDept) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">
            Gestión de Colaboradores
          </h2>
          <p className="text-xs text-slate-500">
            {collaborators.length} colaboradores registrados en el sistema
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, cargo, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium"
          >
            <option value="all">Todos los Departamentos</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Create Button */}
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Colaborador</span>
          </button>
        </div>
      </div>

      {/* Collaborators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(collab => (
          <div
            key={collab.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-xs"
                    style={{ backgroundColor: collab.avatarColor || '#3b82f6' }}
                  >
                    {collab.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">
                      {collab.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {collab.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(collab)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(collab.id, collab.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-800">{collab.department}</span>
                </div>
                {collab.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{collab.email}</span>
                  </div>
                )}
                {collab.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{collab.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Objetivo semanal:
              </span>
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg">
                {collab.targetWeeklyHours}h / semana
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                {editingCollab ? 'Editar Colaborador' : 'Nuevo Colaborador'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Roberto Martínez"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo / Puesto</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Ej. Cajero, Jefe de Turno"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horas Semanales</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={targetWeeklyHours}
                    onChange={(e) => setTargetWeeklyHours(Number(e.target.value))}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Departamento *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl bg-white mb-2"
                >
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                  <option value="custom">+ Crear nuevo departamento...</option>
                </select>
                {department === 'custom' && (
                  <input
                    type="text"
                    value={customDept}
                    onChange={(e) => setCustomDept(e.target.value)}
                    placeholder="Escribe el nombre del nuevo departamento"
                    className="w-full text-xs px-3.5 py-2 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@empresa.com"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Color de Avatar</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        avatarColor === c ? 'scale-110 border-slate-800 shadow-sm' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
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
                  {editingCollab ? 'Guardar Cambios' : 'Crear Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
