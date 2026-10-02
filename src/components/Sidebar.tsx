import React from 'react';
import {
  Home,
  Stethoscope,
  UserPlus,
  History,
  CalendarCheck,
  BarChart3,
  Settings,
} from 'lucide-react';

export type ModuleType =
  | 'inicio'
  | 'atencion'
  | 'admision'
  | 'historial'
  | 'agenda'
  | 'reportes'
  | 'config';

interface SidebarProps {
  currentModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
  activeEncountersCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
}) => {
  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'atencion', label: 'Atención Clínica', icon: Stethoscope, highlight: true },
    { id: 'admision', label: 'Admisión Pacientes', icon: UserPlus },
    { id: 'historial', label: 'Historial Clínico', icon: History },
    { id: 'agenda', label: 'Agenda y Citas', icon: CalendarCheck },
    { id: 'reportes', label: 'Reportes & Excel', icon: BarChart3 },
    { id: 'config', label: 'Configuración', icon: Settings },
  ] as const;

  return (
    <>
      {/* Mobile Top Scrollable Navigation (only on mobile screens < md) */}
      <div className="md:hidden w-full bg-[var(--color-bg-card)] border-b border-[var(--color-border)] sticky top-14 z-30 shadow-xs">
        <div className="flex overflow-x-auto p-1.5 gap-1.5 no-scrollbar scroll-smooth">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-light)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
                {item.id === 'atencion' && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/30 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    HC
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar (hidden on mobile, fixed width on md+) */}
      <aside className="hidden md:flex md:w-64 bg-[var(--color-bg-card)] border-r border-[var(--color-border)] min-h-[calc(100vh-3.5rem)] flex-col justify-between p-3 select-none shrink-0">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-light)] hover:text-[var(--color-primary-dark)]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-[var(--color-primary)]'
                  }`}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {item.id === 'atencion' && (
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-[var(--color-primary-light)]/25 text-[var(--color-primary-dark)]'
                    }`}
                  >
                    HC
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-[var(--color-border)] px-2 text-[10.5px] text-[var(--color-text-secondary)] space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00B5B8]" />
            <p className="font-bold text-[var(--color-text-primary)]">PSIVIA v1.20.0</p>
          </div>
          <p className="text-[10px] text-gray-500 leading-tight">Valoración, Interpretación y Análisis</p>
        </div>
      </aside>
    </>
  );
};
