import React, { useState } from 'react';
import { UnitConfig, UserProfessional } from '../../types';
import { DB } from '../../utils/storage';
import { PALETTES } from '../../data/catalogs';
import { PSIVIA_LOGO_DATA_URL } from '../../utils/psiviaLogoAsset';
import {
  Settings,
  Building,
  Users,
  Palette,
  Database,
  Upload,
  Trash2,
  Save,
  Download,
  AlertOctagon,
  Image,
} from 'lucide-react';

interface ConfigModuleProps {
  config: UnitConfig;
  users: UserProfessional[];
  onConfigUpdated: (newConfig: UnitConfig) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const ConfigModule: React.FC<ConfigModuleProps> = ({
  config,
  users,
  onConfigUpdated,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'unidad' | 'usuarios' | 'paleta' | 'backup'>('unidad');

  // Unidad states
  const [unitName, setUnitName] = useState(config.unit_name || '');
  const [unitType, setUnitType] = useState(config.unit_type || '');
  const [unitCity, setUnitCity] = useState(config.unit_city || '');
  const [unitAddress, setUnitAddress] = useState(config.unit_address || '');
  const [unitPhone, setUnitPhone] = useState(config.unit_phone || '');
  const [unitEmail, setUnitEmail] = useState(config.unit_email || '');
  const [unitZip, setUnitZip] = useState(config.unit_zip || '');
  const [unitLogo, setUnitLogo] = useState(config.unit_logo || '');

  // Manejo de carga de logo
  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      setUnitLogo(res);
      onNotify('Logotipo cargado en vista previa. Guarde los cambios para aplicar.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUnit = () => {
    const updated: UnitConfig = {
      ...config,
      unit_name: unitName.trim(),
      unit_type: unitType.trim(),
      unit_city: unitCity.trim(),
      unit_address: unitAddress.trim(),
      unit_phone: unitPhone.trim(),
      unit_email: unitEmail.trim(),
      unit_zip: unitZip.trim(),
      unit_logo: unitLogo,
    };
    DB.saveConfig(updated);
    onConfigUpdated(updated);
    onNotify('Configuración de la unidad guardada con éxito.', 'success');
  };

  const handleSelectPalette = (palKey: string) => {
    const updated: UnitConfig = {
      ...config,
      palette: palKey,
    };
    DB.saveConfig(updated);
    onConfigUpdated(updated);
    onNotify(`Paleta ${PALETTES[palKey]?.name} aplicada.`, 'success');
  };

  // Exportar respaldo JSON
  const handleExportBackup = () => {
    const data = {
      app: 'PSIVIA',
      version: '1.18.3',
      exported_at: new Date().toISOString(),
      patients: DB.getPatients(),
      records: DB.getRecords(),
      tests: DB.getTests(),
      sessions: DB.getSessions(),
      appointments: DB.getAppointments(),
      users: DB.getUsers(),
      config: DB.getConfig(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PSIVIA_Respaldo_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Respaldo descargado en JSON.', 'success');
  };

  // Importar respaldo JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('⚠️ ATENCIÓN: Importar este archivo reemplazará la base de datos actual. ¿Desea continuar?')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.patients) DB.savePatients(data.patients);
        if (data.records) DB.saveRecords(data.records);
        if (data.tests) DB.saveTests(data.tests);
        if (data.sessions) DB.saveSessions(data.sessions);
        if (data.appointments) DB.saveAppointments(data.appointments);
        if (data.users) DB.saveUsers(data.users);
        if (data.config) {
          DB.saveConfig(data.config);
          onConfigUpdated(data.config);
        }
        onNotify('Copia de seguridad restaurada correctamente.', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        onNotify('El archivo no tiene un formato JSON válido de PSIVIA.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleWipeAll = () => {
    if (!window.confirm('🚨 PELIGRO: ¿Está COMPLETAMENTE SEGURO de borrar todos los datos locales? Esta acción es irreversible.')) {
      return;
    }
    if (!window.confirm('Confirmación final: Se eliminarán todos los pacientes, atenciones y configuraciones.')) {
      return;
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-6 shadow-xs">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[var(--color-border)]">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[var(--color-text-primary)]">
              Configuración del Sistema y Apariencia
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Personalice la información institucional, el logotipo oficial y la identidad visual de la plataforma.
            </p>
          </div>
        </div>

        {/* Pestañas de configuración */}
        <div className="flex gap-2 border-b border-[var(--color-border)] pb-2 mb-4 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('unidad')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'unidad' ? 'bg-[var(--color-primary)] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Unidad de Salud y Logotipo</span>
          </button>
          <button
            onClick={() => setActiveTab('paleta')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'paleta' ? 'bg-[var(--color-primary)] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Paleta de Colores Clínicos</span>
          </button>
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'usuarios' ? 'bg-[var(--color-primary)] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Profesionales Registrados</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'backup' ? 'bg-[var(--color-primary)] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Respaldo y Seguridad</span>
          </button>
        </div>

        {/* TAB 1: UNIDAD */}
        {activeTab === 'unidad' && (
          <div className="space-y-4 max-w-2xl text-xs">
            <div>
              <label className="block font-semibold mb-1">Nombre Oficial de la Unidad de Salud</label>
              <input
                type="text"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="Ej: CENTRO DE SALUD TIPO B ATUNTAQUI"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Tipología / Dependencia</label>
                <input
                  type="text"
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                  placeholder="Ej: MINISTERIO DE SALUD PÚBLICA — DISTRITO 10D02"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Ciudad (Aparece en certificados)</label>
                <input
                  type="text"
                  value={unitCity}
                  onChange={(e) => setUnitCity(e.target.value)}
                  placeholder="Ej: Atuntaqui"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Dirección Completa</label>
              <input
                type="text"
                value={unitAddress}
                onChange={(e) => setUnitAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Teléfono</label>
                <input
                  type="text"
                  value={unitPhone}
                  onChange={(e) => setUnitPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={unitEmail}
                  onChange={(e) => setUnitEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Código Postal</label>
                <input
                  type="text"
                  value={unitZip}
                  onChange={(e) => setUnitZip(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Carga de Logotipo */}
            <div className="p-4 bg-[var(--color-bg-light)] rounded-xl border border-[var(--color-border)]">
              <span className="font-bold text-[var(--color-primary-dark)] block mb-2">
                Logotipo Oficial para Encabezados de PDF, Certificados y Consentimientos
              </span>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl border border-teal-200 shadow-2xs flex items-center justify-center">
                  <img src={unitLogo || PSIVIA_LOGO_DATA_URL} alt="Logotipo Oficial PSIVIA" className="max-h-16 max-w-44 object-contain" />
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-teal-800">
                    Logotipo Oficial: PSIVIA
                  </div>
                  <label className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-semibold text-gray-800 cursor-pointer inline-flex items-center gap-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-gray-600" />
                    <span>Cambiar logotipo personalizado</span>
                    <input type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" />
                  </label>
                  {unitLogo && (
                    <button
                      type="button"
                      onClick={() => setUnitLogo('')}
                      className="block text-teal-700 hover:underline text-[11px] font-semibold"
                    >
                      Restablecer logotipo predeterminado PSIVIA
                    </button>
                  )}
                  <p className="text-[10px] text-gray-500">Documentos oficiales, certificados y consentimientos se emiten con la identidad oficial PSIVIA.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveUnit}
                className="px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Datos de la Unidad</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PALETA DE COLORES */}
        {activeTab === 'paleta' && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--color-text-secondary)]">
              Seleccione la armonía cromática clínica que mejor se adapte al entorno de su consultorio o institución:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(PALETTES).map((p) => {
                const isSelected = (config.palette || 'psivia') === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPalette(p.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--color-primary)] shadow-md bg-white'
                        : 'border-[var(--color-border)] hover:border-gray-400 bg-[var(--color-bg-light)]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-gray-900">{p.name}</span>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white">
                          Activa
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{p.desc}</p>

                    {p.id === 'psivia' ? (
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <div className="w-6 h-6 rounded-full border shadow-2xs" style={{ background: '#00B5B8' }} title="Confianza (#00B5B8)" />
                          <div className="w-6 h-6 rounded-full border shadow-2xs" style={{ background: '#2F80ED' }} title="Equilibrio (#2F80ED)" />
                          <div className="w-6 h-6 rounded-full border shadow-2xs" style={{ background: '#6345A5' }} title="Tecnología (#6345A5)" />
                          <div className="w-6 h-6 rounded-full border shadow-2xs" style={{ background: '#0E172A' }} title="Bienestar (#0E172A)" />
                        </div>
                        <div className="text-[10px] text-gray-400 flex gap-2">
                          <span>Confianza</span> · <span>Equilibrio</span> · <span>Tecnología</span> · <span>Bienestar</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full border shadow-2xs" style={{ background: p.primary }} />
                        <div className="w-6 h-6 rounded-full border shadow-2xs" style={{ background: p.primaryDark }} />
                        <div className="w-6 h-6 rounded-full border shadow-2xs" style={{ background: p.primaryLight }} />
                        <div className="w-6 h-6 rounded-full border shadow-2xs" style={{ background: p.bgLight }} />
                        <div className="w-6 h-6 rounded-full border shadow-2xs" style={{ background: p.textPrimary }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: USUARIOS */}
        {activeTab === 'usuarios' && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[var(--color-primary-dark)] uppercase tracking-wider mb-2">
              Profesionales Registrados en el Sistema ({users.length})
            </h2>

            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-light)] flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-sm text-gray-900">{u.names}</strong>
                    <div className="text-[11px] text-gray-600 mt-0.5">
                      C.I.: <strong>{u.cedula}</strong> · {u.specialty || 'Psicología Clínica'} · Reg: {u.license || '—'}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      ✉ {u.email || '—'} · ☎ {u.phone || '—'}
                    </div>
                  </div>

                  {u.id === config.active_professional_id && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Sesión Activa
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BACKUP */}
        {activeTab === 'backup' && (
          <div className="space-y-5 max-w-xl text-xs">
            <div className="p-4 bg-[var(--color-bg-light)] rounded-xl border border-[var(--color-border)] space-y-2">
              <span className="font-bold text-[var(--color-primary-dark)] block text-xs">
                Exportar Copia de Seguridad Completa (JSON)
              </span>
              <p className="text-gray-600 text-[11px]">
                Guarde en su equipo un archivo con todas las historias clínicas, pacientes, pruebas aplicadas y citas.
              </p>
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Copia de Seguridad JSON</span>
              </button>
            </div>

            <div className="p-4 bg-[var(--color-bg-light)] rounded-xl border border-[var(--color-border)] space-y-2">
              <span className="font-bold text-[var(--color-primary-dark)] block text-xs">
                Restaurar Copia de Seguridad
              </span>
              <p className="text-gray-600 text-[11px]">
                Cargue un archivo previamente exportado (.json) para restaurar la información.
              </p>
              <label className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-gray-600" />
                <span>Seleccionar archivo JSON</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>

            <div className="p-4 bg-red-50 rounded-xl border border-red-200 space-y-2 text-red-800">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                <span>Zona de Precaución: Reinicio de Base de Datos</span>
              </div>
              <p className="text-[11px]">
                Esta acción borrará de forma irreversible todos los pacientes y consultas clínicas de este dispositivo.
              </p>
              <button
                type="button"
                onClick={handleWipeAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Todos los Datos Locales</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
