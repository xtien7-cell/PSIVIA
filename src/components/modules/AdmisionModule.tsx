import React, { useState } from 'react';
import { Patient, UnitConfig } from '../../types';
import { DB, uid, calcAgeParts, calculateAge } from '../../utils/storage';
import { PROVINCIAS } from '../../data/catalogs';
import { CartaCompromisoModal } from './CartaCompromisoModal';
import {
  UserPlus,
  Search,
  Edit3,
  Trash2,
  X,
  Save,
  User,
  Calendar,
  MapPin,
  Phone,
  Shield,
  ShieldAlert,
  FileText,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

interface AdmisionModuleProps {
  patients: Patient[];
  config: UnitConfig;
  onRefresh: () => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onStartEncounterWithPatient: (patientId: string) => void;
}

export const AdmisionModule: React.FC<AdmisionModuleProps> = ({
  patients,
  config,
  onRefresh,
  onNotify,
  onStartEncounterWithPatient,
}) => {
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [cartaCompromisoPatient, setCartaCompromisoPatient] = useState<Patient | null>(null);

  // Form states
  const [tipoIdent, setTipoIdent] = useState('6');
  const [cedula, setCedula] = useState('');
  const [primApellido, setPrimApellido] = useState('');
  const [segApellido, setSegApellido] = useState('');
  const [primNombre, setPrimNombre] = useState('');
  const [segNombre, setSegNombre] = useState('');
  const [sex, setSex] = useState('Mujer');
  const [estadoCivil, setEstadoCivil] = useState('Soltero');
  const [birthDate, setBirthDate] = useState('');
  const [celular, setCelular] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('10'); // Imbabura
  const [canton, setCanton] = useState('Antonio Ante');
  const [parish, setParish] = useState('Atuntaqui');
  const [callePrincipal, setCallePrincipal] = useState('');
  const [numero, setNumero] = useState('');
  const [calleSecundaria, setCalleSecundaria] = useState('');
  const [barrio, setBarrio] = useState('');
  const [referencia, setReferencia] = useState('');
  const [etnia, setEtnia] = useState('Mestizo/a');
  const [education, setEducation] = useState('Superior 3er Nivel');
  const [estadoEducation, setEstadoEducation] = useState('Completa');
  const [profesion, setProfesion] = useState('');
  const [lugarTrabajo, setLugarTrabajo] = useState('');
  const [tipoEmpresa, setTipoEmpresa] = useState('Privada');
  const [insurance, setInsurance] = useState('IESS, Afiliado seguro General');
  const [discapacidad, setDiscapacidad] = useState('NO');
  const [tipoDiscapacidad, setTipoDiscapacidad] = useState('');
  const [porcentajeDisc, setPorcentajeDisc] = useState('');
  const [contactoNombre, setContactoNombre] = useState('');
  const [contactoParentesco, setContactoParentesco] = useState('Padre o madre');
  const [contactoTelefono, setContactoTelefono] = useState('');

  // Representante Legal (menores de edad o personas que requieran tutor)
  const [menorEdad, setMenorEdad] = useState(false);
  const [requiereRepresentante, setRequiereRepresentante] = useState(false);
  const [repNombre, setRepNombre] = useState('');
  const [repCedula, setRepCedula] = useState('');
  const [repParentesco, setRepParentesco] = useState('Madre');
  const [repTelefono, setRepTelefono] = useState('');
  const [repEmail, setRepEmail] = useState('');

  // Edad en vivo calculada
  const ageParts = calcAgeParts(birthDate);

  // Actualizar automáticamente si es menor de edad al cambiar fecha de nacimiento
  const handleBirthDateChange = (val: string) => {
    setBirthDate(val);
    if (val) {
      const parts = calcAgeParts(val);
      if (parts && parts.years < 18) {
        setMenorEdad(true);
        setRequiereRepresentante(true);
      } else {
        setMenorEdad(false);
      }
    }
  };

  const openNewPatientModal = () => {
    setEditingPatient(null);
    setTipoIdent('6');
    setCedula('');
    setPrimApellido('');
    setSegApellido('');
    setPrimNombre('');
    setSegNombre('');
    setSex('Mujer');
    setEstadoCivil('Soltero');
    setBirthDate('');
    setCelular('');
    setPhone('');
    setEmail('');
    setProvince('10');
    setCanton('Antonio Ante');
    setParish('Atuntaqui');
    setCallePrincipal('');
    setNumero('');
    setCalleSecundaria('');
    setBarrio('');
    setReferencia('');
    setEtnia('Mestizo/a');
    setEducation('Superior 3er Nivel');
    setEstadoEducation('Completa');
    setProfesion('');
    setLugarTrabajo('');
    setTipoEmpresa('Privada');
    setInsurance('IESS, Afiliado seguro General');
    setDiscapacidad('NO');
    setTipoDiscapacidad('');
    setPorcentajeDisc('');
    setContactoNombre('');
    setContactoParentesco('Padre o madre');
    setContactoTelefono('');

    // Reset rep legal
    setMenorEdad(false);
    setRequiereRepresentante(false);
    setRepNombre('');
    setRepCedula('');
    setRepParentesco('Madre');
    setRepTelefono('');
    setRepEmail('');

    setModalOpen(true);
  };

  const openEditPatientModal = (p: Patient) => {
    setEditingPatient(p);
    setTipoIdent(p.tipo_ident || '6');
    setCedula(p.cedula || '');
    setPrimApellido(p.prim_apellido || '');
    setSegApellido(p.seg_apellido || '');
    setPrimNombre(p.prim_nombre || '');
    setSegNombre(p.seg_nombre || '');
    setSex(p.sex || 'Mujer');
    setEstadoCivil(p.estado_civil || 'Soltero');
    setBirthDate(p.birth_date || '');
    setCelular(p.celular || '');
    setPhone(p.phone || '');
    setEmail(p.email || '');
    setProvince(p.province || '10');
    setCanton(p.canton || '');
    setParish(p.parish || '');
    setCallePrincipal(p.calle_principal || '');
    setNumero(p.numero || '');
    setCalleSecundaria(p.calle_secundaria || '');
    setBarrio(p.barrio || '');
    setReferencia(p.referencia || '');
    setEtnia(p.etnia || 'Mestizo/a');
    setEducation(p.education || 'Superior 3er Nivel');
    setEstadoEducation(p.estado_education || 'Completa');
    setProfesion(p.profesion || '');
    setLugarTrabajo(p.lugar_trabajo || '');
    setTipoEmpresa(p.tipo_empresa || 'Privada');
    setInsurance(p.insurance || 'IESS, Afiliado seguro General');
    setDiscapacidad(p.discapacidad || 'NO');
    setTipoDiscapacidad(p.tipo_discapacidad || '');
    setPorcentajeDisc(String(p.porcentaje_disc || ''));
    setContactoNombre(p.contacto_nombre || '');
    setContactoParentesco(p.contacto_parentesco || 'Padre o madre');
    setContactoTelefono(p.contacto_telefono || '');

    // Cargar datos de representante legal
    const isMinor = p.menor_edad || Number(calculateAge(p.birth_date)) < 18;
    setMenorEdad(Boolean(isMinor));
    setRequiereRepresentante(Boolean(p.requiere_representante || isMinor));
    setRepNombre(p.rep_nombre || p.contacto_nombre || '');
    setRepCedula(p.rep_cedula || '');
    setRepParentesco(p.rep_parentesco || p.contacto_parentesco || 'Madre');
    setRepTelefono(p.rep_telefono || p.contacto_telefono || '');
    setRepEmail(p.rep_email || '');

    setModalOpen(true);
  };

  const handleSavePatient = () => {
    if (!primApellido.trim() || !primNombre.trim()) {
      onNotify('Primer apellido y primer nombre son obligatorios.', 'warning');
      return;
    }
    if (tipoIdent === '6' && (!cedula || cedula.length !== 10)) {
      onNotify('La cédula de identidad debe contener exactamente 10 dígitos.', 'warning');
      return;
    }
    if (!birthDate) {
      onNotify('La fecha de nacimiento es obligatoria.', 'warning');
      return;
    }

    const calculatedYears = ageParts ? ageParts.years : Number(calculateAge(birthDate));
    const isMinor = calculatedYears < 18 || menorEdad;

    if ((isMinor || requiereRepresentante) && !repNombre.trim()) {
      onNotify('Por favor ingrese el nombre del representante legal o tutor.', 'warning');
      return;
    }

    const fullName = `${primApellido.trim().toUpperCase()} ${segApellido.trim().toUpperCase()} ${primNombre.trim().toUpperCase()} ${segNombre.trim().toUpperCase()}`.replace(/\s+/g, ' ').trim();

    const patientData: Patient = {
      id: editingPatient ? editingPatient.id : uid(),
      tipo_ident: tipoIdent,
      cedula: cedula.trim(),
      prim_apellido: primApellido.trim().toUpperCase(),
      seg_apellido: segApellido.trim().toUpperCase(),
      prim_nombre: primNombre.trim().toUpperCase(),
      seg_nombre: segNombre.trim().toUpperCase(),
      names: fullName,
      sex,
      estado_civil: estadoCivil,
      birth_date: birthDate,
      celular: celular.trim(),
      phone: phone.trim(),
      email: email.trim(),
      nacionalidad: '1',
      lugar_nac: canton,
      prov_nac: province,
      canton_nac: canton,
      parroquia_nac: parish,
      pais: 'ECUADOR',
      province,
      canton,
      parish,
      calle_principal: callePrincipal.trim(),
      numero: numero.trim(),
      calle_secundaria: calleSecundaria.trim(),
      barrio: barrio.trim(),
      referencia: referencia.trim(),
      etnia,
      education,
      estado_education: estadoEducation,
      tipo_empresa: tipoEmpresa,
      profesion: profesion.trim(),
      lugar_trabajo: lugarTrabajo.trim(),
      insurance,
      insurance_sec: '',
      bono: 'Ninguno',
      discapacidad,
      tipo_discapacidad: discapacidad === 'SI' ? tipoDiscapacidad : '',
      porcentaje_disc: discapacidad === 'SI' ? porcentajeDisc : '',
      contacto_nombre: contactoNombre.trim() || repNombre.trim(),
      contacto_parentesco: contactoParentesco,
      contacto_telefono: contactoTelefono.trim() || repTelefono.trim(),
      contacto_direccion: '',
      // Representante legal
      menor_edad: isMinor,
      requiere_representante: requiereRepresentante || isMinor,
      rep_nombre: repNombre.trim(),
      rep_cedula: repCedula.trim(),
      rep_parentesco: repParentesco,
      rep_telefono: repTelefono.trim(),
      rep_email: repEmail.trim(),
      orientacion_sexual: editingPatient?.orientacion_sexual || '',
      identidad_genero: editingPatient?.identidad_genero || '',
      created_at: editingPatient ? editingPatient.created_at : new Date().toISOString(),
      modified_at: new Date().toISOString(),
    };

    const currentPatients = DB.getPatients();
    if (editingPatient) {
      const idx = currentPatients.findIndex((p) => p.id === editingPatient.id);
      if (idx >= 0) currentPatients[idx] = patientData;
    } else {
      // Evitar duplicados de cédula
      if (currentPatients.some((p) => p.cedula === patientData.cedula && p.tipo_ident === '6')) {
        onNotify('Ya existe un paciente registrado con ese número de cédula.', 'error');
        return;
      }
      currentPatients.unshift(patientData);
    }

    DB.savePatients(currentPatients);
    onRefresh();
    setModalOpen(false);

    onNotify(
      editingPatient
        ? 'Paciente actualizado exitosamente.'
        : 'Paciente registrado. Puede generar su Carta de Compromiso en PDF a continuación.',
      'success'
    );

    // Sugerir abrir la carta compromiso automáticamente
    setCartaCompromisoPatient(patientData);
  };

  const handleDeletePatient = (patient: Patient) => {
    if (!window.confirm(`¿Está seguro de eliminar el registro de ${patient.names}? Esta acción borrará también sus consultas históricas.`)) {
      return;
    }
    const filtered = patients.filter((p) => p.id !== patient.id);
    DB.savePatients(filtered);

    // Borrar consultas asociadas
    const allRecords = DB.getRecords().filter((r) => r.patient_id !== patient.id);
    DB.saveRecords(allRecords);

    onRefresh();
    onNotify('Registro eliminado de la base de datos.', 'info');
  };

  const filteredPatients = patients.filter((p) => {
    const q = searchText.toLowerCase().trim();
    if (!q) return true;
    return (
      p.names.toLowerCase().includes(q) ||
      p.cedula.includes(q) ||
      p.prim_apellido.toLowerCase().includes(q) ||
      p.profesion.toLowerCase().includes(q) ||
      (p.rep_nombre && p.rep_nombre.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5 w-full">
      <div className="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[var(--color-border)]">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
              Admisión y Directorio de Pacientes
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Registro sociodemográfico completo, filiación clínica, representante legal para menores y descarga de cartas compromiso.
            </p>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Buscar por cédula, apellidos o tutor..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--color-bg-light)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={openNewPatientModal}
              className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuevo Paciente</span>
            </button>
          </div>
        </div>

        {/* Tabla / Tarjetas de Pacientes */}
        <div className="space-y-3">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--color-text-secondary)]">
              No hay pacientes registrados con este criterio.
            </div>
          ) : (
            filteredPatients.map((p) => {
              const isMinor = p.menor_edad || Number(calculateAge(p.birth_date)) < 18;
              const hasRep = p.rep_nombre || p.rep_cedula;

              return (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-light)]/40 hover:bg-[var(--color-bg-light)] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <strong className="text-sm text-[var(--color-text-primary)]">{p.names}</strong>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary-dark)] font-bold">
                        C.I. {p.cedula}
                      </span>
                      {isMinor && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-amber-700" />
                          <span>Menor de edad</span>
                        </span>
                      )}
                      {p.discapacidad === 'SI' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold">
                          Discapacidad ({p.tipo_discapacidad || 'Sí'})
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-[var(--color-text-secondary)] flex flex-wrap gap-x-4 gap-y-0.5">
                      <span>Edad: <strong>{calculateAge(p.birth_date)} años</strong> ({p.birth_date})</span>
                      <span>Sexo: <strong>{p.sex}</strong></span>
                      <span>Estado Civil: <strong>{p.estado_civil}</strong></span>
                      <span>Tel: <strong>{p.celular || p.phone || '—'}</strong></span>
                      {p.profesion && (
                        <span>Ocupación: <strong className="text-[var(--color-primary-dark)]">{p.profesion}</strong></span>
                      )}
                      {p.lugar_trabajo && (
                        <span className="text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          🏢 Trabajo: <strong>{p.lugar_trabajo}</strong>
                        </span>
                      )}
                    </div>

                    {/* Fila del Representante Legal si aplica */}
                    {hasRep && (
                      <div className="text-[11px] bg-amber-50/80 border border-amber-200 text-amber-950 px-2.5 py-1 rounded-lg flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                        <span className="font-bold flex items-center gap-1">
                          <Shield className="w-3 h-3 text-amber-700" />
                          <span>Representante Legal / Tutor:</span>
                        </span>
                        <span><strong>{p.rep_nombre}</strong> ({p.rep_parentesco || 'Tutor'})</span>
                        {p.rep_cedula && <span>C.I.: <strong>{p.rep_cedula}</strong></span>}
                        {p.rep_telefono && <span>Tel: <strong>{p.rep_telefono}</strong></span>}
                      </div>
                    )}

                    <div className="text-[10.5px] text-gray-500">
                      📍 {p.canton || 'Ecuador'}, {p.parish || ''} — {p.calle_principal || 'Sin dirección'}
                    </div>
                  </div>

                  {/* Acciones del paciente */}
                  <div className="flex items-center flex-wrap gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => setCartaCompromisoPatient(p)}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all text-xs"
                      title="Generar y descargar Consentimiento Informado y Carta Compromiso oficial con logotipo PSIVIA"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#00B5B8]" />
                      <span>Consentimiento Informado (PDF)</span>
                    </button>

                    <button
                      onClick={() => onStartEncounterWithPatient(p.id)}
                      className="px-3 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold rounded-lg cursor-pointer shadow-2xs transition-all text-xs"
                    >
                      Atención Clínica
                    </button>

                    <button
                      onClick={() => openEditPatientModal(p)}
                      className="p-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-all"
                      title="Editar datos"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeletePatient(p)}
                      className="p-1.5 bg-white border border-gray-200 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-all"
                      title="Eliminar paciente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Crear / Editar Paciente */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border shadow-2xl text-xs overflow-hidden">
            <div className="px-6 py-4 bg-[var(--color-primary)] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <h2 className="text-sm font-bold">
                  {editingPatient ? `Editar Paciente: ${editingPatient.names}` : 'Registrar Nuevo Paciente en Admisión'}
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-gray-800">
              {/* Sección 1: Identificación y Nombres */}
              <div className="space-y-3">
                <span className="font-bold text-[var(--color-primary-dark)] block text-xs border-b pb-1">
                  1. Identificación y Nombres Oficiales
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Tipo de Identificación *</label>
                    <select
                      value={tipoIdent}
                      onChange={(e) => setTipoIdent(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg bg-[var(--color-bg-light)]"
                    >
                      <option value="6">Cédula de Identidad (10 dígitos)</option>
                      <option value="7">Pasaporte</option>
                      <option value="5">No Identificado</option>
                      <option value="8">Visa / Refugiado</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold mb-1">Número de Identificación *</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej: 1002345678"
                      className="w-full px-3 py-1.5 border rounded-lg font-mono font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Primer Apellido *</label>
                    <input
                      type="text"
                      value={primApellido}
                      onChange={(e) => setPrimApellido(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 border rounded uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Segundo Apellido</label>
                    <input
                      type="text"
                      value={segApellido}
                      onChange={(e) => setSegApellido(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 border rounded uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Primer Nombre *</label>
                    <input
                      type="text"
                      value={primNombre}
                      onChange={(e) => setPrimNombre(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 border rounded uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Segundo Nombre</label>
                    <input
                      type="text"
                      value={segNombre}
                      onChange={(e) => setSegNombre(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 border rounded uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Nacimiento y Edad Exacta */}
              <div className="space-y-3 pt-2 border-t">
                <span className="font-bold text-[var(--color-primary-dark)] block text-xs border-b pb-1">
                  2. Datos de Nacimiento y Demográficos
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Fecha de Nacimiento *</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Edad Calculada Exacta</label>
                    <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold flex items-center justify-between">
                      <span>{ageParts ? `${ageParts.years} años, ${ageParts.months} m, ${ageParts.days} d` : '—'}</span>
                      {ageParts && ageParts.years < 18 && (
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                          Menor
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Sexo *</label>
                    <select
                      value={sex}
                      onChange={(e) => setSex(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg"
                    >
                      <option value="Mujer">Mujer</option>
                      <option value="Hombre">Hombre</option>
                      <option value="Intersexual">Intersexual</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Estado Civil</label>
                    <select
                      value={estadoCivil}
                      onChange={(e) => setEstadoCivil(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg"
                    >
                      <option value="Soltero">Soltero/a</option>
                      <option value="Casado">Casado/a</option>
                      <option value="Unión de hecho">Unión de hecho</option>
                      <option value="Divorciado">Divorciado/a</option>
                      <option value="Viudo">Viudo/a</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Autoidentificación Étnica</label>
                    <select
                      value={etnia}
                      onChange={(e) => setEtnia(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg"
                    >
                      <option value="Mestizo/a">Mestizo/a</option>
                      <option value="Indígena">Indígena</option>
                      <option value="Afroecuatoriano/a">Afroecuatoriano/a</option>
                      <option value="Blanco/a">Blanco/a</option>
                      <option value="Montubio/a">Montubio/a</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Nivel de Educación</label>
                    <select
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg"
                    >
                      <option value="Ninguno">Ninguno</option>
                      <option value="Básica">Educación Básica</option>
                      <option value="Bachillerato">Bachillerato</option>
                      <option value="Superior Técnico">Superior Técnico</option>
                      <option value="Superior 3er Nivel">Superior 3er Nivel</option>
                      <option value="Postgrado 4to Nivel">Postgrado 4to Nivel</option>
                    </select>
                  </div>
                </div>

                {/* Ocupación y Lugar de Trabajo */}
                <div className="pt-2 border-t border-gray-100">
                  <span className="font-bold text-[var(--color-primary-dark)] text-xs block mb-2">
                    Información Ocupacional y Lugar de Trabajo (Requerido para Certificados e Informes)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">
                        Ocupación / Profesión *
                      </label>
                      <input
                        type="text"
                        value={profesion}
                        onChange={(e) => setProfesion(e.target.value)}
                        placeholder="Ej: Docente, Estudiante, Ingeniero..."
                        className="w-full px-3 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">
                        Lugar de Trabajo / Empresa *
                      </label>
                      <input
                        type="text"
                        value={lugarTrabajo}
                        onChange={(e) => setLugarTrabajo(e.target.value)}
                        placeholder="Ej: Ministerio de Educación, Empresa XYZ..."
                        className="w-full px-3 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">
                        Tipo de Empresa / Condición Laboral
                      </label>
                      <select
                        value={tipoEmpresa}
                        onChange={(e) => setTipoEmpresa(e.target.value)}
                        className="w-full px-3 py-1.5 border rounded-lg text-xs"
                      >
                        <option value="Privada">Empresa Privada</option>
                        <option value="Pública">Sector Público</option>
                        <option value="Independiente">Independiente / Autónomo</option>
                        <option value="Estudiante">Estudiante</option>
                        <option value="Quehaceres domésticos">Quehaceres domésticos</option>
                        <option value="Jubilado/a">Jubilado/a</option>
                        <option value="Desempleado/a">Desempleado/a / Sin empleo actual</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: REPRESENTANTE LEGAL (PARA MENORES O TUTELA) */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between border-b pb-1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-[var(--color-primary-dark)] text-xs">
                      3. Representación Legal / Padre, Madre o Tutor Legal
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-amber-900">
                    <input
                      type="checkbox"
                      checked={requiereRepresentante || menorEdad}
                      onChange={(e) => setRequiereRepresentante(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Requiere Representación Legal / Menor de edad</span>
                  </label>
                </div>

                {(requiereRepresentante || menorEdad) && (
                  <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-xl space-y-3">
                    <div className="flex items-start gap-2 text-[11px] text-amber-900">
                      <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span>
                        <strong>Requerimiento Legal / Código de la Niñez y Adolescencia:</strong> Para pacientes menores de 18 años o personas bajo representación legal, los datos del tutor son obligatorios para la suscripción del Consentimiento Informado y la Carta Compromiso.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold mb-1 text-amber-950">
                          Nombre Completo del Padre/Madre o Tutor Legal *
                        </label>
                        <input
                          type="text"
                          value={repNombre}
                          onChange={(e) => setRepNombre(e.target.value.toUpperCase())}
                          placeholder="Nombres y Apellidos del Representante"
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold mb-1 text-amber-950">
                          Cédula / Identificación del Representante *
                        </label>
                        <input
                          type="text"
                          maxLength={10}
                          value={repCedula}
                          onChange={(e) => setRepCedula(e.target.value.replace(/\D/g, ''))}
                          placeholder="Cédula de 10 dígitos"
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold mb-1 text-amber-950">
                          Parentesco o Relación con el Paciente
                        </label>
                        <select
                          value={repParentesco}
                          onChange={(e) => setRepParentesco(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                        >
                          <option value="Madre">Madre</option>
                          <option value="Padre">Padre</option>
                          <option value="Tutor Legal">Tutor/a Legal</option>
                          <option value="Abuelo/a">Abuelo/a</option>
                          <option value="Tío/a">Tío/a</option>
                          <option value="Hermano/a Mayor">Hermano/a Mayor</option>
                          <option value="Representante Institucional">Representante Institucional</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold mb-1 text-amber-950">
                          Teléfono / Celular del Representante *
                        </label>
                        <input
                          type="text"
                          value={repTelefono}
                          onChange={(e) => setRepTelefono(e.target.value)}
                          placeholder="Ej: 0991234567"
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold mb-1 text-amber-950">
                          Correo Electrónico del Representante
                        </label>
                        <input
                          type="email"
                          value={repEmail}
                          onChange={(e) => setRepEmail(e.target.value)}
                          placeholder="correo@ejemplo.com"
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sección 4: Ubicación y Contacto */}
              <div className="space-y-3 pt-2 border-t">
                <span className="font-bold text-[var(--color-primary-dark)] block text-xs border-b pb-1">
                  4. Ubicación y Contacto
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Provincia</label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg"
                    >
                      {PROVINCIAS.map((pr) => (
                        <option key={pr.code} value={pr.code}>
                          {pr.code} - {pr.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Cantón</label>
                    <input
                      type="text"
                      value={canton}
                      onChange={(e) => setCanton(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Parroquia</label>
                    <input
                      type="text"
                      value={parish}
                      onChange={(e) => setParish(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Calle Principal</label>
                    <input
                      type="text"
                      value={callePrincipal}
                      onChange={(e) => setCallePrincipal(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">N° Inmueble</label>
                    <input
                      type="text"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Celular del Paciente</label>
                    <input
                      type="text"
                      value={celular}
                      onChange={(e) => setCelular(e.target.value)}
                      placeholder="Ej: 0987654321"
                      className="w-full px-3 py-1.5 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Contacto de Emergencia Adicional</label>
                    <input
                      type="text"
                      value={contactoNombre}
                      onChange={(e) => setContactoNombre(e.target.value)}
                      placeholder="Nombre del familiar de apoyo"
                      className="w-full px-3 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Teléfono de Emergencia</label>
                    <input
                      type="text"
                      value={contactoTelefono}
                      onChange={(e) => setContactoTelefono(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 5: Discapacidad y Seguro */}
              <div className="space-y-3 pt-2 border-t">
                <span className="font-bold text-[var(--color-primary-dark)] block text-xs border-b pb-1">
                  5. Discapacidad y Cobertura de Salud
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">¿Tiene Discapacidad?</label>
                    <select
                      value={discapacidad}
                      onChange={(e) => setDiscapacidad(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg"
                    >
                      <option value="NO">NO</option>
                      <option value="SI">SÍ</option>
                      <option value="NO APLICA">NO APLICA</option>
                    </select>
                  </div>
                  {discapacidad === 'SI' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Tipo de Discapacidad</label>
                        <select
                          value={tipoDiscapacidad}
                          onChange={(e) => setTipoDiscapacidad(e.target.value)}
                          className="w-full px-3 py-1.5 border rounded-lg"
                        >
                          <option value="Física">Física / Motriz</option>
                          <option value="Psicosocial">Psicosocial / Mental</option>
                          <option value="Intelectual">Intelectual</option>
                          <option value="Visual">Visual</option>
                          <option value="Auditiva">Auditiva</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">% Discapacidad Carné</label>
                        <input
                          type="number"
                          value={porcentajeDisc}
                          onChange={(e) => setPorcentajeDisc(e.target.value)}
                          placeholder="Ej: 45"
                          className="w-full px-3 py-1.5 border rounded-lg"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePatient}
                className="px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{editingPatient ? 'Guardar Cambios' : 'Registrar y Habilitar Carta Compromiso'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Carta Compromiso / Consentimiento Informado en PDF */}
      {cartaCompromisoPatient && (
        <CartaCompromisoModal
          patient={cartaCompromisoPatient}
          config={config}
          onClose={() => setCartaCompromisoPatient(null)}
          onNotify={onNotify}
        />
      )}
    </div>
  );
};
