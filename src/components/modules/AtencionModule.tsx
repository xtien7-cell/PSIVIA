import React, { useState, useEffect } from 'react';
import {
  Patient,
  ClinicalRecord,
  AppliedTest,
  SessionItem,
  DiagnosticItem,
  UnitConfig,
} from '../../types';
import {
  DB,
  uid,
  calculateAge,
  fechaCorta,
  fechaEnLetras,
  checkOverlapAppointments,
} from '../../utils/storage';
import {
  TERAPIAS,
  CIE11_FULL,
  DSM5TR,
  MSE_FIELDS,
  PSYCHOMETRIC_TESTS,
} from '../../data/catalogs';
import {
  exportSinglePageCertificate,
  getFechaCiudadLetras,
  getDireccionPaciente,
} from '../../utils/pdfGenerator';
import { PSIVIA_LOGO_DATA_URL } from '../../utils/psiviaLogoAsset';
import { SectionHistoryModal } from './SectionHistoryModal';
import { CartaCompromisoModal } from './CartaCompromisoModal';
import {
  Search,
  Plus,
  Trash2,
  Sparkles,
  Save,
  CheckCircle,
  FileCheck,
  FileText,
  Printer,
  Download,
  X,
  History,
  RotateCcw,
  AlertTriangle,
  Award,
  Calendar,
  Clock,
  MapPin,
  Brain,
  ClipboardList,
} from 'lucide-react';

interface AtencionModuleProps {
  patients: Patient[];
  records: ClinicalRecord[];
  config: UnitConfig;
  initialPatientId?: string | null;
  onFinished: () => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const AtencionModule: React.FC<AtencionModuleProps> = ({
  patients,
  records,
  config,
  initialPatientId,
  onFinished,
  onNotify,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(initialPatientId || null);
  const [encounterId, setEncounterId] = useState<string>(() => uid());
  const [activeTab, setActiveTab] = useState<string>('lugar');
  const [searchPatientText, setSearchPatientText] = useState('');

  // Estados de los campos de la Historia Clínica
  const [orientacionSexual, setOrientacionSexual] = useState('');
  const [identidadGenero, setIdentidadGenero] = useState('');

  // 1. Lugar
  const [lugarTipo, setLugarTipo] = useState('710');
  const [lugarLugar, setLugarLugar] = useState('712');
  const [lugarServiciosai, setLugarServiciosai] = useState(false);
  const [lugarFechaInicio, setLugarFechaInicio] = useState('');
  const [lugarFechaFin, setLugarFechaFin] = useState('');
  const [gruposPrioritarios, setGruposPrioritarios] = useState<string[]>([]);

  // 2. Motivo y HEA
  const [motivoPaciente, setMotivoPaciente] = useState('');
  const [motivoTerapeuta, setMotivoTerapeuta] = useState('');
  const [heaInicio, setHeaInicio] = useState('');
  const [heaPrecipitantes, setHeaPrecipitantes] = useState('');
  const [heaMantenedores, setHeaMantenedores] = useState('');
  const [heaSoluciones, setHeaSoluciones] = useState('');
  const [heaImpacto, setHeaImpacto] = useState('');
  const [impLaboral, setImpLaboral] = useState(false);
  const [impFamiliar, setImpFamiliar] = useState(false);
  const [impSocial, setImpSocial] = useState(false);
  const [impPareja, setImpPareja] = useState(false);

  // 3. Antecedentes
  const [antPersonales, setAntPersonales] = useState('');
  const [antFamiliares, setAntFamiliares] = useState('');
  const [antMedicos, setAntMedicos] = useState('');
  const [antTratamientos, setAntTratamientos] = useState('');
  const [antAlcohol, setAntAlcohol] = useState('');
  const [antTabaco, setAntTabaco] = useState('');
  const [antDrogas, setAntDrogas] = useState('');
  const [redesApoyo, setRedesApoyo] = useState('');
  const [historyModalSection, setHistoryModalSection] = useState<string | null>(null);
  const [showPatientHistoryPanel, setShowPatientHistoryPanel] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  // 4. MSE
  const [mseValues, setMseValues] = useState<Record<string, string>>({});
  const [mseObservaciones, setMseObservaciones] = useState('');

  // 5. Pruebas psicométricas
  const [appliedTests, setAppliedTests] = useState<AppliedTest[]>([]);
  const [selectedTestCode, setSelectedTestCode] = useState('');
  const [currentTestAnswers, setCurrentTestAnswers] = useState<Record<number, number>>({});
  const [customTestModalOpen, setCustomTestModalOpen] = useState(false);
  const [customTestName, setCustomTestName] = useState('');
  const [customTestScore, setCustomTestScore] = useState('');
  const [customTestInterp, setCustomTestInterp] = useState('');

  // 6. Diagnósticos
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticItem[]>([
    { tipo: 'principal', tipoDx: 'primera_vez', cie11: '', dsm5: '', especificador: '' },
  ]);
  const [dxDiferenciales, setDxDiferenciales] = useState('');
  const [hipotesis, setHipotesis] = useState('');
  const [analisisFuncional, setAnalisisFuncional] = useState('');

  // 7. Plan terapéutico
  const [planEnfoque, setPlanEnfoque] = useState('Terapia Cognitivo-Conductual (TCC)');
  const [planEnfoqueOtro, setPlanEnfoqueOtro] = useState('');
  const [planFrecuencia, setPlanFrecuencia] = useState('Semanal (45-50 min)');
  const [planObjetivos, setPlanObjetivos] = useState('');
  const [planTecnicas, setPlanTecnicas] = useState('');
  const [planPronostico, setPlanPronostico] = useState('Favorable con asistencia regular y adherencia terapéutica.');

  // 8. Evolución y Sesiones
  const [sessions, setSessions] = useState<SessionItem[]>([
    {
      date: new Date().toISOString().slice(0, 10),
      topics: 'Sesión inicial: Evaluación clínica y psicoeducación.',
      notes: 'Establecimiento de rapport y fijación de metas terapéuticas.',
    },
  ]);

  // Estados de IA y modales
  const [aiLoading, setAiLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Inicializar paciente si viene de prop
  useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId]);

  // Paciente seleccionado
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;

  // Cargar valores por defecto al seleccionar paciente
  useEffect(() => {
    if (selectedPatient) {
      setOrientacionSexual(selectedPatient.orientacion_sexual || '');
      setIdentidadGenero(selectedPatient.identidad_genero || '');
      const now = new Date();
      const later = new Date(now.getTime() + 60 * 60 * 1000);
      setLugarFechaInicio(now.toISOString().slice(0, 16));
      setLugarFechaFin(later.toISOString().slice(0, 16));
    }
  }, [selectedPatient]);

  // Manejo de diagnósticos
  const addDiagnosticRow = () => {
    setDiagnosticos([
      ...diagnosticos,
      { tipo: 'secundario', tipoDx: 'primera_vez', cie11: '', dsm5: '', especificador: '' },
    ]);
  };

  const removeDiagnosticRow = (index: number) => {
    if (diagnosticos.length <= 1) {
      setDiagnosticos([{ tipo: 'principal', tipoDx: 'primera_vez', cie11: '', dsm5: '', especificador: '' }]);
      return;
    }
    setDiagnosticos(diagnosticos.filter((_, i) => i !== index));
  };

  const updateDiagnostic = (index: number, field: keyof DiagnosticItem, value: any) => {
    const updated = [...diagnosticos];
    updated[index] = { ...updated[index], [field]: value };
    setDiagnosticos(updated);
  };

  // Manejo de MSE checkboxes
  const toggleMseOption = (fieldKey: string, option: string) => {
    const current = mseValues[fieldKey] ? mseValues[fieldKey].split('; ').filter(Boolean) : [];
    const exists = current.includes(option);
    const next = exists ? current.filter((o) => o !== option) : [...current, option];
    setMseValues({ ...mseValues, [fieldKey]: next.join('; ') });
  };

  // Aplicar prueba seleccionada
  const handleScorePsychometricTest = () => {
    const def = PSYCHOMETRIC_TESTS[selectedTestCode];
    if (!def) return;

    let total = 0;
    const missing: number[] = [];

    def.items.forEach((_, i) => {
      const val = currentTestAnswers[i];
      if (val === undefined) {
        missing.push(i + 1);
      } else {
        total += val;
      }
    });

    if (missing.length > 0) {
      onNotify(`Faltan ${missing.length} ítem(s) por responder: (${missing.slice(0, 4).join(', ')}...)`, 'warning');
      return;
    }

    let finalScore = total;
    let maxScore = def.items.length * Math.max(...def.options.map((o) => o.v));
    let interpretation = 'Puntuación procesada';

    if (def.scoring === 'who5') {
      finalScore = total * 4;
      maxScore = 100;
    }

    for (const band of def.interpretation) {
      if (finalScore <= band.max) {
        interpretation = band.label;
        break;
      }
    }

    // Calcular subescalas / clusters (ej: PCL-5, BFI-44)
    let subscalesDetails = '';
    const subscalesData: Record<string, number> = {};
    if (def.subscales) {
      const subscaleParts: string[] = [];
      Object.entries(def.subscales).forEach(([k, sub]) => {
        let subSum = 0;
        sub.items.forEach((idx) => {
          subSum += currentTestAnswers[idx] || 0;
        });
        subscalesData[k] = subSum;
        subscaleParts.push(`${sub.name}: ${subSum}`);
      });
      if (subscaleParts.length > 0) {
        subscalesDetails = ` [Clusters: ${subscaleParts.join(' · ')}]`;
      }
    }

    // Comprobar flags críticos
    let flagAlerts = '';
    if (def.flags) {
      def.flags.forEach((f) => {
        if (currentTestAnswers[f.ifIndex] !== undefined && currentTestAnswers[f.ifIndex] > f.gt) {
          flagAlerts += ` ${f.alert}`;
        }
      });
    }

    const newApplied: AppliedTest = {
      cardId: uid(),
      test_code: selectedTestCode,
      test_name: def.name,
      score: finalScore,
      max_score: maxScore,
      interpretation: `${interpretation}${subscalesDetails}${flagAlerts}`,
      subscales_json: Object.keys(subscalesData).length > 0 ? JSON.stringify(subscalesData) : null,
      applied_date: new Date().toISOString().slice(0, 10),
    };

    setAppliedTests([...appliedTests, newApplied]);
    setSelectedTestCode('');
    setCurrentTestAnswers({});
    onNotify(`Prueba ${selectedTestCode} calculada y agregada`, 'success');
  };

  // Guardar prueba manual
  const handleSaveCustomTest = () => {
    if (!customTestName.trim()) {
      onNotify('Ingrese el nombre de la prueba', 'warning');
      return;
    }
    const newCustom: AppliedTest = {
      cardId: uid(),
      test_code: 'CUSTOM',
      test_name: customTestName.trim(),
      score: customTestScore.trim() || 'Cualitativo',
      max_score: '—',
      interpretation: customTestInterp.trim() || 'Evaluación personalizada',
      applied_date: new Date().toISOString().slice(0, 10),
    };
    setAppliedTests([...appliedTests, newCustom]);
    setCustomTestModalOpen(false);
    setCustomTestName('');
    setCustomTestScore('');
    setCustomTestInterp('');
    onNotify('Prueba personalizada guardada', 'success');
  };

  // IA: Pulir redacción del motivo
  const handleAiCorrectMotivo = async () => {
    const textToClean = motivoPaciente.trim();
    if (textToClean.length < 5) {
      onNotify('Escriba al menos una frase en el motivo para poder optimizar la redacción.', 'warning');
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/correct-motivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToClean }),
      });
      const data = await res.json();
      if (data.correctedText) {
        setMotivoPaciente(data.correctedText);
        onNotify('Redacción clínica optimizada por IA e insertada en el motivo de consulta.', 'success');
      }
    } catch {
      onNotify('No se pudo conectar con el asistente de IA.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // IA: Sugerir diagnósticos CIE-11 y DSM-5-TR
  const handleAiSuggestDx = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/suggest-dx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motivo: { motivoPaciente, motivoTerapeuta },
          hea: { heaInicio, heaPrecipitantes, heaMantenedores, heaImpacto },
          mse: mseValues,
          tests: appliedTests,
          antecedentes: { antPersonales, antFamiliares, antMedicos },
        }),
      });
      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        const newDiags: DiagnosticItem[] = data.suggestions.map((s: any, idx: number) => ({
          tipo: idx === 0 ? 'principal' : 'secundario',
          tipoDx: 'primera_vez',
          cie11: s.system === 'CIE-11' ? `${s.code} - ${s.name}` : '',
          dsm5: s.system === 'DSM-5-TR' ? `${s.code} - ${s.name}` : '',
          especificador: s.justification || '',
        }));

        setDiagnosticos(newDiags);
        if (data.suggestions[0]?.justification) {
          setDxDiferenciales(data.suggestions.map((s: any) => `${s.code} ${s.name}: ${s.justification}`).join('\n'));
        }
        onNotify('Diagnósticos sugeridos por IA agregados a la lista.', 'success');
      }
    } catch {
      onNotify('Error al sugerir diagnósticos con IA.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // IA: Sugerir Plan Terapéutico
  const handleAiSuggestPlan = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/suggest-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enfoque: planEnfoque === 'Otro' ? planEnfoqueOtro : planEnfoque,
          diagnoses: diagnosticos,
          motivo: motivoPaciente || motivoTerapeuta,
          patientInfo: { edad: calculateAge(selectedPatient?.birth_date), sex: selectedPatient?.sex },
        }),
      });
      const data = await res.json();
      if (data.objetivos) setPlanObjetivos(data.objetivos);
      if (data.tecnicas) setPlanTecnicas(data.tecnicas);
      if (data.frecuencia) setPlanFrecuencia(data.frecuencia);
      if (data.pronostico) setPlanPronostico(data.pronostico);
      onNotify('Plan terapéutico estructurado generado con éxito.', 'success');
    } catch {
      onNotify('Error al generar el plan terapéutico.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // Copiar datos del historial previo a la sección actual
  const handleCopyHistoryData = (rec: ClinicalRecord) => {
    if (historyModalSection === 'lugar') {
      if (rec.lugar_tipo) setLugarTipo(rec.lugar_tipo);
      if (rec.lugar_lugar) setLugarLugar(rec.lugar_lugar);
      if (rec.grupos_prioritarios) setGruposPrioritarios(rec.grupos_prioritarios);
    } else if (historyModalSection === 'motivo') {
      if (rec.motivo_paciente) setMotivoPaciente(rec.motivo_paciente);
      if (rec.hea_inicio) setHeaInicio(rec.hea_inicio);
      if (rec.hea_precipitantes) setHeaPrecipitantes(rec.hea_precipitantes);
      if (rec.hea_mantenedores) setHeaMantenedores(rec.hea_mantenedores);
      if (rec.hea_soluciones) setHeaSoluciones(rec.hea_soluciones);
      if (rec.hea_impacto) setHeaImpacto(rec.hea_impacto);
      setImpLaboral(!!rec.imp_laboral);
      setImpFamiliar(!!rec.imp_familiar);
      setImpSocial(!!rec.imp_social);
      setImpPareja(!!rec.imp_pareja);
    } else if (historyModalSection === 'antecedentes') {
      if (rec.ant_personales) setAntPersonales(rec.ant_personales);
      if (rec.ant_familiares) setAntFamiliares(rec.ant_familiares);
      if (rec.ant_medicos) setAntMedicos(rec.ant_medicos);
      if (rec.ant_tratamientos) setAntTratamientos(rec.ant_tratamientos);
      if (rec.ant_alcohol) setAntAlcohol(rec.ant_alcohol);
      if (rec.ant_tabaco) setAntTabaco(rec.ant_tabaco);
      if (rec.ant_drogas) setAntDrogas(rec.ant_drogas);
      if (rec.redes_apoyo) setRedesApoyo(rec.redes_apoyo);
    } else if (historyModalSection === 'examen') {
      const newMse: Record<string, string> = {};
      Object.keys(MSE_FIELDS).forEach((k) => {
        if (rec[`mse_${k}`]) newMse[k] = rec[`mse_${k}`] as string;
      });
      setMseValues(newMse);
      if (rec.mse_observaciones) setMseObservaciones(rec.mse_observaciones);
    } else if (historyModalSection === 'formulacion') {
      if (rec.diagnosticos && rec.diagnosticos.length > 0) {
        setDiagnosticos(rec.diagnosticos);
      }
      if (rec.dx_diferenciales) setDxDiferenciales(rec.dx_diferenciales);
      if (rec.hipotesis) setHipotesis(rec.hipotesis);
      if (rec.analisis_funcional) setAnalisisFuncional(rec.analisis_funcional);
    } else if (historyModalSection === 'plan') {
      if (rec.plan_enfoque) setPlanEnfoque(rec.plan_enfoque);
      if (rec.plan_enfoque_otro) setPlanEnfoqueOtro(rec.plan_enfoque_otro);
      if (rec.plan_frecuencia) setPlanFrecuencia(rec.plan_frecuencia);
      if (rec.plan_objetivos) setPlanObjetivos(rec.plan_objetivos);
      if (rec.plan_tecnicas) setPlanTecnicas(rec.plan_tecnicas);
      if (rec.plan_pronostico) setPlanPronostico(rec.plan_pronostico);
    }
    onNotify('Datos de la atención anterior copiados a la sección actual.', 'success');
  };

  // FINALIZAR Y GUARDAR ATENCIÓN
  const handleFinalizeEncounter = () => {
    if (!selectedPatient) {
      onNotify('Seleccione un paciente primero.', 'error');
      return;
    }

    if (!motivoPaciente.trim() && !diagnosticos[0]?.cie11 && !diagnosticos[0]?.dsm5) {
      onNotify('Debe completar al menos el motivo de consulta o asignar un diagnóstico.', 'warning');
      return;
    }

    // Comprobar conflictos de horario en las sesiones programadas
    const allAppointments = DB.getAppointments();
    for (const s of sessions) {
      if (s.nextDate) {
        const conflictos = checkOverlapAppointments(
          allAppointments,
          s.nextDate,
          s.nextTime || '09:00',
          60,
          undefined,
          { [selectedPatient.id]: selectedPatient }
        );
        if (conflictos.length > 0) {
          const list = conflictos.map((c) => `• ${c.hora} - ${c.horaFin}: ${c.paciente}`).join('\n');
          const confirmMsg = `⚠️ CHOQUE DE HORARIOS:\nLa fecha próxima (${fechaCorta(s.nextDate)} a las ${s.nextTime || '09:00'}) coincide con:\n${list}\n\n¿Desea guardar de todas maneras?`;
          if (!window.confirm(confirmMsg)) {
            onNotify('Atención no guardada. Ajuste la fecha u hora de la próxima cita.', 'warning');
            return;
          }
        }
      }
    }

    const newRecord: ClinicalRecord = {
      id: encounterId,
      patient_id: selectedPatient.id,
      orientacion_sexual: orientacionSexual,
      identidad_genero: identidadGenero,
      lugar_tipo: lugarTipo,
      lugar_lugar: lugarLugar,
      lugar_serviciosai: lugarServiciosai,
      lugar_fechainicio: lugarFechaInicio,
      lugar_fechafin: lugarFechaFin,
      grupos_prioritarios: gruposPrioritarios,
      motivo_paciente: motivoPaciente,
      motivo_terapeuta: motivoTerapeuta || '',
      hea_inicio: heaInicio,
      hea_precipitantes: heaPrecipitantes,
      hea_mantenedores: heaMantenedores,
      hea_soluciones: heaSoluciones,
      hea_impacto: heaImpacto,
      imp_laboral: impLaboral,
      imp_familiar: impFamiliar,
      imp_social: impSocial,
      imp_pareja: impPareja,
      ant_personales: antPersonales,
      ant_familiares: antFamiliares,
      ant_medicos: antMedicos,
      ant_tratamientos: antTratamientos,
      ant_alcohol: antAlcohol,
      ant_tabaco: antTabaco,
      ant_drogas: antDrogas,
      redes_apoyo: redesApoyo,
      ...mseValues,
      mse_observaciones: mseObservaciones,
      diagnosticos,
      dx_principal: diagnosticos[0]?.cie11 || '',
      dx_dsm5: diagnosticos[0]?.dsm5 || '',
      dx_diferenciales: dxDiferenciales,
      hipotesis,
      analisis_funcional: analisisFuncional,
      plan_enfoque: planEnfoque,
      plan_enfoque_otro: planEnfoqueOtro,
      plan_objetivos: planObjetivos,
      plan_tecnicas: planTecnicas,
      plan_frecuencia: planFrecuencia,
      plan_pronostico: planPronostico,
      created_at: new Date().toISOString(),
      created_by: config.prof_names || 'Profesional de Psicología',
      created_by_id: config.active_professional_id || '',
    };

    // Guardar en DB
    const existingRecords = DB.getRecords();
    existingRecords.unshift(newRecord);
    DB.saveRecords(existingRecords);

    // Guardar pruebas
    const existingTests = DB.getTests();
    const updatedTests = appliedTests.map((t) => ({
      ...t,
      id: uid(),
      patient_id: selectedPatient.id,
      record_id: newRecord.id,
      created_at: new Date().toISOString(),
    }));
    DB.saveTests([...updatedTests, ...existingTests]);

    // Guardar sesiones y agendar próximas citas
    const existingSessions = DB.getSessions();
    const updatedSessions = sessions.map((s) => ({
      ...s,
      id: uid(),
      patient_id: selectedPatient.id,
      record_id: newRecord.id,
      created_at: new Date().toISOString(),
    }));
    DB.saveSessions([...updatedSessions, ...existingSessions]);

    // Generar citas automáticas si se definió próxima fecha
    sessions.forEach((s) => {
      if (s.nextDate) {
        allAppointments.push({
          id: uid(),
          patient_id: selectedPatient.id,
          date: s.nextDate,
          time: s.nextTime || '09:00',
          duration: 60,
          modality: 'Presencial',
          notes: `Cita automática generada desde Evolución: ${s.topics || 'Consulta psicológica de seguimiento'}`,
          auto_generated: true,
          record_id: newRecord.id,
          created_at: new Date().toISOString(),
        });
      }
    });
    DB.saveAppointments(allAppointments);

    // Actualizar datos del paciente si cambiaron
    const allPatients = DB.getPatients();
    const patIdx = allPatients.findIndex((p) => p.id === selectedPatient.id);
    if (patIdx >= 0) {
      allPatients[patIdx].orientacion_sexual = orientacionSexual;
      allPatients[patIdx].identidad_genero = identidadGenero;
      DB.savePatients(allPatients);
    }

    onNotify('Historia clínica finalizada y guardada con éxito en el expediente del paciente.', 'success');
    onFinished();
  };

  // Exportar Certificado en 1 página
  const handleExportCertificado = async (elementId: string, filename: string) => {
    setPdfGenerating(true);
    try {
      await exportSinglePageCertificate(elementId, filename, (msg) => onNotify(msg, 'info'));
      onNotify('Certificado descargado en exactamente 1 página A4 limpia.', 'success');
    } catch (e: any) {
      onNotify(`Error al generar el certificado en PDF: ${e.message}`, 'error');
    } finally {
      setPdfGenerating(false);
    }
  };

  // Si no hay paciente seleccionado, mostramos selector
  if (!selectedPatient) {
    const filteredPatients = patients.filter((p) => {
      const q = searchPatientText.toLowerCase().trim();
      if (!q) return true;
      return (
        p.names.toLowerCase().includes(q) ||
        p.cedula.includes(q) ||
        p.prim_apellido.toLowerCase().includes(q)
      );
    });

    return (
      <div className="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[var(--color-border)]">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[var(--color-text-primary)]">
              Iniciar Nueva Atención Clínica Psicológica
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Seleccione un paciente registrado en admisión para abrir su expediente.
            </p>
          </div>
        </div>

        <div className="max-w-md relative mb-4">
          <input
            type="text"
            placeholder="Buscar por cédula o apellidos..."
            value={searchPatientText}
            onChange={(e) => setSearchPatientText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)]"
            autoFocus
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-10 text-xs text-[var(--color-text-secondary)]">
              No se encontraron pacientes con ese criterio de búsqueda.
            </div>
          ) : (
            filteredPatients.map((p) => {
              const recCount = records.filter((r) => r.patient_id === p.id).length;
              return (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] bg-[var(--color-bg-light)]/40 hover:bg-[var(--color-bg-light)] transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <strong className="text-sm text-[var(--color-text-primary)]">{p.names}</strong>
                    <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                      C.I.: <strong>{p.cedula}</strong> · {calculateAge(p.birth_date)} años · {p.sex} · Tel: {p.celular || p.phone || '—'}
                    </div>
                    <div className="text-[10px] text-[var(--color-primary-dark)] mt-1 font-semibold">
                      {recCount} atención(es) previas registradas
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPatientId(p.id)}
                    className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Iniciar Atención</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // TABS DE LA HISTORIA CLÍNICA
  const tabs = [
    { id: 'lugar', label: '1. Lugar', icon: MapPin },
    { id: 'motivo', label: '2. Motivo & HEA', icon: FileText, ai: true },
    { id: 'antecedentes', label: '3. Antecedentes', icon: History },
    { id: 'examen', label: '4. Examen Mental', icon: Brain },
    { id: 'pruebas', label: '5. Pruebas Psicométricas', icon: Award },
    { id: 'formulacion', label: '6. Formulación Dx', icon: CheckCircle, ai: true },
    { id: 'plan', label: '7. Plan Terapéutico', icon: ClipboardList, ai: true },
    { id: 'evolucion', label: '8. Evolución & Citas', icon: Calendar },
    { id: 'certificados', label: '9. Certificados (1 pág)', icon: FileCheck, highlight: true },
  ];

  // Atenciones previas de este paciente específico
  const priorPatientRecords = selectedPatient
    ? records
        .filter((r) => r.patient_id === selectedPatient.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : [];

  return (
    <div className="space-y-4">
      {/* Cabecera del Paciente Activo */}
      <div className="bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary)] text-white rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-base sm:text-lg font-bold">{selectedPatient.names}</span>
              {(selectedPatient.menor_edad || Number(calculateAge(selectedPatient.birth_date)) < 18) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-300 text-amber-950 font-bold">
                  Menor de edad
                </span>
              )}
              {selectedPatient.discapacidad === 'SI' && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/25 font-semibold">
                  Discapacidad ({selectedPatient.tipo_discapacidad || 'Sí'})
                </span>
              )}
            </div>
            <div className="text-xs text-white/90 mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <span>H.C. / C.I.: <strong>{selectedPatient.cedula}</strong></span>
              <span>Edad: <strong>{calculateAge(selectedPatient.birth_date)} años</strong> ({selectedPatient.birth_date})</span>
              <span>Sexo: <strong>{selectedPatient.sex}</strong></span>
              <span>Teléfono: <strong>{selectedPatient.celular || selectedPatient.phone || '—'}</strong></span>
              {selectedPatient.profesion && (
                <span>Ocupación: <strong>{selectedPatient.profesion}</strong></span>
              )}
              {selectedPatient.lugar_trabajo && (
                <span className="bg-white/20 px-2 py-0.5 rounded text-[11px]">
                  🏢 Trabajo: <strong>{selectedPatient.lugar_trabajo}</strong>
                </span>
              )}
              {selectedPatient.rep_nombre && (
                <span className="bg-white/20 px-2 py-0.5 rounded text-[11px]">
                  Tutor: <strong>{selectedPatient.rep_nombre}</strong> ({selectedPatient.rep_parentesco || 'Representante'})
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => setShowConsentModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white text-[var(--color-primary-dark)] hover:bg-slate-100 shadow-xs"
              title="Abrir y descargar Consentimiento Informado / Carta Compromiso en PDF"
            >
              <FileCheck className="w-3.5 h-3.5 text-[#00B5B8]" />
              <span>Consentimiento Informado</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPatientHistoryPanel(!showPatientHistoryPanel)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                showPatientHistoryPanel
                  ? 'bg-amber-300 text-amber-950 ring-2 ring-white'
                  : 'bg-white/25 hover:bg-white/35 text-white'
              }`}
              title="Ver expediente clínico y atenciones anteriores de este paciente"
            >
              <History className="w-3.5 h-3.5" />
              <span>
                {showPatientHistoryPanel ? 'Ocultar Historial' : `Historial del Paciente (${priorPatientRecords.length} previas)`}
              </span>
            </button>

            <div className="flex gap-2">
              <select
                value={orientacionSexual}
                onChange={(e) => setOrientacionSexual(e.target.value)}
                className="text-[11px] bg-white/15 text-white border border-white/30 rounded-lg px-2 py-1.5 focus:bg-white focus:text-gray-900"
              >
                <option value="" className="text-gray-900">Orientación Sexual</option>
                <option value="Heterosexual" className="text-gray-900">Heterosexual</option>
                <option value="Homosexual" className="text-gray-900">Homosexual</option>
                <option value="Lesbiana" className="text-gray-900">Lesbiana</option>
                <option value="Gay" className="text-gray-900">Gay</option>
                <option value="Bisexual" className="text-gray-900">Bisexual</option>
                <option value="Pansexual" className="text-gray-900">Pansexual</option>
                <option value="Asexual" className="text-gray-900">Asexual</option>
                <option value="No responde" className="text-gray-900">No responde</option>
              </select>

              <select
                value={identidadGenero}
                onChange={(e) => setIdentidadGenero(e.target.value)}
                className="text-[11px] bg-white/15 text-white border border-white/30 rounded-lg px-2 py-1.5 focus:bg-white focus:text-gray-900"
              >
                <option value="" className="text-gray-900">Identidad de Género</option>
                <option value="Masculino" className="text-gray-900">Masculino</option>
                <option value="Femenino" className="text-gray-900">Femenino</option>
                <option value="Transmasculino" className="text-gray-900">Transmasculino</option>
                <option value="Transfemenino" className="text-gray-900">Transfemenino</option>
                <option value="No binario" className="text-gray-900">No binario</option>
                <option value="No responde" className="text-gray-900">No responde</option>
              </select>
            </div>

            <button
              onClick={() => setSelectedPatientId(null)}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all cursor-pointer"
              title="Cambiar paciente"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Panel Desplegable de Historial Integral del Paciente */}
      {showPatientHistoryPanel && (
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-800" />
              <div>
                <h3 className="font-bold text-sm text-amber-950">
                  Expediente Clínico Histórico: {selectedPatient.names}
                </h3>
                <p className="text-[11px] text-amber-800">
                  Total de atenciones previas registradas: <strong>{priorPatientRecords.length}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPatientHistoryPanel(false)}
              className="p-1 hover:bg-amber-200 text-amber-900 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {priorPatientRecords.length === 0 ? (
            <div className="text-center py-6 text-xs text-amber-800">
              Este es el primer encuentro clínico de este paciente. No hay atenciones registradas con anterioridad.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {priorPatientRecords.map((rec, idx) => {
                const recTests = DB.getTests().filter((t) => t.record_id === rec.id);
                const recSessions = DB.getSessions().filter((s) => s.record_id === rec.id);

                return (
                  <div key={rec.id} className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b pb-2 border-gray-100">
                      <div className="flex items-center gap-2 text-amber-950 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        <span>Atención #{priorPatientRecords.length - idx} — {new Date(rec.created_at).toLocaleString('es-EC')}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold">
                          Por: {rec.created_by || 'Profesional'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            // Copiar antecedentes o motivo si lo desea
                            if (rec.ant_personales) setAntPersonales(rec.ant_personales);
                            if (rec.ant_familiares) setAntFamiliares(rec.ant_familiares);
                            if (rec.ant_medicos) setAntMedicos(rec.ant_medicos);
                            if (rec.ant_tratamientos) setAntTratamientos(rec.ant_tratamientos);
                            if (rec.redes_apoyo) setRedesApoyo(rec.redes_apoyo);
                            if (rec.ant_alcohol) setAntAlcohol(rec.ant_alcohol);
                            if (rec.ant_tabaco) setAntTabaco(rec.ant_tabaco);
                            if (rec.ant_drogas) setAntDrogas(rec.ant_drogas);
                            onNotify('Antecedentes y redes copiados a la consulta actual.', 'success');
                          }}
                          className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded text-[11px] cursor-pointer"
                          title="Copiar antecedentes y redes de apoyo a la consulta activa"
                        >
                          Copiar Antecedentes
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11.5px] text-gray-800">
                      <div>
                        <strong>Motivo reportado:</strong> &quot;{rec.motivo_paciente || '—'}&quot;
                      </div>
                      <div>
                        <strong>Diagnóstico:</strong>{' '}
                        {rec.diagnosticos && rec.diagnosticos.length > 0 ? (
                          rec.diagnosticos.map((d) => `${d.tipo}: ${d.cie11 || d.dsm5}`).join('; ')
                        ) : (
                          rec.dx_principal || 'Sin diagnóstico'
                        )}
                      </div>
                      {rec.redes_apoyo && (
                        <div className="col-span-full">
                          <strong>Redes de Apoyo:</strong> {rec.redes_apoyo}
                        </div>
                      )}
                      {recTests.length > 0 && (
                        <div className="col-span-full bg-gray-50 p-2 rounded border border-gray-100">
                          <strong>Pruebas psicométricas aplicadas:</strong>{' '}
                          {recTests.map((t) => `${t.test_name}: ${t.score} (${t.interpretation})`).join(' · ')}
                        </div>
                      )}
                      {recSessions.length > 0 && (
                        <div className="col-span-full text-[11px] text-gray-600">
                          <strong>Sesiones de evolución:</strong> {recSessions.length} registrada(s) en esta fecha.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Navegación por Pestañas */}
      <div className="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] shadow-xs overflow-hidden">
        <div className="flex overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-bg-light)]/50 p-1.5 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[var(--color-primary-dark)] shadow-xs border border-[var(--color-border)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--color-primary)]' : ''}`} />
                <span>{tab.label}</span>
                {tab.ai && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 text-blue-700 font-bold">
                    IA
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Contenido de la pestaña */}
        <div className="p-5 sm:p-6 text-xs text-[var(--color-text-primary)]">
          {/* TAB 1: LUGAR */}
          {activeTab === 'lugar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-dark)]">
                  1. Modalidad y Lugar de Atención
                </h2>
                <button
                  type="button"
                  onClick={() => setHistoryModalSection('lugar')}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <History className="w-3.5 h-3.5 text-amber-700" />
                  <span>Historial previo de esta sección</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Tipo de Atención</label>
                  <select
                    value={lugarTipo}
                    onChange={(e) => setLugarTipo(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                  >
                    <option value="710">Intramural (Dentro del establecimiento)</option>
                    <option value="711">Extramural (Comunitaria / Domiciliaria)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Lugar Físico</label>
                  <select
                    value={lugarLugar}
                    onChange={(e) => setLugarLugar(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                  >
                    <option value="712">Establecimiento de Salud</option>
                    <option value="713">Comunidad</option>
                    <option value="714">Centros Educativos</option>
                    <option value="715">Domicilio</option>
                    <option value="719">CDI / CNH</option>
                    <option value="5115">Atención Telemática / Virtual</option>
                    <option value="724">Centro de Rehabilitación</option>
                    <option value="727">Otros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-semibold mb-1">Fecha y Hora de Inicio</label>
                  <input
                    type="datetime-local"
                    value={lugarFechaInicio}
                    onChange={(e) => setLugarFechaInicio(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Fecha y Hora de Fin</label>
                  <input
                    type="datetime-local"
                    value={lugarFechaFin}
                    onChange={(e) => setLugarFechaFin(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={lugarServiciosai}
                    onChange={(e) => setLugarServiciosai(e.target.checked)}
                    className="rounded text-[var(--color-primary)]"
                  />
                  <span>Servicio Ambulatorio Intensivo (SAI)</span>
                </label>
              </div>

              <div className="pt-3 border-t">
                <label className="block font-bold text-[var(--color-primary-dark)] mb-2">
                  Grupos Prioritarios y Vulnerables (MSP)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  {[
                    'Embarazada',
                    'Persona con discapacidad',
                    'Víctima violencia física',
                    'Víctima violencia psicológica',
                    'Víctima violencia sexual',
                    'Cuidados paliativos',
                    'Privada de libertad',
                    'Enfermedades catastróficas',
                  ].map((gp) => (
                    <label key={gp} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={gruposPrioritarios.includes(gp)}
                        onChange={(e) => {
                          if (e.target.checked) setGruposPrioritarios([...gruposPrioritarios, gp]);
                          else setGruposPrioritarios(gruposPrioritarios.filter((x) => x !== gp));
                        }}
                        className="rounded text-[var(--color-primary)]"
                      />
                      <span>{gp}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOTIVO & HEA */}
          {activeTab === 'motivo' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-dark)]">
                  2. Motivo de Consulta e Historia de la Enfermedad Actual (HEA)
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHistoryModalSection('motivo')}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                  >
                    <History className="w-3.5 h-3.5 text-amber-700" />
                    <span>Historial previo de Motivo & HEA</span>
                  </button>
                  <button
                    onClick={handleAiCorrectMotivo}
                    disabled={aiLoading}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-blue-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>{aiLoading ? 'Procesando...' : 'Optimizar Redacción Clínica (IA)'}</span>
                  </button>
                  <button
                    onClick={handleAiSuggestDx}
                    disabled={aiLoading}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-200"
                  >
                    <Brain className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sugerir Diagnósticos (IA)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Motivo en palabras textuales del paciente / usuario *
                </label>
                <textarea
                  rows={3}
                  value={motivoPaciente}
                  onChange={(e) => setMotivoPaciente(e.target.value)}
                  placeholder="Ej: 'No puedo dormir bien desde hace semanas y me dan palpitaciones cuando pienso en el trabajo...'"
                  className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg font-sans"
                />
              </div>

              <div className="pt-2 border-t">
                <h3 className="font-bold text-[var(--color-primary-dark)] mb-3">
                  Evolución del Problema Actual (HEA)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Inicio y curso temporal</label>
                    <textarea
                      rows={2}
                      value={heaInicio}
                      onChange={(e) => setHeaInicio(e.target.value)}
                      placeholder="Momento de aparición, frecuencia e intensidad..."
                      className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Factores precipitantes / desencadenantes</label>
                    <textarea
                      rows={2}
                      value={heaPrecipitantes}
                      onChange={(e) => setHeaPrecipitantes(e.target.value)}
                      placeholder="Eventos estresantes, pérdidas, cambios vitales..."
                      className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Factores mantenedores</label>
                    <textarea
                      rows={2}
                      value={heaMantenedores}
                      onChange={(e) => setHeaMantenedores(e.target.value)}
                      placeholder="Evitaciones, conductas de seguridad, dinámicas familiares..."
                      className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Intentos previos de solución</label>
                    <textarea
                      rows={2}
                      value={heaSoluciones}
                      onChange={(e) => setHeaSoluciones(e.target.value)}
                      placeholder="Automedicación, terapias anteriores, recursos propios..."
                      className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                    />
                  </div>
                </div>

                <div className="mt-3 p-3 bg-[var(--color-bg-light)] rounded-xl border border-[var(--color-border)]">
                  <span className="font-bold text-[var(--color-primary-dark)] block mb-1.5">
                    Impacto Funcional en Áreas Vitales:
                  </span>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={impLaboral}
                        onChange={(e) => setImpLaboral(e.target.checked)}
                        className="rounded text-[var(--color-primary)]"
                      />
                      <span>Laboral / Académico</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={impFamiliar}
                        onChange={(e) => setImpFamiliar(e.target.checked)}
                        className="rounded text-[var(--color-primary)]"
                      />
                      <span>Familiar</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={impSocial}
                        onChange={(e) => setImpSocial(e.target.checked)}
                        className="rounded text-[var(--color-primary)]"
                      />
                      <span>Social e Interpersonal</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={impPareja}
                        onChange={(e) => setImpPareja(e.target.checked)}
                        className="rounded text-[var(--color-primary)]"
                      />
                      <span>Pareja / Conyugal</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={heaImpacto}
                    onChange={(e) => setHeaImpacto(e.target.value)}
                    placeholder="Detalles del deterioro o interferencia funcional..."
                    className="w-full mt-2 px-3 py-1.5 bg-white border border-[var(--color-border)] rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANTECEDENTES */}
          {activeTab === 'antecedentes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-dark)]">
                  3. Antecedentes Clínicos y Personales
                </h2>
                <button
                  type="button"
                  onClick={() => setHistoryModalSection('antecedentes')}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                >
                  <History className="w-3.5 h-3.5 text-amber-700" />
                  <span>Historial previo de Antecedentes y Redes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Personales Psicológicos / Psiquiátricos</label>
                  <textarea
                    rows={2}
                    value={antPersonales}
                    onChange={(e) => setAntPersonales(e.target.value)}
                    placeholder="Cuadros previos, hospitalizaciones, ideación autolítica..."
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Familiares Psiquiátricos</label>
                  <textarea
                    rows={2}
                    value={antFamiliares}
                    onChange={(e) => setAntFamiliares(e.target.value)}
                    placeholder="Trastornos afectivos, consumo, suicidios en familia..."
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Médicos, Quirúrgicos y Alergias</label>
                  <textarea
                    rows={2}
                    value={antMedicos}
                    onChange={(e) => setAntMedicos(e.target.value)}
                    placeholder="Enfermedades crónicas, traumatismos craneales, medicación..."
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tratamientos Previos y Respuesta</label>
                  <textarea
                    rows={2}
                    value={antTratamientos}
                    onChange={(e) => setAntTratamientos(e.target.value)}
                    placeholder="Psicoterapia anterior, psicofármacos utilizados..."
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                  />
                </div>
              </div>

              {/* Redes de Apoyo */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-[var(--color-primary-dark)] text-xs">
                    Redes de Apoyo (Familiar, Social, Comunitaria, Institucional y Cuidadores)
                  </label>
                  <span className="text-[10px] text-gray-500">Soporte emocional y recursos del paciente</span>
                </div>
                <textarea
                  rows={2}
                  value={redesApoyo}
                  onChange={(e) => setRedesApoyo(e.target.value)}
                  placeholder="Describa las redes de apoyo: soporte de familiares directos, pareja, amigos, grupos de apoyo, líderes comunitarios, instituciones de respaldo o cuidador principal..."
                  className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg text-xs"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    'Familia nuclear presente y protectora',
                    'Apoyo afectivo y económico de pareja',
                    'Red de amistades y compañeros cercana',
                    'Sin red de apoyo primaria (aislamiento social)',
                    'Red comunitaria / grupo religioso',
                    'Cuidador/a primario/a permanente',
                    'Institución de acogida / tutela legal',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (!redesApoyo.includes(tag)) {
                          setRedesApoyo(redesApoyo ? `${redesApoyo}. ${tag}` : tag);
                        }
                      }}
                      className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t">
                <span className="font-bold text-[var(--color-primary-dark)] block mb-2">
                  Consumo de Sustancias Psicoactivas
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Alcohol</label>
                    <select
                      value={antAlcohol}
                      onChange={(e) => setAntAlcohol(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                    >
                      <option value="">-- No especificado --</option>
                      <option value="Nunca">Nunca / Abstemio</option>
                      <option value="Ocasional">Ocasional / Social</option>
                      <option value="Frecuente">Frecuente / Riesgo</option>
                      <option value="Diario">Diario / Dependencia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Tabaco</label>
                    <select
                      value={antTabaco}
                      onChange={(e) => setAntTabaco(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                    >
                      <option value="">-- No especificado --</option>
                      <option value="Nunca">Nunca</option>
                      <option value="Ocasional">Ocasional</option>
                      <option value="Frecuente">Frecuente (&lt;10 al día)</option>
                      <option value="Diario">Diario (&gt;10 al día)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Otras Sustancias (Cannabis, etc.)</label>
                    <select
                      value={antDrogas}
                      onChange={(e) => setAntDrogas(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                    >
                      <option value="">-- No especificado --</option>
                      <option value="Nunca">Nunca</option>
                      <option value="Ocasional">Experimental / Ocasional</option>
                      <option value="Frecuente">Frecuente</option>
                      <option value="Diario">Dependencia activa</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXAMEN MENTAL (MSE) */}
          {activeTab === 'examen' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-dark)]">
                  4. Examen del Estado Mental (MSE - Mental Status Examination)
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHistoryModalSection('examen')}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                  >
                    <History className="w-3.5 h-3.5 text-amber-700" />
                    <span>Historial previo de MSE</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMseValues({})}
                    className="text-xs text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Limpiar MSE</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(MSE_FIELDS).map(([key, field]) => {
                  const selectedArr = mseValues[key] ? mseValues[key].split('; ').filter(Boolean) : [];
                  const count = selectedArr.length;
                  return (
                    <div
                      key={key}
                      className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-light)] flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[var(--color-primary-dark)] text-xs">
                          {field.label}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            count > 0 ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {count}
                        </span>
                      </div>

                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {field.options.map((opt) => {
                          const isChecked = selectedArr.includes(opt);
                          return (
                            <label
                              key={opt}
                              className={`flex items-center gap-2 p-1 rounded text-[11px] cursor-pointer transition-all ${
                                isChecked ? 'bg-white font-semibold text-[var(--color-primary-dark)]' : 'hover:bg-white/50 text-gray-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleMseOption(key, opt)}
                                className="rounded text-[var(--color-primary)]"
                              />
                              <span className="truncate">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <label className="block font-semibold mb-1">
                  Observaciones adicionales y juicio clínico global
                </label>
                <textarea
                  rows={2}
                  value={mseObservaciones}
                  onChange={(e) => setMseObservaciones(e.target.value)}
                  placeholder="Detalles observados de la gestualidad, reactividad al evaluador o inconsistencias..."
                  className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                />
              </div>
            </div>
          )}

          {/* TAB 5: PRUEBAS PSICOMÉTRICAS */}
          {activeTab === 'pruebas' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-dark)]">
                  5. Batería de Pruebas y Escalas Psicométricas Estandarizadas
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHistoryModalSection('pruebas')}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                  >
                    <History className="w-3.5 h-3.5 text-amber-700" />
                    <span>Historial previo de Pruebas</span>
                  </button>
                  <button
                    onClick={() => setCustomTestModalOpen(true)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ingreso Manual</span>
                  </button>
                </div>
              </div>

              {/* Selector de prueba */}
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedTestCode}
                  onChange={(e) => {
                    setSelectedTestCode(e.target.value);
                    setCurrentTestAnswers({});
                  }}
                  className="flex-1 px-3.5 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-xl font-medium"
                >
                  <option value="">-- Seleccione una escala psicométrica para aplicar --</option>
                  {Object.entries(PSYCHOMETRIC_TESTS).map(([code, t]) => (
                    <option key={code} value={code}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Formulario interactivo de la prueba seleccionada */}
              {selectedTestCode && PSYCHOMETRIC_TESTS[selectedTestCode] && (
                <div className="p-4 bg-[var(--color-bg-light)] border-2 border-[var(--color-primary)] rounded-2xl space-y-4 animate-in fade-in">
                  <div>
                    <h3 className="font-bold text-sm text-[var(--color-primary-dark)]">
                      {PSYCHOMETRIC_TESTS[selectedTestCode].name}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      {PSYCHOMETRIC_TESTS[selectedTestCode].description}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {PSYCHOMETRIC_TESTS[selectedTestCode].items.map((item, i) => (
                      <div key={i} className="p-2.5 bg-white rounded-xl border border-[var(--color-border)] text-xs">
                        <div className="font-medium text-gray-900 mb-2">
                          {i + 1}. {item}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {PSYCHOMETRIC_TESTS[selectedTestCode].options.map((opt) => {
                            const isSelected = currentTestAnswers[i] === opt.v;
                            return (
                              <button
                                key={opt.v}
                                type="button"
                                onClick={() => setCurrentTestAnswers({ ...currentTestAnswers, [i]: opt.v })}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[var(--color-primary)] text-white shadow-2xs font-bold'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                              >
                                {opt.l}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTestCode('');
                        setCurrentTestAnswers({});
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleScorePsychometricTest}
                      className="px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Calcular Puntaje y Guardar</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de Pruebas Aplicadas */}
              <div>
                <h3 className="text-xs font-bold text-[var(--color-primary-dark)] uppercase tracking-wider mb-2">
                  Pruebas aplicadas en esta consulta ({appliedTests.length})
                </h3>

                {appliedTests.length === 0 ? (
                  <div className="p-4 bg-[var(--color-bg-light)] rounded-xl border border-[var(--color-border)] text-center text-xs text-[var(--color-text-secondary)]">
                    No se han aplicado pruebas en esta atención aún.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {appliedTests.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-xl border border-[var(--color-border)] flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <strong className="text-sm text-[var(--color-primary-dark)]">{t.test_name}</strong>
                          <div className="text-xs text-gray-700 mt-0.5">
                            Puntaje: <strong>{t.score}</strong> / {t.max_score || '—'} ·{' '}
                            <span className="font-semibold text-[var(--color-primary)]">{t.interpretation}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setAppliedTests(appliedTests.filter((_, i) => i !== idx))}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-all"
                          title="Quitar prueba"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: FORMULACIÓN DIAGNÓSTICA */}
          {activeTab === 'formulacion' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-dark)]">
                  6. Formulación Diagnóstica (CIE-11 y DSM-5-TR)
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHistoryModalSection('formulacion')}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                  >
                    <History className="w-3.5 h-3.5 text-amber-700" />
                    <span>Historial previo de Diagnósticos</span>
                  </button>
                  <button
                    onClick={handleAiSuggestDx}
                    disabled={aiLoading}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sugerir con IA</span>
                  </button>
                  <button
                    type="button"
                    onClick={addDiagnosticRow}
                    className="px-3 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Diagnóstico</span>
                  </button>
                </div>
              </div>

              {/* Lista de Diagnósticos */}
              <div className="space-y-3">
                {diagnosticos.map((dx, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border ${
                      dx.tipo === 'principal'
                        ? 'border-[var(--color-primary)] bg-[var(--color-bg-light)]/40'
                        : 'border-[var(--color-border)] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            dx.tipo === 'principal'
                              ? 'bg-[var(--color-primary)] text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {dx.tipo}
                        </span>
                        <span className="text-xs font-semibold text-gray-700">Diagnóstico #{idx + 1}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeDiagnosticRow(idx)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Clasificación CIE-11 (OMS)
                        </label>
                        <input
                          type="text"
                          list="cie11_datalist"
                          value={dx.cie11}
                          onChange={(e) => updateDiagnostic(idx, 'cie11', e.target.value)}
                          placeholder="Escriba código o nombre (ej: 6B00 o Trastorno de ansiedad...)"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[var(--color-border)] rounded-lg font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Equivalente DSM-5-TR (APA)
                        </label>
                        <input
                          type="text"
                          list="dsm5_datalist"
                          value={dx.dsm5}
                          onChange={(e) => updateDiagnostic(idx, 'dsm5', e.target.value)}
                          placeholder="Escriba código o nombre (ej: F41.1...)"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[var(--color-border)] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-100">
                      <div>
                        <label className="block text-[10px] text-gray-500">Jerarquía</label>
                        <select
                          value={dx.tipo}
                          onChange={(e) => updateDiagnostic(idx, 'tipo', e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-white border rounded"
                        >
                          <option value="principal">Principal</option>
                          <option value="secundario">Secundario</option>
                          <option value="comorbilidad">Comorbilidad</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-500">Clase</label>
                        <select
                          value={dx.tipoDx}
                          onChange={(e) => updateDiagnostic(idx, 'tipoDx', e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-white border rounded"
                        >
                          <option value="primera_vez">Primera Vez</option>
                          <option value="subsecuente">Subsecuente</option>
                          <option value="recurrente">Recurrente</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-500">Especificador Clínico</label>
                        <input
                          type="text"
                          value={dx.especificador || ''}
                          onChange={(e) => updateDiagnostic(idx, 'especificador', e.target.value)}
                          placeholder="Ej: Leve, con angustia..."
                          className="w-full px-2 py-1 text-xs bg-white border rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Datalists para autocompletado nativo ultra-rápido */}
              <datalist id="cie11_datalist">
                {Object.entries(CIE11_FULL).map(([code, name]) => (
                  <option key={code} value={`${code} - ${name}`} />
                ))}
              </datalist>

              <datalist id="dsm5_datalist">
                {Object.entries(DSM5TR).map(([code, name]) => (
                  <option key={code} value={`${code} - ${name}`} />
                ))}
              </datalist>

              <div className="pt-2 border-t space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Diagnósticos Diferenciales Considerados</label>
                  <textarea
                    rows={2}
                    value={dxDiferenciales}
                    onChange={(e) => setDxDiferenciales(e.target.value)}
                    placeholder="Reglas de descarte, afecciones médicas descartadas o cuadros afines..."
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Hipótesis Explicativa Bio-Psico-Social</label>
                    <textarea
                      rows={2}
                      value={hipotesis}
                      onChange={(e) => setHipotesis(e.target.value)}
                      placeholder="Factores predisponentes, precipitantes y mantenedores integrados..."
                      className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Análisis Funcional de la Conducta</label>
                    <textarea
                      rows={2}
                      value={analisisFuncional}
                      onChange={(e) => setAnalisisFuncional(e.target.value)}
                      placeholder="Antecedentes, respuestas cognitivo-fisiológicas y consecuentes..."
                      className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PLAN TERAPÉUTICO */}
          {activeTab === 'plan' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-dark)]">
                  7. Plan Terapéutico y Pronóstico
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHistoryModalSection('plan')}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                  >
                    <History className="w-3.5 h-3.5 text-amber-700" />
                    <span>Historial previo de Planes</span>
                  </button>
                  <button
                    onClick={handleAiSuggestPlan}
                    disabled={aiLoading}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-blue-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Diseñar Plan con IA</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Enfoque Psicoterapéutico Basado en Evidencia</label>
                  <select
                    value={planEnfoque}
                    onChange={(e) => setPlanEnfoque(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg font-medium"
                  >
                    {TERAPIAS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Frecuencia y Duración Prevista</label>
                  <input
                    type="text"
                    value={planFrecuencia}
                    onChange={(e) => setPlanFrecuencia(e.target.value)}
                    placeholder="Ej: Semanal (45-50 min), estimado 10 a 12 sesiones"
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                  />
                </div>
              </div>

              {planEnfoque === 'Otro' && (
                <div>
                  <label className="block font-semibold mb-1">Especifique el Enfoque Terapéutico</label>
                  <input
                    type="text"
                    value={planEnfoqueOtro}
                    onChange={(e) => setPlanEnfoqueOtro(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Objetivos Terapéuticos (SMART)</label>
                <textarea
                  rows={3}
                  value={planObjetivos}
                  onChange={(e) => setPlanObjetivos(e.target.value)}
                  placeholder="1. Psicoeducación...\n2. Reestructuración cognitiva...\n3. Entrenamiento en habilidades..."
                  className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Técnicas e Intervenciones Específicas</label>
                <textarea
                  rows={2}
                  value={planTecnicas}
                  onChange={(e) => setPlanTecnicas(e.target.value)}
                  placeholder="Técnicas concretas congruentes con el enfoque seleccionado..."
                  className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Pronóstico Clínico Estimado</label>
                <input
                  type="text"
                  value={planPronostico}
                  onChange={(e) => setPlanPronostico(e.target.value)}
                  placeholder="Ej: Favorable, condicionado a la regularidad de asistencia y soporte familiar."
                  className="w-full px-3 py-2 bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-lg"
                />
              </div>
            </div>
          )}

          {/* TAB 8: EVOLUCIÓN & PRÓXIMA CITA */}
          {activeTab === 'evolucion' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-dark)]">
                    8. Registro de Sesiones de Evolución y Próxima Cita
                  </h2>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">
                    Al asignar una <strong>Fecha y Hora Próxima</strong>, se creará automáticamente en la <strong>Agenda</strong> al finalizar la atención.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHistoryModalSection('evolucion')}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all shrink-0"
                  >
                    <History className="w-3.5 h-3.5 text-amber-700" />
                    <span>Historial previo de Sesiones</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSessions([
                        ...sessions,
                        {
                          date: new Date().toISOString().slice(0, 10),
                          topics: '',
                          notes: '',
                        },
                      ])
                    }
                    className="px-3 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Sesión</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {sessions.map((ses, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-light)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--color-primary-dark)] text-xs">
                        Sesión #{idx + 1}
                      </span>
                      {sessions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSessions(sessions.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Fecha de la Sesión *</label>
                        <input
                          type="date"
                          value={ses.date}
                          onChange={(e) => {
                            const updated = [...sessions];
                            updated[idx].date = e.target.value;
                            setSessions(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-[var(--color-border)] rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                          📅 Próxima Cita (se agenda)
                        </label>
                        <input
                          type="date"
                          value={ses.nextDate || ''}
                          onChange={(e) => {
                            const updated = [...sessions];
                            updated[idx].nextDate = e.target.value;
                            setSessions(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                          ⏰ Hora Próxima
                        </label>
                        <input
                          type="time"
                          value={ses.nextTime || '09:00'}
                          onChange={(e) => {
                            const updated = [...sessions];
                            updated[idx].nextTime = e.target.value;
                            setSessions(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold mb-1">
                        Temas trabajados (Aparecerá en el Certificado de Asistencia)
                      </label>
                      <input
                        type="text"
                        value={ses.topics || ''}
                        onChange={(e) => {
                          const updated = [...sessions];
                          updated[idx].topics = e.target.value;
                          setSessions(updated);
                        }}
                        placeholder="Ej: Reestructuración cognitiva, entrenamiento en relajación progresiva..."
                        className="w-full px-3 py-1.5 bg-white border border-[var(--color-border)] rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold mb-1">
                        Técnicas aplicadas y tareas asignadas para la casa
                      </label>
                      <textarea
                        rows={2}
                        value={ses.notes || ''}
                        onChange={(e) => {
                          const updated = [...sessions];
                          updated[idx].notes = e.target.value;
                          setSessions(updated);
                        }}
                        placeholder="Observaciones de avance del paciente y acuerdos..."
                        className="w-full px-3 py-1.5 bg-white border border-[var(--color-border)] rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: CERTIFICADOS Y CONSENTIMIENTO INFORMADO (1 PÁGINA A4 EXACTA Y LIMPIA) */}
          {activeTab === 'certificados' && (
            <div className="space-y-6">
              <div className="border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-[#00B5B8]/20 text-[#00898B] font-bold text-[10px]">
                    DOCUMENTOS OFICIALES PSIVIA
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-dark)]">
                    9. Emisión de Certificados Clínicos y Consentimiento Informado
                  </h2>
                </div>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
                  Ambos certificados y el consentimiento informado cuentan con el <strong>logotipo oficial de PSIVIA</strong> y están calibrados para exportarse al <strong>ancho completo de la hoja A4</strong> con márgenes equilibrados.
                </p>
              </div>

              {/* Tarjeta de Consentimiento Informado / Carta Compromiso */}
              <div className="border border-teal-200 rounded-2xl p-4 bg-teal-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#00B5B8]/15 text-[#00898B] flex items-center justify-center shrink-0 border border-[#00B5B8]/30">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Consentimiento Informado & Carta Compromiso
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      Documento legal y ético de 2 páginas con acuerdos de intervención, confidencialidad y firmas.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowConsentModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#00B5B8] to-[#2F80ED] hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Consentimiento (PDF)</span>
                </button>
              </div>

              {/* Contenedor Certificado 1: Certificado de Atención / Psicológico */}
              <div className="border border-[var(--color-border)] rounded-2xl p-4 bg-gray-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[var(--color-primary)]" />
                    <span className="font-bold text-sm text-[var(--color-text-primary)]">
                      Certificado de Atención Psicológica
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportCertificado('cert-atencion-preview', `Certificado_Atencion_${selectedPatient.cedula}`)}
                      disabled={pdfGenerating}
                      className="px-3.5 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{pdfGenerating ? 'Generando...' : 'Descargar PDF (1 Página)'}</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir</span>
                    </button>
                  </div>
                </div>

                {/* Hoja A4 renderizable editable directamente */}
                <div className="overflow-x-auto pb-2 flex justify-center">
                  <div
                    id="cert-atencion-preview"
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    style={{
                      width: '794px',
                      minHeight: '1120px',
                      padding: '16mm 18mm 18mm 18mm',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                      fontFamily: "'Open Sans', Arial, sans-serif",
                      fontSize: '10px',
                      lineHeight: '1.45',
                      color: '#1F2937',
                      position: 'relative',
                    }}
                    className="border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  >
                    {/* Encabezado Oficial con Logotipo PSIVIA */}
                    <div style={{ textAlign: 'center', borderBottom: '2.5px solid #00B5B8', paddingBottom: '8px', marginBottom: '12px' }}>
                      <img
                        src={PSIVIA_LOGO_DATA_URL}
                        alt="PSIVIA"
                        style={{ height: '48px', maxWidth: '300px', display: 'block', margin: '0 auto 4px' }}
                      />
                      <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#00B5B8', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                        VALORACIÓN · INTERPRETACIÓN · ANÁLISIS CLÍNICO
                      </div>
                      <div style={{ fontSize: '8.5px', color: '#64748B', marginTop: '2px' }}>
                        {[config.unit_address || 'Av. República y Eloy Alfaro, Quito', config.unit_phone ? `Tel: ${config.unit_phone}` : '', config.unit_email ? `Email: ${config.unit_email}` : 'contacto@psivia.app'].filter(Boolean).join(' · ')}
                      </div>
                    </div>

                    {/* Título Oficial */}
                    <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 800, letterSpacing: '1.5px', color: '#2B5765', textTransform: 'uppercase', margin: '12px 0 16px' }}>
                      CERTIFICADO DE ATENCIÓN PSICOLÓGICA
                    </div>

                    {/* Cuerpo del Certificado */}
                    <div style={{ textAlign: 'justify', lineHeight: '1.5' }}>
                      <p style={{ margin: '0 0 10px 0' }}>
                        Quien suscribe, <strong>{config.prof_names || 'PROFESIONAL DE PSICOLOGÍA'}</strong>
                        {config.prof_license && (
                          <>
                            , con Registro Profesional N° <strong>{config.prof_license}</strong>
                          </>
                        )}
                        {config.prof_specialty && (
                          <>
                            , especialista en <strong>{config.prof_specialty}</strong>
                          </>
                        )}.
                      </p>

                      <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>CERTIFICA:</p>

                      <p style={{ margin: '0 0 10px 0' }}>
                        Haber realizado la valoración y evaluación psicológica clínica al/la siguiente usuario/a:
                      </p>

                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', margin: '6px 0 14px' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '2px 4px', width: '32%', fontWeight: 'bold', color: '#4B5563' }}>Apellidos y Nombres:</td>
                            <td style={{ padding: '2px 4px', fontWeight: 'bold' }}>{selectedPatient.names}</td>
                          </tr>
                          <tr style={{ background: '#F9FAFB' }}>
                            <td style={{ padding: '2px 4px', fontWeight: 'bold', color: '#4B5563' }}>Cédula de Ciudadanía:</td>
                            <td style={{ padding: '2px 4px' }}>{selectedPatient.cedula}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px 4px', fontWeight: 'bold', color: '#4B5563' }}>Edad y Sexo:</td>
                            <td style={{ padding: '2px 4px' }}>{calculateAge(selectedPatient.birth_date)} años · {selectedPatient.sex}</td>
                          </tr>
                          <tr style={{ background: '#F9FAFB' }}>
                            <td style={{ padding: '2px 4px', fontWeight: 'bold', color: '#4B5563' }}>Dirección / Domicilio:</td>
                            <td style={{ padding: '2px 4px' }}>{getDireccionPaciente(selectedPatient)}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px 4px', fontWeight: 'bold', color: '#4B5563' }}>Ocupación / Profesión:</td>
                            <td style={{ padding: '2px 4px' }}>{selectedPatient.profesion || 'No especificada'}</td>
                          </tr>
                          <tr style={{ background: '#F9FAFB' }}>
                            <td style={{ padding: '2px 4px', fontWeight: 'bold', color: '#4B5563' }}>Lugar de Trabajo / Empresa:</td>
                            <td style={{ padding: '2px 4px' }}>{selectedPatient.lugar_trabajo || 'No especificado'} {selectedPatient.tipo_empresa ? `(${selectedPatient.tipo_empresa})` : ''}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px 4px', fontWeight: 'bold', color: '#4B5563' }}>Fecha de Evaluación:</td>
                            <td style={{ padding: '2px 4px' }}>{fechaEnLetras(new Date())}</td>
                          </tr>
                        </tbody>
                      </table>

                      <p style={{ margin: '0 0 6px 0' }}>
                        <strong>1. Motivo de Consulta:</strong> {motivoPaciente || 'Evaluación psicológica integral a solicitud del usuario.'}
                      </p>

                      <p style={{ margin: '0 0 6px 0' }}>
                        <strong>2. Estado Afectivo y Conductual:</strong> {mseValues.animo ? `Presenta afecto ${mseValues.animo.toLowerCase()}.` : 'Sin alteraciones significativas en la reactividad afectiva.'} {mseValues.pensamiento_curso ? `Curso del pensamiento ${mseValues.pensamiento_curso.toLowerCase()}.` : ''}
                      </p>

                      <p style={{ margin: '0 0 4px 0' }}>
                        <strong>3. Diagnóstico Clínico (CIE-11 / DSM-5-TR):</strong>
                      </p>
                      <ul style={{ margin: '0 0 8px 18px', padding: 0 }}>
                        {diagnosticos.filter((d) => d.cie11 || d.dsm5).length > 0 ? (
                          diagnosticos
                            .filter((d) => d.cie11 || d.dsm5)
                            .map((d, i) => (
                              <li key={i}>
                                <strong>{d.cie11 || d.dsm5}</strong>
                                {d.especificador ? ` — ${d.especificador}` : ''} ({d.tipo.toUpperCase()})
                              </li>
                            ))
                        ) : (
                          <li>En proceso de valoración clínica diagnóstica.</li>
                        )}
                      </ul>

                      {appliedTests.length > 0 && (
                        <p style={{ margin: '0 0 8px 0' }}>
                          <strong>4. Pruebas Psicométricas Aplicadas:</strong>{' '}
                          {appliedTests.map((t) => `${t.test_name} (${t.score}/${t.max_score || '—'} - ${t.interpretation})`).join('; ')}.
                        </p>
                      )}

                      <p style={{ margin: '0 0 8px 0' }}>
                        <strong>5. Plan y Recomendaciones:</strong> Se recomienda continuar con intervención en {planEnfoque} con frecuencia {planFrecuencia}. {planPronostico}
                      </p>

                      <p style={{ margin: '14px 0 0 0' }}>
                        Se expide el presente certificado a petición de la parte interesada para los fines legales o administrativos pertinentes.
                      </p>
                    </div>

                    {/* Fecha y Ciudad */}
                    <div style={{ textAlign: 'right', marginTop: '16px', fontSize: '10px', color: '#4B5563' }}>
                      {getFechaCiudadLetras(config)}
                    </div>

                    {/* Firma profesional */}
                    <div style={{ marginTop: '35px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-block', minWidth: '260px', borderTop: '1px solid #1F2937', paddingTop: '6px' }}>
                        <strong style={{ fontSize: '11px', color: '#111827' }}>{config.prof_names || 'PROFESIONAL DE PSICOLOGÍA'}</strong><br />
                        {config.prof_specialty && <span style={{ fontSize: '9.5px', color: '#4B5563' }}>{config.prof_specialty}<br /></span>}
                        {config.prof_license && <span style={{ fontSize: '9.5px', color: '#4B5563' }}>Reg. Prof.: <strong>{config.prof_license}</strong><br /></span>}
                        <span style={{ fontSize: '8.5px', color: '#6B7280' }}>Firma y Sello Profesional</span>
                      </div>
                    </div>

                    {/* Pie de página con marco legal de confidencialidad */}
                    <div style={{ position: 'absolute', bottom: '12mm', left: '16mm', right: '16mm', borderTop: '1px solid #E5E7EB', paddingTop: '5px', textAlign: 'center', fontSize: '8px', color: '#6B7280' }}>
                      Documento de carácter confidencial amparado por el Art. 9 del Acuerdo Ministerial 5216 del Ministerio de Salud Pública del Ecuador.
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenedor Certificado 2: Certificado de Asistencia */}
              <div className="border border-[var(--color-border)] rounded-2xl p-4 bg-gray-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-sm text-[var(--color-text-primary)]">
                      Certificado de Asistencia a Sesiones
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportCertificado('cert-asistencia-preview', `Certificado_Asistencia_${selectedPatient.cedula}`)}
                      disabled={pdfGenerating}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{pdfGenerating ? 'Generando...' : 'Descargar PDF (1 Página)'}</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir</span>
                    </button>
                  </div>
                </div>

                {/* Hoja A4 renderizable editable directamente */}
                <div className="overflow-x-auto pb-2 flex justify-center">
                  <div
                    id="cert-asistencia-preview"
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    style={{
                      width: '794px',
                      minHeight: '1120px',
                      padding: '16mm 18mm 18mm 18mm',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                      fontFamily: "'Open Sans', Arial, sans-serif",
                      fontSize: '10px',
                      lineHeight: '1.45',
                      color: '#1F2937',
                      position: 'relative',
                    }}
                    className="border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  >
                    {/* Encabezado Oficial con Logotipo PSIVIA */}
                    <div style={{ textAlign: 'center', borderBottom: '2.5px solid #00B5B8', paddingBottom: '8px', marginBottom: '12px' }}>
                      <img
                        src={PSIVIA_LOGO_DATA_URL}
                        alt="PSIVIA"
                        style={{ height: '48px', maxWidth: '300px', display: 'block', margin: '0 auto 4px' }}
                      />
                      <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#00B5B8', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                        VALORACIÓN · INTERPRETACIÓN · ANÁLISIS CLÍNICO
                      </div>
                      <div style={{ fontSize: '8.5px', color: '#64748B', marginTop: '2px' }}>
                        {[config.unit_address || 'Av. República y Eloy Alfaro, Quito', config.unit_phone ? `Tel: ${config.unit_phone}` : '', config.unit_email ? `Email: ${config.unit_email}` : 'contacto@psivia.app'].filter(Boolean).join(' · ')}
                      </div>
                    </div>

                    {/* Título Oficial */}
                    <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 800, letterSpacing: '1.5px', color: '#2B5765', textTransform: 'uppercase', margin: '14px 0 16px' }}>
                      CERTIFICADO DE ASISTENCIA A PSICOTERAPIA
                    </div>

                    {/* Cuerpo */}
                    <div style={{ textAlign: 'justify', lineHeight: '1.5' }}>
                      <p style={{ margin: '0 0 12px 0' }}>
                        Quien suscribe, <strong>{config.prof_names || 'PROFESIONAL DE PSICOLOGÍA'}</strong>
                        {config.prof_license && (
                          <>
                            , con Registro Profesional N° <strong>{config.prof_license}</strong>
                          </>
                        )}
                        {config.prof_specialty && (
                          <>
                            , especialista en <strong>{config.prof_specialty}</strong>
                          </>
                        )}.
                      </p>

                      <p style={{ margin: '0 0 12px 0', fontWeight: 'bold' }}>HACE CONSTAR QUE:</p>

                      <p style={{ margin: '0 0 14px 0' }}>
                        El/La señor/a <strong>{selectedPatient.names}</strong>, portador/a de la cédula de ciudadanía o identificación N° <strong>{selectedPatient.cedula}</strong>
                        {selectedPatient.profesion && (
                          <>
                            , de ocupación <strong>{selectedPatient.profesion}</strong>
                          </>
                        )}
                        {selectedPatient.lugar_trabajo && (
                          <>
                            , laborando en <strong>{selectedPatient.lugar_trabajo}</strong>
                          </>
                        )}
                        , asiste y participa regularmente de sesiones de consulta psicológica clínica en esta unidad en las siguientes fechas registradas:
                      </p>

                      {/* Tabla limpia de sesiones trabajadas */}
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', margin: '10px 0 14px' }}>
                        <thead>
                          <tr style={{ background: '#E8F1EC', color: '#1E3E49' }}>
                            <th style={{ padding: '5px', border: '1px solid #CBD5E1', textAlign: 'center', width: '10%' }}>N°</th>
                            <th style={{ padding: '5px', border: '1px solid #CBD5E1', textAlign: 'left', width: '22%' }}>Fecha</th>
                            <th style={{ padding: '5px', border: '1px solid #CBD5E1', textAlign: 'left', width: '68%' }}>Temas y Objetivos Trabajados</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.map((s, idx) => (
                            <tr key={idx} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#F9FBFA' }}>
                              <td style={{ padding: '4px', border: '1px solid #E2E8F0', textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                              <td style={{ padding: '4px', border: '1px solid #E2E8F0' }}>{fechaCorta(s.date)}</td>
                              <td style={{ padding: '4px', border: '1px solid #E2E8F0' }}>{s.topics || 'Sesión de atención e intervención psicológica clínica.'}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: '#E8F1EC' }}>
                            <td colSpan={2} style={{ padding: '5px', border: '1px solid #CBD5E1', textAlign: 'right', fontWeight: 'bold' }}>
                              Total de Asistencias:
                            </td>
                            <td style={{ padding: '5px', border: '1px solid #CBD5E1', fontWeight: 'bold' }}>
                              {sessions.length} sesión(es) completadas
                            </td>
                          </tr>
                        </tfoot>
                      </table>

                      <p style={{ margin: '14px 0 0 0' }}>
                        Es todo cuanto puedo certificar en honor a la verdad, facultando a la parte interesada hacer el uso correspondiente del presente documento.
                      </p>
                    </div>

                    {/* Fecha y Ciudad */}
                    <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '10px', color: '#4B5563' }}>
                      {getFechaCiudadLetras(config)}
                    </div>

                    {/* Firma profesional */}
                    <div style={{ marginTop: '45px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-block', minWidth: '260px', borderTop: '1px solid #1F2937', paddingTop: '6px' }}>
                        <strong style={{ fontSize: '11px', color: '#111827' }}>{config.prof_names || 'PROFESIONAL DE PSICOLOGÍA'}</strong><br />
                        {config.prof_specialty && <span style={{ fontSize: '9.5px', color: '#4B5563' }}>{config.prof_specialty}<br /></span>}
                        {config.prof_license && <span style={{ fontSize: '9.5px', color: '#4B5563' }}>Reg. Prof.: <strong>{config.prof_license}</strong><br /></span>}
                        <span style={{ fontSize: '8.5px', color: '#6B7280' }}>Firma y Sello de Asistencia</span>
                      </div>
                    </div>

                    {/* Pie de página confidencial */}
                    <div style={{ position: 'absolute', bottom: '12mm', left: '16mm', right: '16mm', borderTop: '1px solid #E5E7EB', paddingTop: '5px', textAlign: 'center', fontSize: '8px', color: '#6B7280' }}>
                      Documento expedido de conformidad con la Ley de Estadística y el Acuerdo Ministerial 5216 de Confidencialidad en Salud.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Barra Inferior: Finalizar Atención */}
        <div className="p-4 bg-[var(--color-bg-light)] border-t border-[var(--color-border)] flex items-center justify-between">
          <div className="text-xs text-[var(--color-text-secondary)]">
            Paciente: <strong>{selectedPatient.names}</strong> · H.C. {selectedPatient.cedula}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPatientId(null)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleFinalizeEncounter}
              className="px-6 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>FINALIZAR Y GUARDAR ATENCIÓN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Prueba Personalizada */}
      {customTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full border shadow-xl text-xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-sm text-[var(--color-primary-dark)]">
                Agregar Escala / Prueba Personalizada
              </span>
              <button onClick={() => setCustomTestModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div>
              <label className="block font-semibold mb-1">Nombre de la Prueba *</label>
              <input
                type="text"
                value={customTestName}
                onChange={(e) => setCustomTestName(e.target.value)}
                placeholder="Ej: Escala de Autoestima de Rosenberg, Test de Stroop..."
                className="w-full px-3 py-1.5 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Puntaje Obtenido</label>
              <input
                type="text"
                value={customTestScore}
                onChange={(e) => setCustomTestScore(e.target.value)}
                placeholder="Ej: 32 puntos"
                className="w-full px-3 py-1.5 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Interpretación Clínica</label>
              <input
                type="text"
                value={customTestInterp}
                onChange={(e) => setCustomTestInterp(e.target.value)}
                placeholder="Ej: Autoestima alta / Funcional"
                className="w-full px-3 py-1.5 border rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setCustomTestModalOpen(false)}
                className="px-3 py-1.5 bg-gray-100 rounded-lg text-gray-700 font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCustomTest}
                className="px-4 py-1.5 bg-[var(--color-primary)] text-white rounded-lg font-bold"
              >
                Guardar Prueba
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Historial de Sección */}
      {historyModalSection && selectedPatient && (
        <SectionHistoryModal
          sectionKey={historyModalSection}
          patient={selectedPatient}
          records={records}
          allTests={DB.getTests()}
          allSessions={DB.getSessions()}
          onClose={() => setHistoryModalSection(null)}
          onCopyData={handleCopyHistoryData}
        />
      )}

      {/* Modal de Consentimiento Informado / Carta Compromiso */}
      {showConsentModal && selectedPatient && (
        <CartaCompromisoModal
          patient={selectedPatient}
          config={config}
          onClose={() => setShowConsentModal(false)}
          onNotify={onNotify}
        />
      )}
    </div>
  );
};
