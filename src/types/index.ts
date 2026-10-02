export interface Patient {
  id: string;
  tipo_ident: string; // '6': Cédula, '7': Pasaporte, '5': No Identificado, etc.
  cedula: string;
  prim_apellido: string;
  seg_apellido: string;
  prim_nombre: string;
  seg_nombre: string;
  names: string;
  estado_civil: string;
  sex: string;
  phone: string;
  celular: string;
  email: string;
  birth_date: string;
  nacionalidad: string;
  lugar_nac: string;
  prov_nac: string;
  canton_nac: string;
  parroquia_nac: string;
  pais: string;
  province: string;
  canton: string;
  parish: string;
  calle_principal: string;
  numero: string;
  calle_secundaria: string;
  barrio: string;
  referencia: string;
  etnia: string;
  education: string;
  estado_education: string;
  tipo_empresa: string;
  profesion: string;
  lugar_trabajo: string;
  insurance: string;
  insurance_sec: string;
  bono: string;
  discapacidad: string; // 'SI' | 'NO' | 'NO APLICA'
  tipo_discapacidad?: string;
  porcentaje_disc?: string | number;
  contacto_nombre: string;
  contacto_parentesco: string;
  contacto_telefono: string;
  contacto_direccion: string;
  // Representante Legal (menores de edad o personas que requieran tutor)
  menor_edad?: boolean;
  requiere_representante?: boolean;
  rep_nombre?: string;
  rep_cedula?: string;
  rep_parentesco?: string;
  rep_telefono?: string;
  rep_email?: string;
  grupos_prioritarios?: string[];
  orientacion_sexual?: string;
  identidad_genero?: string;
  created_at: string;
  modified_at?: string;
}

export interface DiagnosticItem {
  tipo: 'principal' | 'secundario' | 'comorbilidad';
  tipoDx: 'primera_vez' | 'subsecuente' | 'recurrente';
  cie11: string;
  dsm5: string;
  especificador?: string;
}

export interface AppliedTest {
  id?: string;
  cardId?: string;
  patient_id?: string;
  record_id?: string;
  test_code: string;
  test_name: string;
  score: string | number;
  max_score?: string | number;
  interpretation: string;
  items_json?: string | null;
  subscales_json?: string | null;
  notes?: string;
  applied_date: string;
  created_at?: string;
}

export interface SessionItem {
  id?: string;
  patient_id?: string;
  record_id?: string;
  date: string;
  nextDate?: string;
  next_date?: string;
  nextTime?: string;
  topics?: string;
  notes?: string;
  created_at?: string;
}

export interface ClinicalRecord {
  id: string;
  patient_id: string;
  orientacion_sexual?: string;
  identidad_genero?: string;
  lugar_tipo: string; // '710': Intramural, '711': Extramural
  lugar_lugar: string;
  lugar_serviciosai?: boolean;
  lugar_fechainicio?: string;
  lugar_fechafin?: string;
  grupos_prioritarios?: string[];
  motivo_paciente: string;
  motivo_terapeuta?: string;
  hea_inicio?: string;
  hea_precipitantes?: string;
  hea_mantenedores?: string;
  hea_soluciones?: string;
  hea_impacto?: string;
  imp_laboral?: boolean;
  imp_familiar?: boolean;
  imp_social?: boolean;
  imp_pareja?: boolean;
  ant_personales?: string;
  ant_familiares?: string;
  ant_medicos?: string;
  ant_tratamientos?: string;
  ant_alcohol?: string;
  ant_tabaco?: string;
  ant_drogas?: string;
  redes_apoyo?: string;
  // MSE
  mse_apariencia?: string;
  mse_actitud?: string;
  mse_lenguaje?: string;
  mse_animo?: string;
  mse_anhedonia?: string;
  mse_pensamiento_curso?: string;
  mse_pensamiento_contenido?: string;
  mse_percepcion?: string;
  mse_cognicion?: string;
  mse_insight?: string;
  mse_juicio?: string;
  mse_observaciones?: string;
  [key: `mse_${string}`]: string | undefined;
  // Diagnósticos
  diagnosticos: DiagnosticItem[];
  dx_principal?: string;
  dx_dsm5?: string;
  dx_dsm5_espec?: string;
  dx_tipo?: string;
  dx_diferenciales?: string;
  hipotesis?: string;
  analisis_funcional?: string;
  // Plan
  plan_enfoque?: string;
  plan_enfoque_otro?: string;
  plan_objetivos?: string;
  plan_tecnicas?: string;
  plan_frecuencia?: string;
  plan_pronostico?: string;
  created_at: string;
  created_by: string;
  created_by_id?: string;
}

export interface Appointment {
  id: string;
  patient_id?: string;
  free_name?: string;
  date: string;
  time: string;
  duration: number; // en minutos
  modality: 'Presencial' | 'Virtual' | 'Telefónica';
  notes?: string;
  auto_generated?: boolean;
  record_id?: string;
  created_at: string;
  modified_at?: string;
}

export interface UserProfessional {
  id: string;
  cedula: string;
  prim_apellido: string;
  seg_apellido?: string;
  prim_nombre: string;
  seg_nombre?: string;
  names: string;
  license?: string; // MSP / Senescyt
  specialty?: string;
  email?: string;
  phone?: string;
  password?: string;
  active?: boolean;
  created_at: string;
}

export interface UnitConfig {
  unit_name?: string;
  unit_type?: string;
  unit_city?: string;
  unit_address?: string;
  unit_phone?: string;
  unit_email?: string;
  unit_zip?: string;
  unit_logo?: string;
  prof_names?: string;
  prof_license?: string;
  prof_specialty?: string;
  prof_email?: string;
  prof_phone?: string;
  active_professional_id?: string;
  palette?: string;
  disabled_tests?: string[];
}

export interface ThemePalette {
  id: string;
  name: string;
  desc: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  bgPage: string;
  bgLight: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}
