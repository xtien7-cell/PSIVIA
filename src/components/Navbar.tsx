import React from 'react';
import { UserProfessional, UnitConfig } from '../types';
import { User, Calendar, LogOut, Settings, WifiOff } from 'lucide-react';
import { APP_NAME, APP_TAGLINE, APP_VERSION } from '../data/catalogs';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { PsiviaLogo } from './PsiviaLogo';

interface NavbarProps {
  currentUser: UserProfessional | null;
  config: UnitConfig;
  onLogout: () => void;
  onOpenConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  config,
  onLogout,
  onOpenConfig,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const isOnline = useOnlineStatus();
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-primary)] text-white shadow-md border-b border-white/10">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <PsiviaLogo variant="horizontal" theme="dark" size="md" showSubtitle={true} />
          <div className="flex items-center gap-1.5 ml-1">
            <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              v{APP_VERSION}
            </span>
            {!isOnline && (
              <span className="bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <WifiOff className="w-3 h-3" />
                <span>Modo Offline</span>
              </span>
            )}
          </div>
        </div>

        {/* Right side: PWA Install, Date and User */}
        <div className="flex items-center gap-3">
          <PWAInstallButton />

          <div className="hidden md:flex items-center gap-1.5 text-xs text-white/85 bg-white/10 px-3 py-1.5 rounded-md">
            <Calendar className="w-3.5 h-3.5" />
            <span className="capitalize">{dateFormatted}</span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-xs font-medium cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span className="max-w-[160px] truncate text-white">
                {currentUser?.names || config.prof_names || 'Profesional'}
              </span>
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 text-gray-800 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {currentUser?.names || config.prof_names}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {currentUser?.specialty || config.prof_specialty || 'Psicología Clínica'}
                  </p>
                  {config.prof_license && (
                    <p className="text-[10px] text-[var(--color-primary-dark)] font-medium mt-0.5">
                      Reg: {config.prof_license}
                    </p>
                  )}
                </div>

                <button
                  onClick={onOpenConfig}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-gray-500" />
                  Configuración de la Unidad
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
