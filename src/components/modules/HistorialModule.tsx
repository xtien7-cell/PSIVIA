import React, { useState } from 'react';
import { Patient, ClinicalRecord, AppliedTest, SessionItem, UnitConfig } from '../../types';
import { exportMultiPageClinicalRecord } from '../../utils/pdfGenerator';
import { calculateAge, fechaCorta } from '../../utils/storage';
import { Search, FileText, Download, Eye, Calendar, User, X, CheckCircle, Brain, ClipboardList } from 'lucide-react';

interface HistorialModuleProps {
  patients: Patient[];
  records: ClinicalRecord[];
  tests: AppliedTest[];
  sessions: SessionItem[];
  config: UnitConfig;
  onNotify: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const HistorialModule: React.FC<HistorialModuleProps> = ({
  patients,
  records,
  tests,
  sessions,
  config,
  onNotify,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ClinicalRecord | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const patientsMap = React.useMemo(() => {
    const map: Record<string, Patient> = {};
    patients.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [patients]);

  const filteredRecords = records.filter((r) => {
    const q = searchText.toLowerCase().trim();
    if (!q) return true;
    const pat = patientsMap[r.patient_id];
    const patName = pat ? pat.names.toLowerCase() : '';
    const patCedula = pat ? pat.cedula : '';
    const dx = (r.dx_principal || '').toLowerCase();
    const motivo = (r.motivo_paciente || '').toLowerCase();

    return (
      patName.includes(q) ||
      patCedula.includes(q) ||
      dx.includes(q) ||
      motivo.includes(q)
    );
  });

  const handleDownloadMultiPagePdf = async (record: ClinicalRecord) => {
    const pat = patientsMap[record.patient_id];
    if (!pat) {
      onNotify('Paciente no encontrado para este registro.', 'error');
      return;
    }

    const recordTests = tests.filter((t) => t.record_id === record.id);
    const recordSessions = sessions.filter((s) => s.record_id === record.id);

    setIsExportingPdf(true);
    try {
      await exportMultiPageClinicalRecord(
        record,
        pat,
        recordTests,
        recordSessions,
        config,
        (msg) => onNotify(msg, 'info')
      );
      onNotify('Historia clínica exportada en múltiples páginas A4 con tipografía nítida y legible.', 'success');
    } catch (e: any) {
      onNotify(`Error al exportar el PDF: ${e.message}`, 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[var(--color-border)]">
          <div>
            <h1 className="text-base font-bold text-[var(--color-text-primary)]">
              Historial de Atenciones Clínicas y Expedientes
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Consulte atenciones anteriores y descargue la <strong>Historia Clínica en PDF multipágina</strong> con diseño profesional.
            </p>
          </div>

          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              placeholder="Buscar por paciente, cédula o diagnóstico..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Lista de Registros */}
        <div className="space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--color-text-secondary)]">
              No hay atenciones clínicas que coincidan con la búsqueda.
            </div>
          ) : (
            filteredRecords.map((r) => {
              const pat = patientsMap[r.patient_id];
              const patName = pat ? pat.names : 'Paciente no identificado';
              const patCedula = pat ? pat.cedula : '—';
              const fecha = r.created_at ? new Date(r.created_at).toLocaleString('es-EC') : 'Sin fecha';
              const recordTests = tests.filter((t) => t.record_id === r.id);

              return (
                <div
                  key={r.id}
                  className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-light)]/40 hover:bg-[var(--color-bg-light)] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-[var(--color-text-primary)]">{patName}</strong>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary-dark)] font-bold">
                        H.C. {patCedula}
                      </span>
                    </div>

                    <div className="text-[11px] text-[var(--color-text-secondary)] flex flex-wrap gap-x-3">
                      <span>📅 {fecha}</span>
                      <span>👤 {r.created_by || 'Profesional'}</span>
                      {pat && <span>Edad: {calculateAge(pat.birth_date)} años</span>}
                    </div>

                    <div className="text-gray-700 text-xs">
                      <strong>Dx:</strong>{' '}
                      <span className="text-[var(--color-primary-dark)] font-semibold">
                        {r.dx_principal || 'Sin diagnóstico asignado'}
                      </span>
                      {r.diagnosticos && r.diagnosticos.length > 1 && (
                        <span className="text-gray-500 text-[11px]"> (+{r.diagnosticos.length - 1} más)</span>
                      )}
                    </div>

                    {r.motivo_paciente && (
                      <p className="text-gray-500 text-[11px] italic line-clamp-1">
                        &quot;{r.motivo_paciente}&quot;
                      </p>
                    )}

                    {recordTests.length > 0 && (
                      <div className="text-[10px] text-gray-500 font-medium">
                        Pruebas: {recordTests.map((t) => t.test_code).join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => setSelectedRecord(r)}
                      className="px-3 py-1.5 bg-white border border-[var(--color-border)] hover:bg-gray-50 text-[var(--color-text-primary)] rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ver Ficha</span>
                    </button>

                    <button
                      onClick={() => handleDownloadMultiPagePdf(r)}
                      disabled={isExportingPdf}
                      className="px-3.5 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isExportingPdf ? 'Exportando...' : 'Descargar PDF (Multipágina)'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Visor de Ficha en Solo Lectura */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border shadow-2xl text-xs overflow-hidden">
            <div className="px-6 py-4 bg-[var(--color-primary)] text-white flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">
                  Consulta de Atención: {patientsMap[selectedRecord.patient_id]?.names || 'Paciente'}
                </h2>
                <div className="text-[11px] text-white/80">
                  Fecha: {selectedRecord.created_at ? new Date(selectedRecord.created_at).toLocaleString('es-EC') : '—'}
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-gray-800">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="font-bold text-[var(--color-primary-dark)] block mb-1">
                  1. Motivo de Consulta
                </span>
                <p className="text-gray-700 italic">
                  &quot;{selectedRecord.motivo_paciente || 'No especificado'}&quot;
                </p>
                {selectedRecord.motivo_terapeuta && (
                  <p className="text-gray-600 text-[11px] mt-2">
                    <strong>Formulación terapeuta:</strong> {selectedRecord.motivo_terapeuta}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="font-bold text-[var(--color-primary-dark)] block mb-1">
                    2. Diagnósticos Clínicos
                  </span>
                  {selectedRecord.diagnosticos && selectedRecord.diagnosticos.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedRecord.diagnosticos.map((d, i) => (
                        <li key={i} className="text-[11px]">
                          <strong>{d.tipo.toUpperCase()}:</strong> {d.cie11 || d.dsm5}{' '}
                          {d.especificador ? `(${d.especificador})` : ''}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">{selectedRecord.dx_principal || 'Sin diagnóstico'}</p>
                  )}
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="font-bold text-[var(--color-primary-dark)] block mb-1">
                    3. Plan y Enfoque Psicoterapéutico
                  </span>
                  <p className="text-[11px]">
                    <strong>Enfoque:</strong> {selectedRecord.plan_enfoque}
                  </p>
                  <p className="text-[11px]">
                    <strong>Frecuencia:</strong> {selectedRecord.plan_frecuencia || 'Semanal'}
                  </p>
                  {selectedRecord.plan_objetivos && (
                    <p className="text-[11px] mt-1 text-gray-700">
                      <strong>Objetivos:</strong> {selectedRecord.plan_objetivos}
                    </p>
                  )}
                </div>
              </div>

              {selectedRecord.redes_apoyo && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <span className="font-bold text-emerald-950 block mb-1 text-[11px]">
                    Redes de Apoyo (Familiar, Social, Comunitaria, Institucional):
                  </span>
                  <p className="text-[11.5px] text-emerald-900">{selectedRecord.redes_apoyo}</p>
                </div>
              )}

              {selectedRecord.mse_animo && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="font-bold text-[var(--color-primary-dark)] block mb-1">
                    4. Examen Mental (MSE Resumen)
                  </span>
                  <div className="text-[11px] space-y-0.5 text-gray-700">
                    <div><strong>Ánimo:</strong> {selectedRecord.mse_animo}</div>
                    {selectedRecord.mse_pensamiento_contenido && <div><strong>Pensamiento:</strong> {selectedRecord.mse_pensamiento_contenido}</div>}
                    {selectedRecord.mse_juicio && <div><strong>Juicio:</strong> {selectedRecord.mse_juicio}</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">
                ID Registro: {selectedRecord.id}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => handleDownloadMultiPagePdf(selectedRecord)}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF Multipágina</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
