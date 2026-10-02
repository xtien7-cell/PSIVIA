import React, { useState } from 'react';
import { UserProfessional } from '../types';
import { DB, uid } from '../utils/storage';
import { HeartPulse, Lock, UserCheck, ShieldCheck, UserPlus, ArrowRight, ArrowLeft } from 'lucide-react';
import { APP_NAME, APP_FULL_NAME } from '../data/catalogs';

interface GateModalProps {
  onLoginSuccess: (user: UserProfessional) => void;
}

export const GateModal: React.FC<GateModalProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'cedula' | 'password' | 'register' | 'agreement'>('cedula');
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfessional | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Registro state
  const [regCedula, setRegCedula] = useState('');
  const [regPrimApellido, setRegPrimApellido] = useState('');
  const [regSegApellido, setRegSegApellido] = useState('');
  const [regPrimNombre, setRegPrimNombre] = useState('');
  const [regSegNombre, setRegSegNombre] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regSpecialty, setRegSpecialty] = useState('Psicología Clínica');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass1, setRegPass1] = useState('');
  const [regPass2, setRegPass2] = useState('');

  const handleNextCedula = () => {
    setErrorMsg('');
    const clean = cedula.trim();
    if (!clean) {
      setErrorMsg('Por favor ingrese su número de cédula.');
      return;
    }
    const users = DB.getUsers();
    const found = users.find((u) => u.cedula === clean);
    if (!found) {
      setErrorMsg('No se encontró ningún profesional con esa cédula. Puede registrarse a continuación.');
      return;
    }
    setSelectedUser(found);
    setStep('password');
  };

  const handleDoLogin = () => {
    setErrorMsg('');
    if (!selectedUser) return;
    if (selectedUser.password && selectedUser.password !== password) {
      setErrorMsg('Contraseña incorrecta. Inténtelo nuevamente.');
      return;
    }

    // Verificar acuerdo diario de confidencialidad
    const today = new Date().toISOString().slice(0, 10);
    const lastAgreedDate = localStorage.getItem('psivia_agreement_date');
    const lastAgreedUser = localStorage.getItem('psivia_agreement_user');

    if (lastAgreedDate !== today || lastAgreedUser !== selectedUser.cedula) {
      setStep('agreement');
    } else {
      finalizeLogin(selectedUser);
    }
  };

  const handleAcceptAgreement = () => {
    if (!selectedUser) return;
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('psivia_agreement_date', today);
    localStorage.setItem('psivia_agreement_user', selectedUser.cedula);
    finalizeLogin(selectedUser);
  };

  const finalizeLogin = (user: UserProfessional) => {
    sessionStorage.setItem('psivia_logged_user', JSON.stringify(user));
    const config = DB.getConfig();
    config.active_professional_id = user.id;
    config.prof_names = user.names;
    config.prof_license = user.license || config.prof_license;
    config.prof_specialty = user.specialty || config.prof_specialty;
    config.prof_email = user.email || config.prof_email;
    config.prof_phone = user.phone || config.prof_phone;
    DB.saveConfig(config);
    onLoginSuccess(user);
  };

  const handleDoRegister = () => {
    setErrorMsg('');
    if (!regCedula.trim() || !regPrimApellido.trim() || !regPrimNombre.trim() || !regPass1) {
      setErrorMsg('Complete todos los campos obligatorios (*).');
      return;
    }
    if (regPass1 !== regPass2) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }
    const users = DB.getUsers();
    if (users.some((u) => u.cedula === regCedula.trim())) {
      setErrorMsg('Ya existe un usuario registrado con esa cédula.');
      return;
    }

    const fullName = `${regPrimApellido.trim().toUpperCase()} ${regSegApellido.trim().toUpperCase()} ${regPrimNombre.trim().toUpperCase()} ${regSegNombre.trim().toUpperCase()}`.replace(/\s+/g, ' ').trim();

    const newUser: UserProfessional = {
      id: uid(),
      cedula: regCedula.trim(),
      prim_apellido: regPrimApellido.trim().toUpperCase(),
      seg_apellido: regSegApellido.trim().toUpperCase(),
      prim_nombre: regPrimNombre.trim().toUpperCase(),
      seg_nombre: regSegNombre.trim().toUpperCase(),
      names: fullName,
      license: regLicense.trim(),
      specialty: regSpecialty.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      password: regPass1,
      active: true,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    DB.saveUsers(users);
    setSelectedUser(newUser);
    setStep('agreement');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-[#2B5765] to-[#1E3E49] bg-opacity-95 backdrop-blur-xs">
      {/* Contenedor Login / Registro */}
      {step !== 'agreement' ? (
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-gray-100 text-gray-800 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-[#4D7C66]/15 rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#2B5765]">
              <HeartPulse className="w-8 h-8 text-[#2B5765]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2B5765]">{APP_NAME}</h1>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">{APP_FULL_NAME}</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r-md">
              {errorMsg}
            </div>
          )}

          {step === 'cedula' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Número de Cédula de Identidad
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="Ej: 1002345678"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && handleNextCedula()}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5765] focus:bg-white"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Cédula del profesional de la salud registrado</p>
              </div>

              <button
                onClick={handleNextCedula}
                className="w-full py-2.5 px-4 bg-[#2B5765] hover:bg-[#1E3E49] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setStep('register');
                  }}
                  className="text-xs font-medium text-[#2B5765] hover:underline cursor-pointer"
                >
                  ¿Es nuevo usuario? Regístrese aquí
                </button>
              </div>
            </div>
          )}

          {step === 'password' && selectedUser && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                <div className="flex items-center gap-2 text-gray-700 font-semibold mb-0.5">
                  <UserCheck className="w-4 h-4 text-[#2B5765]" />
                  <span>{selectedUser.names}</span>
                </div>
                <p className="text-gray-500 text-[11px] pl-6">
                  {selectedUser.specialty || 'Psicología Clínica'} · CI: {selectedUser.cedula}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Contraseña de acceso
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDoLogin()}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B5765] focus:bg-white"
                    autoFocus
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setErrorMsg('');
                    setStep('cedula');
                  }}
                  className="w-1/3 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Volver
                </button>
                <button
                  onClick={handleDoLogin}
                  className="w-2/3 py-2.5 px-4 bg-[#2B5765] hover:bg-[#1E3E49] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  Ingresar a la Plataforma
                </button>
              </div>
            </div>
          )}

          {step === 'register' && (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2B5765] border-b pb-2">
                <UserPlus className="w-4 h-4" />
                Registro de Nuevo Profesional
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700">Cédula de Identidad *</label>
                <input
                  type="text"
                  maxLength={10}
                  value={regCedula}
                  onChange={(e) => setRegCedula(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-1.5 text-xs bg-gray-50 border rounded-md"
                  placeholder="10 dígitos"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700">Primer Apellido *</label>
                  <input
                    type="text"
                    value={regPrimApellido}
                    onChange={(e) => setRegPrimApellido(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 border rounded-md uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700">Segundo Apellido</label>
                  <input
                    type="text"
                    value={regSegApellido}
                    onChange={(e) => setRegSegApellido(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 border rounded-md uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700">Primer Nombre *</label>
                  <input
                    type="text"
                    value={regPrimNombre}
                    onChange={(e) => setRegPrimNombre(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 border rounded-md uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700">Segundo Nombre</label>
                  <input
                    type="text"
                    value={regSegNombre}
                    onChange={(e) => setRegSegNombre(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 border rounded-md uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700">Registro Profesional MSP / Senescyt</label>
                <input
                  type="text"
                  value={regLicense}
                  onChange={(e) => setRegLicense(e.target.value)}
                  placeholder="Ej: MSP-10023-SENESCYT"
                  className="w-full px-3 py-1.5 text-xs bg-gray-50 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700">Especialidad Clínica</label>
                <input
                  type="text"
                  value={regSpecialty}
                  onChange={(e) => setRegSpecialty(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-gray-50 border rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700">Correo Electrónico</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700">Celular / Teléfono</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 border rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700">Contraseña *</label>
                  <input
                    type="password"
                    value={regPass1}
                    onChange={(e) => setRegPass1(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700">Confirmar Contraseña *</label>
                  <input
                    type="password"
                    value={regPass2}
                    onChange={(e) => setRegPass2(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 border rounded-md"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setStep('cedula');
                  }}
                  className="w-1/3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDoRegister}
                  className="w-2/3 py-2 text-xs bg-[#4D7C66] hover:bg-[#3A5F4E] text-white rounded-md font-semibold cursor-pointer shadow-xs"
                >
                  Crear Cuenta
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ACUERDO DE CONFIDENCIALIDAD */
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full border border-gray-100 text-gray-800 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-3 mb-4">
            <div className="w-10 h-10 bg-[#4D7C66]/15 rounded-xl flex items-center justify-center text-[#2B5765]">
              <ShieldCheck className="w-6 h-6 text-[#2B5765]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2B5765]">
                Acuerdo de Confidencialidad y Secreto Profesional
              </h2>
              <p className="text-xs text-gray-500">
                Sistema Nacional de Salud del Ecuador · Normativa Jurídica Vigente
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 text-xs leading-relaxed text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 text-justify">
            <p className="font-bold text-gray-900 uppercase">
              Reglamento de Información Confidencial en el Sistema Nacional de Salud
            </p>
            <p className="text-gray-600">
              <strong>Acuerdo Ministerial 5216</strong> — Registro Oficial Suplemento 427 de 29-ene-2015.
            </p>

            <p>
              <strong>Art. 9.-</strong> El personal operativo y administrativo de los establecimientos del Sistema
              Nacional de Salud que tenga acceso a información de los/las usuarios/as durante el ejercicio de sus
              funciones, deberá guardar reserva de manera indefinida respecto de dicha información y no podrá divulgar
              la información contenida en la historia clínica, ni aquella constante en todo documento donde reposen
              datos confidenciales de los/las usuarios/as.
            </p>

            <p>
              <strong>Art. 10.-</strong> Los documentos que contengan información confidencial se mantendrán protegidos
              y solo tendrán acceso los profesionales legalmente autorizados en el marco de la auditoría médica y
              calidad de la atención en salud.
            </p>

            <p>
              <strong>Art. 61.-</strong> Las instituciones públicas y privadas, los profesionales de salud y la población
              en general garantizarán en todo momento la custodia y el sigilo deontológico de la información psicológica
              y psiquiátrica clínica generada.
            </p>

            <p className="font-bold text-gray-900 uppercase pt-2">
              Ley de Estadística (Registro Oficial N° 323)
            </p>
            <p>
              <strong>Art. 25.-</strong> Las personas que intervengan en la captura o custodia de información no podrán
              requerir ni divulgar información distinta a la estrictamente clínica asistencial autorizada, bajo
              sanciones tipificadas por la ley.
            </p>

            <div className="pt-2 border-t border-gray-300 font-semibold text-gray-900">
              Al hacer clic en &quot;Acepto y Me Comprometo&quot;, declaro conocer las obligaciones deontológicas y
              legales que rigen la historia clínica digital psicológica en el territorio ecuatoriano.
            </div>
          </div>

          <div className="pt-4 mt-2 flex justify-end gap-3 border-t border-gray-100">
            <button
              onClick={() => {
                sessionStorage.removeItem('psivia_logged_user');
                setStep('cedula');
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg cursor-pointer transition-all"
            >
              Rechazar y Salir
            </button>
            <button
              onClick={handleAcceptAgreement}
              className="px-5 py-2 bg-[#2B5765] hover:bg-[#1E3E49] text-white text-xs font-semibold rounded-lg cursor-pointer transition-all shadow-xs flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Acepto y Me Comprometo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
