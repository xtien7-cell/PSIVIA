import {
  Patient,
  ClinicalRecord,
  AppliedTest,
  SessionItem,
  Appointment,
  UserProfessional,
  UnitConfig,
} from '../types';

let _uidSeq = 0;
export function uid(): string {
  return `${Date.now().toString(36)}-${(_uidSeq++).toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function esc(s: any): string {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c)
  );
}

export function calcAgeParts(birthStr?: string): { years: number; months: number; days: number } | null {
  if (!birthStr) return null;
  const b = new Date(birthStr);
  const now = new Date();
  if (isNaN(b.getTime())) return null;

  let y = now.getFullYear() - b.getFullYear();
  let m = now.getMonth() - b.getMonth();
  let d = now.getDate() - b.getDate();

  if (d < 0) {
    m--;
    d += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (m < 0) {
    y--;
    m += 12;
  }
  return { years: Math.max(0, y), months: Math.max(0, m), days: Math.max(0, d) };
}

export function calculateAge(birthStr?: string): number | string {
  const parts = calcAgeParts(birthStr);
  return parts ? parts.years : '—';
}

export function fechaEnLetras(date?: Date): string {
  const d = date || new Date();
  const meses = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];
  return `${d.getDate()} de ${meses[d.getMonth()]} del ${d.getFullYear()}`;
}

export function fechaCorta(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const cleanStr =
      typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)
        ? `${dateStr}T12:00:00`
        : dateStr;
    const d = new Date(cleanStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return dateStr;
  }
}

export function timeToMinutes(timeStr?: string): number {
  if (!timeStr) return 0;
  const parts = String(timeStr).split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function checkOverlapAppointments(
  appointments: Appointment[],
  fecha: string,
  horaInicio: string,
  duracionMin: number,
  ignoreId?: string,
  patientsMap?: Record<string, Patient>
): Array<{ id: string; paciente: string; hora: string; duracion: number; horaFin: string }> {
  const ini = timeToMinutes(horaInicio);
  const fin = ini + (Number(duracionMin) || 60);
  const cleanFecha = String(fecha || '').slice(0, 10);
  const conflictos: Array<{ id: string; paciente: string; hora: string; duracion: number; horaFin: string }> = [];

  appointments.forEach((a) => {
    if (ignoreId && String(a.id) === String(ignoreId)) return;
    if (String(a.date || '').slice(0, 10) !== cleanFecha) return;

    const aIni = timeToMinutes(a.time);
    const aFin = aIni + (Number(a.duration) || 60);

    if (ini < aFin && fin > aIni) {
      let nombre = a.free_name || 'Paciente sin HC';
      if (a.patient_id && patientsMap && patientsMap[a.patient_id]) {
        nombre = patientsMap[a.patient_id].names;
      }
      conflictos.push({
        id: a.id,
        paciente: nombre,
        hora: a.time,
        duracion: a.duration,
        horaFin: minutesToTime(aFin),
      });
    }
  });

  return conflictos;
}

export const DB = {
  getPatients(): Patient[] {
    try {
      const data = localStorage.getItem('psivia_patients');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    // Semilla inicial si está vacía
    const initial: Patient[] = [
      {
        id: 'pat-demo-1',
        tipo_ident: '6',
        cedula: '1003456789',
        prim_apellido: 'ANDRADE',
        seg_apellido: 'MORALES',
        prim_nombre: 'SOFÍA',
        seg_nombre: 'VALENTINA',
        names: 'ANDRADE MORALES SOFÍA VALENTINA',
        estado_civil: 'Soltero',
        sex: 'Mujer',
        phone: '062908123',
        celular: '0987654321',
        email: 'sofia.andrade@email.com',
        birth_date: '1998-05-14',
        nacionalidad: '1',
        lugar_nac: 'Atuntaqui',
        prov_nac: '10',
        canton_nac: 'Antonio Ante',
        parroquia_nac: 'Atuntaqui',
        pais: 'ECUADOR',
        province: '10',
        canton: 'Antonio Ante',
        parish: 'Atuntaqui',
        calle_principal: 'Bolívar',
        numero: '12-45',
        calle_secundaria: 'Rocafuerte',
        barrio: 'Central',
        referencia: 'Frente al parque central',
        etnia: 'Mestizo/a',
        education: 'Superior 3er Nivel',
        estado_education: 'Completa',
        tipo_empresa: 'Privada',
        profesion: 'Diseñadora Gráfica',
        lugar_trabajo: 'Agencia Creativa',
        insurance: 'IESS, Afiliado seguro General',
        insurance_sec: '',
        bono: 'Ninguno',
        discapacidad: 'NO',
        contacto_nombre: 'Rosa Morales',
        contacto_parentesco: 'Padre o madre',
        contacto_telefono: '0991234567',
        contacto_direccion: 'Bolívar y Rocafuerte',
        orientacion_sexual: 'Heterosexual',
        identidad_genero: 'Femenino',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
    ];
    localStorage.setItem('psivia_patients', JSON.stringify(initial));
    return initial;
  },

  savePatients(patients: Patient[]): void {
    localStorage.setItem('psivia_patients', JSON.stringify(patients));
  },

  getRecords(): ClinicalRecord[] {
    try {
      const data = localStorage.getItem('psivia_records');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    // Semilla inicial
    const initial: ClinicalRecord[] = [
      {
        id: 'rec-demo-1',
        patient_id: 'pat-demo-1',
        orientacion_sexual: 'Heterosexual',
        identidad_genero: 'Femenino',
        lugar_tipo: '710',
        lugar_lugar: '712',
        lugar_fechainicio: '2026-09-15T09:00',
        lugar_fechafin: '2026-09-15T10:00',
        motivo_paciente: 'Siento mucha angustia por el trabajo, me cuesta concentrarme y a veces siento opresión en el pecho.',
        motivo_terapeuta: 'Paciente acude por sintomatología ansiosa de 3 meses de evolución, asociada a estresores laborales.',
        hea_inicio: 'Inicio insidioso hace 3 meses tras cambio de responsabilidades laborales.',
        hea_precipitantes: 'Sobrecarga de trabajo y temor al fracaso evaluativo.',
        hea_mantenedores: 'Preocupaciones intrusivas, conductas de comprobación excesiva y dificultades para desconectar.',
        hea_soluciones: 'Intentó infusiones relajantes y automedicación ocasional sin éxito.',
        imp_laboral: true,
        imp_familiar: false,
        imp_social: true,
        imp_pareja: false,
        hea_impacto: 'Dificultad para rendir en el trabajo y aislamiento social en fines de semana.',
        ant_personales: 'Episodio de ansiedad en etapa universitaria superado.',
        ant_familiares: 'Madre con antecedentes de cuadro depresivo.',
        ant_medicos: 'Gastritis reactiva a estrés.',
        ant_tratamientos: 'Sin psicofármacos actuales.',
        ant_alcohol: 'Ocasional',
        ant_tabaco: 'Nunca',
        ant_drogas: 'Nunca',
        mse_apariencia: 'Normal / Adecuada a la edad y contexto; Tensión muscular evidente',
        mse_actitud: 'Colaborador y receptivo; Ansioso / Demandante',
        mse_lenguaje: 'Normal, fluido y coherente',
        mse_animo: 'Ansioso / Aprensivo',
        mse_anhedonia: 'Presente - Leve (menor interés ocasional)',
        mse_pensamiento_curso: 'Normal, lógico y orientado a metas',
        mse_pensamiento_contenido: 'Ideas obsesivas / Intrusivas; Rumiación constante',
        mse_percepcion: 'Normal / Sin alteraciones perceptivas',
        mse_cognicion: 'Orientado en tiempo, espacio y persona; Memoria conservada',
        mse_insight: 'Presente y adecuado (reconoce dificultad y busca ayuda)',
        mse_juicio: 'Conservado / Evalúa riesgos adecuadamente',
        mse_observaciones: 'Paciente orientada globalmente, con adecuada capacidad de introspección.',
        diagnosticos: [
          {
            tipo: 'principal',
            tipoDx: 'primera_vez',
            cie11: '6B00 - Trastorno de ansiedad generalizada (TAG)',
            dsm5: 'F41.1 - Trastorno de ansiedad generalizada',
            especificador: 'Severidad moderada',
          },
        ],
        dx_principal: '6B00 - Trastorno de ansiedad generalizada (TAG)',
        dx_dsm5: 'F41.1 - Trastorno de ansiedad generalizada',
        plan_enfoque: 'Terapia Cognitivo-Conductual (TCC)',
        plan_frecuencia: 'Semanal (45-50 min)',
        plan_objetivos: '1. Psicoeducación del modelo cognitivo de la ansiedad.\n2. Entrenamiento en respiración diafragmática y desactivación fisiológica.\n3. Reestructuración de pensamientos catastróficos.',
        plan_tecnicas: 'Autorregistro cognitivo, respiración diafragmática, técnica del árbol de preocupaciones.',
        plan_pronostico: 'Favorable con adherencia al plan de tratamiento psicoterapéutico.',
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        created_by: 'Psic. Carlos Morales',
        created_by_id: 'usr-1',
      },
    ];
    localStorage.setItem('psivia_records', JSON.stringify(initial));
    return initial;
  },

  saveRecords(records: ClinicalRecord[]): void {
    localStorage.setItem('psivia_records', JSON.stringify(records));
  },

  getTests(): AppliedTest[] {
    try {
      const data = localStorage.getItem('psivia_tests');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    const initial: AppliedTest[] = [
      {
        id: 'test-demo-1',
        patient_id: 'pat-demo-1',
        record_id: 'rec-demo-1',
        test_code: 'GAD-7',
        test_name: 'GAD-7 (Escala de Trastorno de Ansiedad Generalizada)',
        score: 13,
        max_score: 21,
        interpretation: 'Ansiedad moderada',
        applied_date: new Date(Date.now() - 15 * 86400000).toISOString().slice(0, 10),
      },
    ];
    localStorage.setItem('psivia_tests', JSON.stringify(initial));
    return initial;
  },

  saveTests(tests: AppliedTest[]): void {
    localStorage.setItem('psivia_tests', JSON.stringify(tests));
  },

  getSessions(): SessionItem[] {
    try {
      const data = localStorage.getItem('psivia_sessions');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    const initial: SessionItem[] = [
      {
        id: 'ses-1',
        patient_id: 'pat-demo-1',
        record_id: 'rec-demo-1',
        date: new Date(Date.now() - 15 * 86400000).toISOString().slice(0, 10),
        next_date: new Date(Date.now() - 8 * 86400000).toISOString().slice(0, 10),
        topics: 'Evaluación clínica inicial, aplicación GAD-7, psicoeducación de ansiedad',
        notes: 'Se explicó la curva de ansiedad y se asignó autorregistro de síntomas.',
      },
      {
        id: 'ses-2',
        patient_id: 'pat-demo-1',
        record_id: 'rec-demo-1',
        date: new Date(Date.now() - 8 * 86400000).toISOString().slice(0, 10),
        next_date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
        topics: 'Revisión de autorregistro, entrenamiento en respiración diafragmática lenta',
        notes: 'Paciente mostró buena comprensión y reducción subjetiva de tensión.',
      },
    ];
    localStorage.setItem('psivia_sessions', JSON.stringify(initial));
    return initial;
  },

  saveSessions(sessions: SessionItem[]): void {
    localStorage.setItem('psivia_sessions', JSON.stringify(sessions));
  },

  getAppointments(): Appointment[] {
    try {
      const data = localStorage.getItem('psivia_appointments');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 2);

    const initial: Appointment[] = [
      {
        id: 'apt-1',
        patient_id: 'pat-demo-1',
        date: targetDate.toISOString().slice(0, 10),
        time: '10:00',
        duration: 60,
        modality: 'Presencial',
        notes: 'Sesión 3: Reestructuración cognitiva de pensamientos automáticos.',
        auto_generated: true,
        created_at: new Date().toISOString(),
      },
    ];
    localStorage.setItem('psivia_appointments', JSON.stringify(initial));
    return initial;
  },

  saveAppointments(appointments: Appointment[]): void {
    localStorage.setItem('psivia_appointments', JSON.stringify(appointments));
  },

  getUsers(): UserProfessional[] {
    try {
      const data = localStorage.getItem('psivia_users');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    const initial: UserProfessional[] = [
      {
        id: 'usr-1',
        cedula: '1802441327',
        prim_apellido: 'GOMEZ',
        seg_apellido: 'ALMEIDA',
        prim_nombre: 'CHRISTIAN',
        seg_nombre: 'ALBERTO',
        names: 'GOMEZ ALMEIDA CHRISTIAN ALBERTO',
        license: '1802441327',
        specialty: 'Psicología Clínica',
        email: 'xtien7@gmail.com',
        phone: '0995123456',
        password: '123',
        active: true,
        created_at: new Date().toISOString(),
      },
    ];
    localStorage.setItem('psivia_users', JSON.stringify(initial));
    return initial;
  },

  saveUsers(users: UserProfessional[]): void {
    localStorage.setItem('psivia_users', JSON.stringify(users));
  },

  getConfig(): UnitConfig {
    try {
      const data = localStorage.getItem('psivia_config');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    const initial: UnitConfig = {
      unit_name: 'PSIVIA — Plataforma Psicológica Inteligente',
      unit_type: 'Valoración, Interpretación y Análisis',
      unit_city: 'Quito',
      unit_address: 'Av. República y Eloy Alfaro, Edificio Corporativo',
      unit_phone: '0995123456',
      unit_email: 'contacto@psivia.app',
      unit_zip: '170150',
      unit_logo: '',
      prof_names: 'GOMEZ ALMEIDA CHRISTIAN ALBERTO',
      prof_license: '1802441327',
      prof_specialty: 'Psicología Clínica',
      prof_email: 'xtien7@gmail.com',
      prof_phone: '0995123456',
      active_professional_id: 'usr-1',
      palette: 'psivia',
      disabled_tests: [],
    };
    localStorage.setItem('psivia_config', JSON.stringify(initial));
    return initial;
  },

  saveConfig(config: UnitConfig): void {
    localStorage.setItem('psivia_config', JSON.stringify(config));
  },

  getDrafts(): Record<string, any> {
    try {
      const data = localStorage.getItem('psivia_drafts');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return {};
  },

  saveDraft(encounterId: string, tab: string, data: any): void {
    if (!encounterId) return;
    const drafts = this.getDrafts();
    if (!drafts[encounterId]) drafts[encounterId] = {};
    drafts[encounterId][tab] = data;
    drafts[encounterId]._updated = new Date().toISOString();
    localStorage.setItem('psivia_drafts', JSON.stringify(drafts));
  },

  clearDraft(encounterId: string): void {
    const drafts = this.getDrafts();
    if (drafts[encounterId]) {
      delete drafts[encounterId];
      localStorage.setItem('psivia_drafts', JSON.stringify(drafts));
    }
  },

  exportBackup(): string {
    const backup = {
      patients: this.getPatients(),
      records: this.getRecords(),
      tests: this.getTests(),
      sessions: this.getSessions(),
      appointments: this.getAppointments(),
      users: this.getUsers(),
      config: this.getConfig(),
      exported_at: new Date().toISOString(),
      version: '1.20.0',
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.patients)) this.savePatients(data.patients);
      if (Array.isArray(data.records)) this.saveRecords(data.records);
      if (Array.isArray(data.tests)) this.saveTests(data.tests);
      if (Array.isArray(data.sessions)) this.saveSessions(data.sessions);
      if (Array.isArray(data.appointments)) this.saveAppointments(data.appointments);
      if (Array.isArray(data.users)) this.saveUsers(data.users);
      if (data.config && typeof data.config === 'object') this.saveConfig(data.config);
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  },
};
