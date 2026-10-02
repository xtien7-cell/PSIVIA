import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Monitor, CheckCircle2, X, HelpCircle, HardDriveDownload } from 'lucide-react';
import { DB } from '../utils/storage';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  const handleAction = () => {
    if (isInstallable) {
      install();
    } else {
      setShowModal(true);
    }
  };

  const handleExportBackup = () => {
    try {
      const data = DB.exportBackup();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reinventar_Psicologia_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <button
        onClick={handleAction}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer border border-emerald-400"
        title="Descargar e instalar la aplicación para uso sin conexión"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {isInstalled ? 'App Instalada ✓' : 'Descargar App'}
        </span>
        <span className="sm:hidden">App</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full text-gray-800 text-xs shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Descargar / Instalar Aplicación</h3>
                  <p className="text-[11px] text-gray-500">Acceso directo en su computadora o celular sin internet</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Opción Desktop */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  <span>En Computadora (Chrome, Edge, Brave):</span>
                </div>
                <p className="text-gray-600 text-[11.5px] leading-relaxed">
                  1. Haga clic en el ícono de instalación <strong className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-800">⊕</strong> que aparece en el extremo derecho de la barra de direcciones de su navegador.<br />
                  2. O abra el menú del navegador (los tres puntos <strong>⋮</strong>) y seleccione <strong>«Instalar Reinventar Psicología...»</strong>.<br />
                  Se creará un acceso directo en su escritorio y funcionará como una aplicación nativa a pantalla completa.
                </p>
              </div>

              {/* Opción Celular / Tablet */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>En Celular o Tablet (Android / iOS):</span>
                </div>
                <p className="text-gray-600 text-[11.5px] leading-relaxed">
                  • <strong>Android:</strong> Toque el menú (<strong>⋮</strong>) y seleccione <strong>«Agregar a la pantalla principal»</strong> o <strong>«Instalar app»</strong>.<br />
                  • <strong>iPhone / iPad:</strong> Toque el botón Compartir y elija <strong>«Agregar a inicio»</strong>.
                </p>
              </div>

              {/* Descargar Backup Portable */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <HardDriveDownload className="w-4 h-4 text-blue-700" />
                    <span>Descargar Backup Local de Historias Clínicas</span>
                  </div>
                </div>
                <p className="text-[11px] text-blue-800">
                  Guarde una copia de seguridad completa con todos los pacientes, consultas y agendas en un archivo descargable.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Copia de Seguridad JSON</span>
                </button>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
