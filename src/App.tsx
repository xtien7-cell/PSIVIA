import React, { useState, useEffect, useCallback } from 'react';
import {
  Patient,
  ClinicalRecord,
  AppliedTest,
  SessionItem,
  Appointment,
  UserProfessional,
  UnitConfig,
} from './types';
import { DB } from './utils/storage';
import { PALETTES } from './data/catalogs';
import { Navbar } from './components/Navbar';
import { Sidebar, ModuleType } from './components/Sidebar';
import { GateModal } from './components/GateModal';
import { Toast, ToastMessage } from './components/Toast';

import { InicioModule } from './components/modules/InicioModule';
import { AtencionModule } from './components/modules/AtencionModule';
import { AdmisionModule } from './components/modules/AdmisionModule';
import { HistorialModule } from './components/modules/HistorialModule';
import { AgendaModule } from './components/modules/AgendaModule';
import { ReportesModule } from './components/modules/ReportesModule';
import { ConfigModule } from './components/modules/ConfigModule';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfessional | null>(null);
  const [config, setConfig] = useState<UnitConfig>(() => DB.getConfig());
  const [currentModule, setCurrentModule] = useState<ModuleType>('inicio');

  // Datos principales
  const [patients, setPatients] = useState<Patient[]>(() => DB.getPatients());
  const [records, setRecords] = useState<ClinicalRecord[]>(() => DB.getRecords());
  const [tests, setTests] = useState<AppliedTest[]>(() => DB.getTests());
  const [sessions, setSessions] = useState<SessionItem[]>(() => DB.getSessions());
  const [appointments, setAppointments] = useState<Appointment[]>(() => DB.getAppointments());
  const [users, setUsers] = useState<UserProfessional[]>(() => DB.getUsers());

  // Atencion activa
  const [atencionPatientId, setAtencionPatientId] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Comprobar inicio de sesión persistente en sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('psivia_logged_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Aplicar paleta de color dinámica
  const applyPaletteToCSS = useCallback((paletteId: string) => {
    const p = PALETTES[paletteId] || PALETTES.psivia || PALETTES.salvia;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', p.primary);
    root.style.setProperty('--color-primary-dark', p.primaryDark);
    root.style.setProperty('--color-primary-light', p.primaryLight);
    root.style.setProperty('--color-bg-page', p.bgPage);
    root.style.setProperty('--color-bg-light', p.bgLight);
    root.style.setProperty('--color-bg-card', p.bgCard);
    root.style.setProperty('--color-text-primary', p.textPrimary);
    root.style.setProperty('--color-text-secondary', p.textSecondary);
    root.style.setProperty('--color-border', p.border);
  }, []);

  useEffect(() => {
    applyPaletteToCSS(config.palette || 'psivia');
  }, [config.palette, applyPaletteToCSS]);

  // Recarga global de datos
  const refreshAllData = useCallback(() => {
    setPatients(DB.getPatients());
    setRecords(DB.getRecords());
    setTests(DB.getTests());
    setSessions(DB.getSessions());
    setAppointments(DB.getAppointments());
    setUsers(DB.getUsers());
    const c = DB.getConfig();
    setConfig(c);
  }, []);

  const handleConfigUpdated = (newConfig: UnitConfig) => {
    setConfig(newConfig);
    applyPaletteToCSS(newConfig.palette || 'psivia');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('psivia_logged_user');
    setCurrentUser(null);
    setCurrentModule('inicio');
  };

  const handleStartEncounterForPatient = (patId: string) => {
    setAtencionPatientId(patId);
    setCurrentModule('atencion');
  };

  // Si no hay usuario logueado, mostrar pantalla de acceso y confidencialidad
  if (!currentUser) {
    return (
      <>
        <GateModal
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            refreshAllData();
            addToast(`Bienvenido/a, ${user.names}`, 'success');
          }}
        />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col font-sans">
      <Navbar
        currentUser={currentUser}
        config={config}
        onLogout={handleLogout}
        onOpenConfig={() => setCurrentModule('config')}
      />

      <div className="flex-1 flex flex-col md:flex-row w-full min-w-0">
        <Sidebar
          currentModule={currentModule}
          onSelectModule={(mod) => {
            if (mod === 'atencion') setAtencionPatientId(null);
            setCurrentModule(mod);
          }}
        />

        <main className="flex-1 p-3 sm:p-5 lg:p-6 min-w-0 w-full">
          {currentModule === 'inicio' && (
            <InicioModule
              patients={patients}
              records={records}
              tests={tests}
              appointments={appointments}
              activeProfessionalName={currentUser?.names || config.prof_names || ''}
              onNavigate={(mod) => setCurrentModule(mod)}
              onStartNewEncounter={() => {
                setAtencionPatientId(null);
                setCurrentModule('atencion');
              }}
              onNewPatient={() => setCurrentModule('admision')}
            />
          )}

          {currentModule === 'atencion' && (
            <AtencionModule
              patients={patients}
              records={records}
              config={config}
              initialPatientId={atencionPatientId}
              onFinished={() => {
                refreshAllData();
                setAtencionPatientId(null);
                setCurrentModule('historial');
              }}
              onNotify={addToast}
            />
          )}

          {currentModule === 'admision' && (
            <AdmisionModule
              patients={patients}
              config={config}
              onRefresh={refreshAllData}
              onNotify={addToast}
              onStartEncounterWithPatient={handleStartEncounterForPatient}
            />
          )}

          {currentModule === 'historial' && (
            <HistorialModule
              patients={patients}
              records={records}
              tests={tests}
              sessions={sessions}
              config={config}
              onNotify={addToast}
            />
          )}

          {currentModule === 'agenda' && (
            <AgendaModule
              appointments={appointments}
              patients={patients}
              config={config}
              onRefresh={refreshAllData}
              onNotify={addToast}
            />
          )}

          {currentModule === 'reportes' && (
            <ReportesModule
              patients={patients}
              records={records}
              tests={tests}
              sessions={sessions}
              onNotify={addToast}
            />
          )}

          {currentModule === 'config' && (
            <ConfigModule
              config={config}
              users={users}
              onConfigUpdated={handleConfigUpdated}
              onNotify={addToast}
            />
          )}
        </main>
      </div>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
