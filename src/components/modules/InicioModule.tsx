import React from 'react';
import { Patient, ClinicalRecord, AppliedTest, Appointment } from '../../types';
import {
  Users,
  FileText,
  ClipboardCheck,
  Calendar,
  Stethoscope,
  UserPlus,
  ArrowRight,
  Clock,
  Sparkles,
  Brain,
  FileCheck2,
  BarChart4,
  ShieldCheck,
} from 'lucide-react';
import { fechaCorta } from '../../utils/storage';
import { PsiviaLogo } from '../PsiviaLogo';

interface InicioModuleProps {
  patients: Patient[];
  records: ClinicalRecord[];
  tests: AppliedTest[];
  appointments: Appointment[];
  activeProfessionalName: string;
  onNavigate: (module: any) => void;
  onStartNewEncounter: () => void;
  onNewPatient: () => void;
}

export const InicioModule: React.FC<InicioModuleProps> = ({
  patients,
  records,
  tests,
  appointments,
  activeProfessionalName,
  onNavigate,
  onStartNewEncounter,
  onNewPatient,
}) => {
  const now = new Date();
  const upcomingAppointments = appointments
    .filter((a) => {
      const dt = new Date(`${a.date}T${a.time || '00:00'}`);
      return dt >= now;
    })
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const patientsMap = React.useMemo(() => {
    const map: Record<string, Patient> = {};
    patients.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [patients]);

  return (
    <div className="space-y-6">
      {/* Banner Principal de Marca PSIVIA (Fondo Claro y Luminoso) */}
      <div className="bg-gradient-to-br from-white via-teal-50/40 to-blue-50/30 rounded-3xl p-6 sm:p-7 text-slate-800 shadow-sm border border-teal-100 relative overflow-hidden">
        {/* Glow de fondo suave con los colores oficiales de la marca */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#00B5B8]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#2F80ED]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-xs font-semibold border border-teal-200 text-[#00898B]">
              <span className="w-2 h-2 rounded-full bg-[#00B5B8] animate-pulse" />
              <span>Inteligencia Clínica & IA Activa</span>
            </div>

            <div className="pt-1">
              <PsiviaLogo variant="horizontal" theme="color" size="lg" showSubtitle={true} />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 pt-2">
              Bienvenido/a, <span className="text-[#00898B] font-extrabold">{activeProfessionalName || 'GOMEZ ALMEIDA CHRISTIAN ALBERTO'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal italic">
              «La mente, la ciencia y la tecnología unidas por tu bienestar.» — Más que datos, comprensión para la mente.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={onStartNewEncounter}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#00B5B8] via-[#2F80ED] to-[#6345A5] hover:opacity-95 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-white/20"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Iniciar Atención Clínica</span>
            </button>
            <button
              onClick={onNewPatient}
              className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-all border border-slate-300 shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#00B5B8]" />
              <span>Nuevo Paciente</span>
            </button>
          </div>
        </div>

        {/* Barra de Pilares y Paleta de Colores Oficial de la Marca */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-2xs flex items-center gap-3 hover:border-[#00B5B8] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#00B5B8]/12 text-[#00898B] flex items-center justify-center shrink-0 border border-[#00B5B8]/25">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>VALORACIÓN</span>
                <span className="w-2 h-2 rounded-full bg-[#00B5B8]" title="Confianza (#00B5B8)" />
              </div>
              <p className="text-[11px] text-slate-500">Con datos con sentido</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-2xs flex items-center gap-3 hover:border-[#2F80ED] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#2F80ED]/12 text-[#2F80ED] flex items-center justify-center shrink-0 border border-[#2F80ED]/25">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>INTERPRETACIÓN</span>
                <span className="w-2 h-2 rounded-full bg-[#2F80ED]" title="Equilibrio (#2F80ED)" />
              </div>
              <p className="text-[11px] text-slate-500">Con inteligencia clínica</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-2xs flex items-center gap-3 hover:border-[#6345A5] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#6345A5]/12 text-[#6345A5] flex items-center justify-center shrink-0 border border-[#6345A5]/25">
              <BarChart4 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>ANÁLISIS</span>
                <span className="w-2 h-2 rounded-full bg-[#6345A5]" title="Tecnología (#6345A5)" />
              </div>
              <p className="text-[11px] text-slate-500">Para mejores decisiones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas Estadísticas Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--color-bg-card)] p-4 rounded-2xl border border-[var(--color-border)] shadow-xs flex items-center gap-3.5 hover:border-[#00B5B8] transition-all">
          <div className="w-12 h-12 rounded-xl bg-[#00B5B8]/15 text-[#00898B] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Pacientes Activos
            </div>
            <div className="text-2xl font-bold text-[var(--color-text-primary)] mt-0.5">
              {patients.length}
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-bg-card)] p-4 rounded-2xl border border-[var(--color-border)] shadow-xs flex items-center gap-3.5 hover:border-[#2F80ED] transition-all">
          <div className="w-12 h-12 rounded-xl bg-[#2F80ED]/15 text-[#2F80ED] flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Atenciones Clínicas
            </div>
            <div className="text-2xl font-bold text-[var(--color-text-primary)] mt-0.5">
              {records.length}
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-bg-card)] p-4 rounded-2xl border border-[var(--color-border)] shadow-xs flex items-center gap-3.5 hover:border-[#6345A5] transition-all">
          <div className="w-12 h-12 rounded-xl bg-[#6345A5]/15 text-[#6345A5] flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Pruebas Aplicadas
            </div>
            <div className="text-2xl font-bold text-[var(--color-text-primary)] mt-0.5">
              {tests.length}
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-bg-card)] p-4 rounded-2xl border border-[var(--color-border)] shadow-xs flex items-center gap-3.5 hover:border-[#0E172A] transition-all">
          <div className="w-12 h-12 rounded-xl bg-[#0E172A]/10 text-[#0E172A] flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Citas Agendadas
            </div>
            <div className="text-2xl font-bold text-[var(--color-text-primary)] mt-0.5">
              {upcomingAppointments.length}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal: Accesos Rápidos y Próximas Citas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas Citas de Agenda */}
        <div className="lg:col-span-2 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--color-primary)]" />
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
                Próximas Citas Agendadas
              </h2>
            </div>
            <button
              onClick={() => onNavigate('agenda')}
              className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver calendario completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-secondary)] text-xs">
              No hay citas programadas próximamente en la agenda.
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingAppointments.slice(0, 5).map((apt) => {
                const pat = apt.patient_id ? patientsMap[apt.patient_id] : null;
                const nombre = pat ? pat.names : apt.free_name || 'Paciente sin HC';
                return (
                  <div
                    key={apt.id}
                    className="p-3 rounded-xl bg-[var(--color-bg-light)] border border-[var(--color-border)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                        <span>{nombre}</span>
                        {apt.auto_generated && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-semibold">
                            Auto
                          </span>
                        )}
                        {!apt.patient_id && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 font-semibold">
                            Sin HC
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 flex items-center gap-3">
                        <span>📅 {fechaCorta(apt.date)}</span>
                        <span>⏰ {apt.time} ({apt.duration} min)</span>
                        <span>📍 {apt.modality}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('agenda')}
                      className="px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-[11px] font-medium text-[var(--color-text-primary)] cursor-pointer"
                    >
                      Detalles
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Guía Rápida / Seguridad Clínica */}
        <div className="space-y-4">
          <div className="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary-dark)] mb-2">
              <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
              <span>Garantía de Formato PDF</span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              <strong>Solución implementada:</strong> La <strong>Historia Clínica</strong> se exporta automáticamente en <strong>múltiples páginas A4</strong> sin reducir el tamaño de letra; mientras que los <strong>Certificados de Atención y Asistencia</strong> están calibrados para ajustarse en <strong>1 sola página limpia</strong>.
            </p>
          </div>

          <div className="bg-[var(--color-bg-light)] rounded-2xl border border-[var(--color-border)] p-5">
            <h3 className="text-xs font-bold text-[var(--color-text-primary)] mb-2">
              Accesos Directos
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate('admision')}
                className="p-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] text-left hover:border-[var(--color-primary)] transition-all cursor-pointer font-medium"
              >
                Buscar Paciente
              </button>
              <button
                onClick={() => onNavigate('historial')}
                className="p-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] text-left hover:border-[var(--color-primary)] transition-all cursor-pointer font-medium"
              >
                Historial y PDFs
              </button>
              <button
                onClick={() => onNavigate('agenda')}
                className="p-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] text-left hover:border-[var(--color-primary)] transition-all cursor-pointer font-medium"
              >
                Agenda Mensual
              </button>
              <button
                onClick={() => onNavigate('reportes')}
                className="p-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] text-left hover:border-[var(--color-primary)] transition-all cursor-pointer font-medium"
              >
                Exportar Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
