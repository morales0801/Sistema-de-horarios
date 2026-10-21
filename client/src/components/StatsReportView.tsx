import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Download,
  Building2,
  Calendar
} from 'lucide-react';
import { WeeklyStats, Collaborator } from '../types';
import { formatWeekRange } from '../utils/dateUtils';

interface StatsReportViewProps {
  currentDate: Date;
  stats: WeeklyStats | null;
  collaborators: Collaborator[];
  onExportCsv: () => void;
}

export const StatsReportView: React.FC<StatsReportViewProps> = ({
  currentDate,
  stats,
  collaborators,
  onExportCsv,
}) => {
  if (!stats) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Clock className="w-8 h-8 text-slate-300 mx-auto animate-spin mb-3" />
        <p className="text-slate-500 text-sm">Cargando reporte de horas...</p>
      </div>
    );
  }

  const overtimeCount = stats.collaboratorStats.filter(c => c.isOvertime).length;
  const underCount = stats.collaboratorStats.filter(c => c.isUnder).length;
  const compliantCount = stats.collaboratorStats.filter(c => !c.isOvertime && !c.isUnder).length;
  const avgHours = stats.collaboratorStats.length 
    ? (stats.totalHoursScheduled / stats.collaboratorStats.length).toFixed(1) 
    : '0';

  // Group by department
  const collabMap = new Map(collaborators.map(c => [c.id, c]));
  const deptMap = new Map<string, { totalHours: number; headcount: number }>();

  stats.collaboratorStats.forEach(stat => {
    const c = collabMap.get(stat.collaboratorId);
    const dept = c?.department || 'General';
    const cur = deptMap.get(dept) || { totalHours: 0, headcount: 0 };
    cur.totalHours += stat.scheduledHours;
    cur.headcount += 1;
    deptMap.set(dept, cur);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              Informe de Cumplimiento y Carga Horaria
            </h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              Semanal
            </span>
          </div>
          <p className="text-xs text-slate-500 capitalize flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            {formatWeekRange(currentDate)}
          </p>
        </div>

        <button
          onClick={onExportCsv}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Descargar Reporte CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Horas
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {stats.totalHoursScheduled}h
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Promedio: <span className="font-semibold text-slate-700">{avgHours}h</span> por persona
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cumplimiento
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            {compliantCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Colaboradores con 100% de objetivo
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Horas Extra
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            {overtimeCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Colaboradores superando el objetivo
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Incompletos
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-700 mt-2">
            {underCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Menos horas que su objetivo semanal
          </p>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          Distribución de Horas por Departamento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Array.from(deptMap.entries()).map(([dept, data]) => {
            const percentage = stats.totalHoursScheduled > 0 
              ? Math.round((data.totalHours / stats.totalHoursScheduled) * 100) 
              : 0;

            return (
              <div key={dept} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-800">{dept}</span>
                  <span className="text-slate-500 font-mono">{data.totalHours}h ({percentage}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1.5 flex justify-between">
                  <span>{data.headcount} colaborador(es)</span>
                  <span>{(data.totalHours / data.headcount).toFixed(1)}h prom.</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance Detailed Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Detalle Individual por Colaborador
          </h3>
          <span className="text-xs text-slate-500">
            {stats.collaboratorStats.length} colaboradores
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-4">Objetivo</th>
                <th className="py-3 px-4">Programado</th>
                <th className="py-3 px-4">Diferencia</th>
                <th className="py-3 px-4">Días Laborados</th>
                <th className="py-3 px-4">Días Descanso</th>
                <th className="py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {stats.collaboratorStats.map(stat => {
                const c = collabMap.get(stat.collaboratorId);
                return (
                  <tr key={stat.collaboratorId} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{stat.name}</div>
                      <div className="text-slate-500 text-[11px]">{c?.role} • {c?.department}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">{stat.targetHours}h</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{stat.scheduledHours}h</td>
                    <td className="py-3 px-4 font-mono">
                      {stat.diffHours > 0 && (
                        <span className="text-amber-600 font-bold">+{stat.diffHours}h</span>
                      )}
                      {stat.diffHours < 0 && (
                        <span className="text-slate-500">{stat.diffHours}h</span>
                      )}
                      {stat.diffHours === 0 && (
                        <span className="text-emerald-600 font-bold">0h</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{stat.workedDays} días</td>
                    <td className="py-3 px-4">{stat.offDays} días</td>
                    <td className="py-3 px-4">
                      {stat.isOvertime && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                          Horas Extra (+{stat.diffHours}h)
                        </span>
                      )}
                      {!stat.isOvertime && !stat.isUnder && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                          Cumplido
                        </span>
                      )}
                      {stat.isUnder && (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          Incompleto ({stat.diffHours}h)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
