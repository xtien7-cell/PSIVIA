import React from 'react';
import { ClinicalRecord, Patient, AppliedTest, SessionItem } from '../../types';
import { fechaCorta } from '../../utils/storage';
import { History, Copy, X, Calendar, User, CheckCircle2 } from 'lucide-react';

interface SectionHistoryModalProps {
  sectionKey: string;
  patient: Patient;
  records: ClinicalRecord[];
  allTests: AppliedTest[];
  allSessions: SessionItem[];
  onClose: () => void;
  onCopyData: (data: Partial<ClinicalRecord> | any) => void;
}

export const SectionHistoryModal: React.FC<SectionHistoryModalProps> = ({
  sectionKey,
  patient,
  records,
  allTests,
  allSessions,
  onClose,
  onCopyData,
}) => {
  // Filtrar atenciones anteriores de este paciente ordenadas de más reciente a más antigua
  const patientRecords = records
    .filter((r) => r.patient_id === patient.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const sectionTitles: Record<string, string> = {
    lugar: 'Lugar y Modalidad de Atención',
    motivo: 'Motivo de Consulta y HEA',
    antecedentes: 'Antecedentes Clínicos y Redes de Apoyo',
    examen: 'Examen del Estado Mental (MSE)',
    pruebas: 'Pruebas Psicométricas Aplicadas',
    formulacion: 'Formulación Diagnóstica y Análisis',
    plan: 'Plan Terapéutico y Objetivos',
    evolucion: 'Sesiones de Evolución',
  };

  const title = sectionTitles[sectionKey] || 'Historial de la Sección';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border shadow-2xl text-xs overflow-hidden">
        {/* Cabecera */}
        <div className="px-5 py-3.5 bg-amber-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <div>
              <h2 className="text-sm font-bold">Historial Previo: {title}</h2>
              <p className="text-[11px] text-amber-100">
                Paciente: <strong>{patient.names}</strong> (C.I. {patient.cedula})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-gray-800">
          {patientRecords.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Este paciente no tiene atenciones clínicas anteriores registradas.
            </div>
          ) : (
            patientRecords.map((rec, idx) => {
              const recTests = allTests.filter((t) => t.record_id === rec.id);
              const recSessions = allSessions.filter((s) => s.record_id === rec.id);

              return (
                <div key={rec.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between border-b pb-2 border-gray-200">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      <span>Atención del {new Date(rec.created_at).toLocaleString('es-EC')}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-gray-200 text-gray-700 font-normal">
                        #{patientRecords.length - idx}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onCopyData(rec);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar a esta consulta</span>
                    </button>
                  </div>

                  {/* Renderizado específico según la sección */}
                  {sectionKey === 'lugar' && (
                    <div className="space-y-1 text-[11.5px]">
                      <div><strong>Tipo:</strong> {rec.lugar_tipo === '710' ? 'Intramural' : 'Extramural'} · <strong>Lugar:</strong> {rec.lugar_lugar}</div>
                      {rec.grupos_prioritarios && rec.grupos_prioritarios.length > 0 && (
                        <div><strong>Grupos prioritarios:</strong> {rec.grupos_prioritarios.join(', ')}</div>
                      )}
                    </div>
                  )}

                  {sectionKey === 'motivo' && (
                    <div className="space-y-1.5 text-[11.5px]">
                      <div><strong>Motivo del paciente:</strong> &quot;{rec.motivo_paciente || '—'}&quot;</div>
                      {rec.hea_inicio && <div><strong>Inicio y curso:</strong> {rec.hea_inicio}</div>}
                      {rec.hea_precipitantes && <div><strong>Precipitantes:</strong> {rec.hea_precipitantes}</div>}
                      {rec.hea_mantenedores && <div><strong>Mantenedores:</strong> {rec.hea_mantenedores}</div>}
                      {rec.hea_soluciones && <div><strong>Soluciones previas:</strong> {rec.hea_soluciones}</div>}
                    </div>
                  )}

                  {sectionKey === 'antecedentes' && (
                    <div className="space-y-1.5 text-[11.5px]">
                      <div><strong>Personales:</strong> {rec.ant_personales || 'Sin antecedentes reportados'}</div>
                      <div><strong>Familiares:</strong> {rec.ant_familiares || 'Niega'}</div>
                      <div><strong>Médicos:</strong> {rec.ant_medicos || 'Niega'}</div>
                      <div><strong>Tratamientos previos:</strong> {rec.ant_tratamientos || 'Ninguno'}</div>
                      <div><strong>Redes de Apoyo:</strong> {rec.redes_apoyo || 'No registradas'}</div>
                      <div><strong>Sustancias:</strong> Alcohol: {rec.ant_alcohol || '—'} · Tabaco: {rec.ant_tabaco || '—'} · Drogas: {rec.ant_drogas || '—'}</div>
                    </div>
                  )}

                  {sectionKey === 'examen' && (
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><strong>Ánimo:</strong> {rec.mse_animo || 'Eutímico'}</div>
                      <div><strong>Conducta:</strong> {rec.mse_apariencia || 'Adecuada'}</div>
                      <div><strong>Pensamiento (curso):</strong> {rec.mse_pensamiento_curso || 'Normal'}</div>
                      <div><strong>Pensamiento (contenido):</strong> {rec.mse_pensamiento_contenido || 'Sin delirios'}</div>
                      <div><strong>Juicio:</strong> {rec.mse_juicio || 'Conservado'}</div>
                      <div><strong>Insight:</strong> {rec.mse_insight || 'Presente'}</div>
                      {rec.mse_observaciones && <div className="col-span-2"><strong>Observaciones:</strong> {rec.mse_observaciones}</div>}
                    </div>
                  )}

                  {sectionKey === 'pruebas' && (
                    <div className="space-y-1">
                      {recTests.length === 0 ? (
                        <p className="text-gray-500">No se aplicaron pruebas en esta consulta.</p>
                      ) : (
                        recTests.map((t, i) => (
                          <div key={i} className="p-2 bg-white rounded border">
                            <strong>{t.test_name}</strong>: {t.score} / {t.max_score || '—'} — {t.interpretation}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {sectionKey === 'formulacion' && (
                    <div className="space-y-1 text-[11.5px]">
                      <div><strong>Diagnósticos:</strong></div>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {rec.diagnosticos && rec.diagnosticos.length > 0 ? (
                          rec.diagnosticos.map((d, i) => (
                            <li key={i}>
                              {d.tipo.toUpperCase()}: <strong>{d.cie11 || d.dsm5}</strong> {d.especificador ? `(${d.especificador})` : ''}
                            </li>
                          ))
                        ) : (
                          <li>{rec.dx_principal || 'Sin diagnóstico registrado'}</li>
                        )}
                      </ul>
                      {rec.dx_diferenciales && <div><strong>Diferenciales:</strong> {rec.dx_diferenciales}</div>}
                      {rec.hipotesis && <div><strong>Hipótesis:</strong> {rec.hipotesis}</div>}
                    </div>
                  )}

                  {sectionKey === 'plan' && (
                    <div className="space-y-1 text-[11.5px]">
                      <div><strong>Enfoque:</strong> {rec.plan_enfoque} · <strong>Frecuencia:</strong> {rec.plan_frecuencia || 'Semanal'}</div>
                      <div><strong>Objetivos:</strong> {rec.plan_objetivos || '—'}</div>
                      <div><strong>Técnicas:</strong> {rec.plan_tecnicas || '—'}</div>
                      <div><strong>Pronóstico:</strong> {rec.plan_pronostico || '—'}</div>
                    </div>
                  )}

                  {sectionKey === 'evolucion' && (
                    <div className="space-y-1">
                      {recSessions.length === 0 ? (
                        <p className="text-gray-500">Sin sesiones registradas en esa fecha.</p>
                      ) : (
                        recSessions.map((s, i) => (
                          <div key={i} className="p-2 bg-white rounded border text-[11px]">
                            <strong>Sesión {fechaCorta(s.date)}:</strong> {s.topics || 'Consulta'}
                            {s.next_date && <div>Próxima fijada: {fechaCorta(s.next_date)}</div>}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
