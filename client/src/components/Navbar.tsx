import React from 'react';
import { 
  Calendar, 
  CalendarDays, 
  Users, 
  Clock, 
  BarChart3, 
  CheckCheck,
  Printer, 
  Download, 
  RotateCcw,
  ExternalLink
} from 'lucide-react';

export type ActiveTab = 'weekly' | 'monthly' | 'collaborators' | 'shifts' | 'stats' | 'attendance';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeCollaboratorsCount?: number;
  onPrint: () => void;
  onExportCsv: () => void;
  onResetDemo: () => void;
  onOpenKiosk: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  activeCollaboratorsCount = 0,
  onPrint,
  onExportCsv,
  onResetDemo,
  onOpenKiosk,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & App Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">ShiftFlow</span>
                <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                  Horarios
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Control de turnos y asistencia de colaboradores</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => onTabChange('weekly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'weekly'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Semanal</span>
            </button>

            <button
              onClick={() => onTabChange('monthly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'monthly'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Mensual</span>
            </button>

            <button
              onClick={() => onTabChange('attendance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'attendance'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Asistencia</span>
              {activeCollaboratorsCount > 0 && (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-200">
                  {activeCollaboratorsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('collaborators')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'collaborators'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Colaboradores</span>
            </button>

            <button
              onClick={() => onTabChange('shifts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'shifts'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Turnos</span>
            </button>

            <button
              onClick={() => onTabChange('stats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'stats'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Reportes</span>
            </button>
          </nav>

          {/* Quick Utility Actions */}
          <div className="flex items-center gap-2">
            
            {/* Open Employee Kiosk App */}
            <button
              onClick={onOpenKiosk}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              title="Abrir la aplicación que se instala o abre en la computadora de los colaboradores para marcar"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">App Colaborador</span>
            </button>

            <button
              onClick={onPrint}
              title="Imprimir cuadrícula actual"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5 text-xs font-medium"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onExportCsv}
              title="Exportar datos a CSV"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5 text-xs font-medium"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onResetDemo}
              title="Restablecer datos demo iniciales"
              className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
