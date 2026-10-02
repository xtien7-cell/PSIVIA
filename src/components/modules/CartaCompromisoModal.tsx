import React, { useState } from 'react';
import { Patient, UnitConfig } from '../../types';
import { calculateAge, fechaEnLetras } from '../../utils/storage';
import { exportCartaCompromisoPdf } from '../../utils/pdfGenerator';
import { PSIVIA_LOGO_DATA_URL } from '../../utils/psiviaLogoAsset';
import { Download, Printer, X, ShieldCheck, CheckSquare, Square, FileText } from 'lucide-react';

interface CartaCompromisoModalProps {
  patient: Patient;
  config: UnitConfig;
  onClose: () => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const CartaCompromisoModal: React.FC<CartaCompromisoModalProps> = ({
  patient,
  config,
  onClose,
  onNotify,
}) => {
  const [acepta, setAcepta] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const edad = calculateAge(patient.birth_date);
  const centroNombre = config.unit_name || 'PSIVIA — PLATAFORMA PSICOLÓGICA INTELIGENTE';
  const profNombre = config.prof_names || 'GOMEZ ALMEIDA CHRISTIAN ALBERTO';
  const profReg = config.prof_license || '1802441327';

  const repNombre = patient.rep_nombre || patient.contacto_nombre || 'Padre / Madre / Tutor Legal';
  const repCedula = patient.rep_cedula || '—';
  const repTelefono = patient.rep_telefono || patient.contacto_telefono || patient.celular || '—';

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      await exportCartaCompromisoPdf(
        'carta-compromiso-document',
        `Consentimiento_Informado_${patient.cedula}`,
        (msg) => onNotify(msg, 'info')
      );
      onNotify('Consentimiento Informado / Carta Compromiso descargado exitosamente en PDF A4.', 'success');
    } catch (e: any) {
      onNotify(`Error al generar PDF: ${e.message}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const pageStyle: React.CSSProperties = {
    width: '794px',
    minHeight: '1120px',
    padding: '16mm 18mm 18mm 18mm',
    boxSizing: 'border-box',
    background: '#ffffff',
    fontFamily: "'Open Sans', Arial, sans-serif",
    color: '#1F2937',
    position: 'relative',
    fontSize: '9.2px',
    lineHeight: 1.42,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col border shadow-2xl text-xs overflow-hidden">
        {/* Cabecera del Modal */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#00B5B8] via-[#2F80ED] to-[#0E172A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                <span>Consentimiento Informado & Carta Compromiso</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-normal">2 Páginas A4</span>
              </h2>
              <p className="text-[11px] text-white/90">
                Paciente: <strong>{patient.names}</strong> (C.I. {patient.cedula}) · {patient.menor_edad || Number(edad) < 18 ? 'Menor de edad' : 'Adulto'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-3.5 py-1.5 bg-white text-[#0E172A] hover:bg-slate-100 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#00B5B8]" />
              <span>{isExporting ? 'Generando PDF...' : 'Descargar PDF'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer ml-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificación informativa */}
        <div className="bg-teal-50 px-4 py-2 text-[11px] text-teal-900 border-b border-teal-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#00B5B8]" />
            <span>Documento oficial con <strong>logotipo PSIVIA</strong>. Puede editar cualquier texto haciendo clic directamente sobre el documento.</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-700">Decisión del representante:</span>
            <label className="inline-flex items-center gap-1 cursor-pointer font-bold text-emerald-800">
              <input
                type="radio"
                name="decision_modal"
                checked={acepta}
                onChange={() => setAcepta(true)}
              />
              <span>Acepta</span>
            </label>
            <label className="inline-flex items-center gap-1 cursor-pointer font-bold text-red-800">
              <input
                type="radio"
                name="decision_modal"
                checked={!acepta}
                onChange={() => setAcepta(false)}
              />
              <span>No Acepta</span>
            </label>
          </div>
        </div>

        {/* Visor del Documento Renderizado en 2 Páginas Limpias */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100/80 flex flex-col items-center gap-6">
          <div id="carta-compromiso-document" className="space-y-6">
            {/* PÁGINA 1 */}
            <div
              className="carta-compromiso-page border border-gray-300 shadow-md text-justify"
              contentEditable={true}
              suppressContentEditableWarning={true}
              style={pageStyle}
            >
              {/* Encabezado con Logotipo Oficial PSIVIA */}
              <div style={{ textAlign: 'center', borderBottom: '2.5px solid #00B5B8', paddingBottom: '8px', marginBottom: '10px' }}>
                <img
                  src={PSIVIA_LOGO_DATA_URL}
                  alt="PSIVIA"
                  style={{ height: '46px', maxWidth: '300px', display: 'block', margin: '0 auto 4px' }}
                />
                <h1 style={{ margin: '0', fontSize: '11px', fontWeight: 800, color: '#00B5B8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  CONSENTIMIENTO INFORMADO PARA INTERVENCIÓN PSICOLÓGICA
                </h1>
                <div style={{ fontSize: '8.5px', color: '#64748B', marginTop: '2px' }}>
                  Menores de edad y personas que requieran representación legal · {centroNombre}
                </div>
              </div>

              {/* Ficha de Identificación del Paciente y Representante */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px', marginBottom: '10px', border: '1px solid #CBD5E1' }}>
                <tbody>
                  <tr style={{ background: '#F8FAFC' }}>
                    <td style={{ padding: '3px 5px', width: '22%', fontWeight: 'bold', border: '1px solid #E2E8F0' }}>Nombre del paciente:</td>
                    <td style={{ padding: '3px 5px', width: '40%', border: '1px solid #E2E8F0', fontWeight: 'bold' }}>{patient.names}</td>
                    <td style={{ padding: '3px 5px', width: '18%', fontWeight: 'bold', border: '1px solid #E2E8F0' }}>Edad / Sexo:</td>
                    <td style={{ padding: '3px 5px', width: '20%', border: '1px solid #E2E8F0' }}>{edad} años / {patient.sex}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 5px', fontWeight: 'bold', border: '1px solid #E2E8F0' }}>Padre/Madre/Tutor:</td>
                    <td style={{ padding: '3px 5px', border: '1px solid #E2E8F0' }}>{repNombre}</td>
                    <td style={{ padding: '3px 5px', fontWeight: 'bold', border: '1px solid #E2E8F0' }}>Cédula Tutor:</td>
                    <td style={{ padding: '3px 5px', border: '1px solid #E2E8F0' }}>{repCedula}</td>
                  </tr>
                  <tr style={{ background: '#F8FAFC' }}>
                    <td style={{ padding: '3px 5px', fontWeight: 'bold', border: '1px solid #E2E8F0' }}>Teléfono Tutor:</td>
                    <td style={{ padding: '3px 5px', border: '1px solid #E2E8F0' }}>{repTelefono}</td>
                    <td style={{ padding: '3px 5px', fontWeight: 'bold', border: '1px solid #E2E8F0' }}>Parentesco:</td>
                    <td style={{ padding: '3px 5px', border: '1px solid #E2E8F0' }}>{patient.rep_parentesco || patient.contacto_parentesco || 'Tutor Legal'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 5px', fontWeight: 'bold', border: '1px solid #E2E8F0' }}>Psicólogo/a Tratante:</td>
                    <td style={{ padding: '3px 5px', border: '1px solid #E2E8F0' }}>{profNombre}</td>
                    <td style={{ padding: '3px 5px', fontWeight: 'bold', border: '1px solid #E2E8F0' }}>Registro SENESCYT:</td>
                    <td style={{ padding: '3px 5px', border: '1px solid #E2E8F0', fontWeight: 'bold' }}>{profReg}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ fontSize: '9.2px', marginBottom: '8px', lineHeight: '1.42' }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#00898B' }}>
                  BIENVENIDO/A A {centroNombre}
                </p>
                <p style={{ margin: '0 0 5px 0' }}>
                  Agradecemos la confianza que deposita en nosotros para acompañar a su representado/a en su proceso de bienestar emocional. Este documento explica de forma clara y sencilla cómo funcionan nuestros servicios, sus derechos, responsabilidades y las políticas que nos permiten ofrecer una atención profesional, ética y humana. Si tiene alguna duda, no dude en consultarnos.
                </p>
                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#0E172A' }}>Objetivo de la intervención</p>
                <p style={{ margin: '0 0 5px 0' }}>
                  Nuestro objetivo es apoyar el bienestar emocional de su representado/a, ya sea un menor de edad o una persona mayor de edad que, por motivos de discapacidad u otras circunstancias, requiera representación legal, promoviendo su bienestar psicológico con un enfoque cálido y basado en evidencia, atendiendo las necesidades específicas identificadas en la evaluación inicial y proporcionando herramientas para su desarrollo emocional y social.
                </p>
                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#0E172A' }}>Confidencialidad</p>
                <p style={{ margin: '0 0 5px 0' }}>
                  Toda la información compartida durante las sesiones será tratada con absoluta confidencialidad, conforme a la <strong>Ley Orgánica de Protección de Datos Personales del Ecuador</strong> y la normativa del Ministerio de Salud Pública. Solo se compartirá información en los siguientes casos excepcionales:
                </p>
                <ul style={{ margin: '0 0 6px 16px', padding: 0 }}>
                  <li>Riesgo inminente de daño o peligro para la vida del paciente o de terceras personas.</li>
                  <li>Sospecha fundamentada o revelación de abuso, negligencia, explotación o maltrato infantil.</li>
                  <li>Requerimiento legal, orden judicial o mandato de autoridad competente.</li>
                </ul>

                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#00898B', textTransform: 'uppercase' }}>
                  CONDICIONES DE LA INTERVENCIÓN
                </p>
                <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>Horarios y programación</p>
                <ul style={{ margin: '0 0 5px 16px', padding: 0 }}>
                  <li>Las sesiones se realizan de lunes a viernes de 9:00 a 13:00 y de 15:00 a 19:00, y los sábados de 9:00 a 12:00, salvo citas programadas en la tarde.</li>
                  <li>Reserve su cita con al menos 24 horas de anticipación.</li>
                  <li>Si no puede asistir, notifique con al menos 24 horas para reprogramar dentro de la misma semana. De lo contrario, no se reembolsará el pago.</li>
                  <li>Si llega más de 15 minutos tarde sin aviso previo, la cita se cancelará sin reembolso. Si avisa con anticipación, se evaluará reprogramar o realizar la sesión en el tiempo restante.</li>
                  <li>Se permiten hasta 2 reprogramaciones consecutivas por proceso (individual o por paquete). Exceder este límite llevará a evaluar la continuidad del tratamiento.</li>
                  <li>En casos excepcionales (emergencias médicas o imprevistos debidamente justificados con documentación), se considerarán excepciones.</li>
                </ul>

                <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>Pagos y reembolsos</p>
                <ul style={{ margin: '0 0 5px 16px', padding: 0 }}>
                  <li>El costo por sesión individual / infantil es de $20.00, pagadero por transferencia bancaria al agendar la cita. Dicho costo se depositará únicamente en la cuenta institucional asignada.</li>
                  <li>La encargada administrativa confirmará el pago y agendará la cita. Solo se reembolsarán pagos si la profesional no puede asistir a la cita.</li>
                </ul>
              </div>

              {/* Pie de página 1 */}
              <div style={{ position: 'absolute', bottom: '12mm', left: '18mm', right: '18mm', borderTop: '1px solid #D9E2DC', paddingTop: '4px', fontSize: '8px', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                <span>Consentimiento Informado para Intervención Psicológica · PSIVIA</span>
                <span>Página 1 de 2</span>
              </div>
            </div>

            {/* PÁGINA 2 */}
            <div
              className="carta-compromiso-page border border-gray-300 shadow-md text-justify"
              contentEditable={true}
              suppressContentEditableWarning={true}
              style={pageStyle}
            >
              {/* Encabezado Página 2 con Logotipo Oficial PSIVIA */}
              <div style={{ textAlign: 'center', borderBottom: '1.5px solid #00B5B8', paddingBottom: '4px', marginBottom: '8px' }}>
                <img
                  src={PSIVIA_LOGO_DATA_URL}
                  alt="PSIVIA"
                  style={{ height: '36px', maxWidth: '220px', display: 'block', margin: '0 auto 2px' }}
                />
                <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#00B5B8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  CONSENTIMIENTO INFORMADO · CONDICIONES Y ACUERDOS DE INTERVENCIÓN (PÁG. 2)
                </div>
              </div>

              <div style={{ fontSize: '9.2px', lineHeight: '1.42' }}>
                <p style={{ margin: '0 0 3px 0', fontWeight: 'bold' }}>Paquetes promocionales</p>
                <ul style={{ margin: '0 0 5px 16px', padding: 0 }}>
                  <li>Pago total anticipado por transferencia, depósito o tarjeta de crédito (con recargo). No se aceptan pagos en efectivo para paquetes.</li>
                  <li>Los paquetes son personales e intransferibles. Las sesiones no utilizadas no son reembolsables ni transferibles.</li>
                  <li>Vigencia: Paquete de 4 sesiones: 6 semanas · Paquete de 6 sesiones: 8 semanas · Paquete de 8 sesiones: 10 semanas.</li>
                  <li>Las sesiones deben agendarse al momento de la compra. Para renovar un paquete, solicítelo con 3 días de anticipación a su vencimiento.</li>
                  <li>Si cancela con menos de 24 horas o no asiste, se perderá el 50% del valor de la sesión como compensación de honorarios.</li>
                </ul>

                {/* Tabla de Duraciones */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px', margin: '4px 0 6px', border: '1px solid #CBD5E1' }}>
                  <thead>
                    <tr style={{ background: '#E0F7FA' }}>
                      <th style={{ padding: '3px 5px', border: '1px solid #CBD5E1', textAlign: 'left', width: '50%', color: '#00898B' }}>Modalidad y Duración de Sesión</th>
                      <th style={{ padding: '3px 5px', border: '1px solid #CBD5E1', textAlign: 'left', width: '50%', color: '#00898B' }}>Tiempo adicional (sujeto a disponibilidad)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '2px 5px', border: '1px solid #E2E8F0' }}>Individual / Infantil: 45 - 60 minutos</td>
                      <td style={{ padding: '2px 5px', border: '1px solid #E2E8F0' }}>Hasta 10 minutos extra: $3.00</td>
                    </tr>
                    <tr style={{ background: '#F8FAFC' }}>
                      <td style={{ padding: '2px 5px', border: '1px solid #E2E8F0' }}>Familiar: 60 - 90 minutos · Pareja: 60 - 70 minutos</td>
                      <td style={{ padding: '2px 5px', border: '1px solid #E2E8F0' }}>Hasta 20 minutos extra: $10.00</td>
                    </tr>
                  </tbody>
                </table>

                {/* Derechos y Obligaciones */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px', margin: '4px 0 6px', border: '1px solid #CBD5E1' }}>
                  <thead>
                    <tr style={{ background: '#E0F7FA' }}>
                      <th style={{ padding: '3px 5px', border: '1px solid #CBD5E1', textAlign: 'left', width: '50%', color: '#00898B' }}>Derechos del paciente y representante</th>
                      <th style={{ padding: '3px 5px', border: '1px solid #CBD5E1', textAlign: 'left', width: '50%', color: '#00898B' }}>Obligaciones del representante legal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '3px 5px', verticalAlign: 'top', border: '1px solid #E2E8F0' }}>
                        • Recibir atención respetuosa, ética y de calidad.<br/>
                        • Ser informado de objetivos, proceso y avances.<br/>
                        • Hacer preguntas y recibir respuestas claras.<br/>
                        • Revocar el consentimiento en cualquier momento sin consecuencias legales.<br/>
                        • Solicitar certificados de asistencia gratuitos.
                      </td>
                      <td style={{ padding: '3px 5px', verticalAlign: 'top', border: '1px solid #E2E8F0' }}>
                        • Respetar horarios y notificar ausencias con antelación.<br/>
                        • Realizar el pago al agendar la cita.<br/>
                        • Mantener actitud respetuosa hacia el personal.<br/>
                        • Cumplir normas de convivencia (no alimentos, sin ruidos molestos).<br/>
                        • Asumir costos por daños a instalaciones o equipos.
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>Beneficios y riesgos</p>
                <p style={{ margin: '0 0 4px 0' }}>
                  La intervención puede mejorar el bienestar emocional, desarrollar afrontamiento y fomentar el crecimiento personal. Abordar temas sensibles podría generar malestar temporal que la profesional manejará con ética y competencia.
                </p>

                <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>Normas de convivencia y Certificados</p>
                <p style={{ margin: '0 0 4px 0' }}>
                  Mantener respeto, llegar 5 minutos antes y cuidar las instalaciones. En sala de espera dispone de agua o café sin costo. Los certificados de asistencia se emiten con la fecha correspondiente previa solicitud; informes especiales para escuelas o instituciones tienen costo adicional acordado con la psicóloga.
                </p>

                <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>Exoneración de responsabilidad</p>
                <p style={{ margin: '0 0 5px 0' }}>
                  La psicóloga actuará dentro del marco ético y legal vigente, no siendo responsable de malestar emocional transitorio inherente al proceso psicoterapéutico.
                </p>

                {/* Sección de Consentimiento explícito */}
                <div style={{ background: '#F0FDFA', border: '1.5px solid #00B5B8', borderRadius: '4px', padding: '6px 8px', margin: '5px 0' }}>
                  <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', color: '#00898B', fontSize: '9.5px' }}>
                    DECLARACIÓN DE CONSENTIMIENTO
                  </p>
                  <p style={{ margin: '0 0 5px 0', fontSize: '8.8px' }}>
                    He leído y comprendido la información de este documento. He tenido la oportunidad de hacer preguntas y todas han sido respondidas satisfactoriamente. Otorgo mi consentimiento libre e informado para que mi representado/a participe en la intervención psicológica en {centroNombre}.
                  </p>
                  <div style={{ display: 'flex', gap: '25px', fontSize: '9.5px', fontWeight: 'bold' }}>
                    <span style={{ color: acepta ? '#065F46' : '#6B7280' }}>[ {acepta ? 'X' : '  '} ] ACEPTA la intervención psicológica</span>
                    <span style={{ color: !acepta ? '#991B1B' : '#6B7280' }}>[ {!acepta ? 'X' : '  '} ] NO ACEPTA la intervención psicológica</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginTop: '4px', fontSize: '8.5px', color: '#4B5563' }}>
                  {config.unit_city || 'Quito'}, {fechaEnLetras(new Date())}
                </div>

                {/* Bloque de Firmas */}
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '22px', textAlign: 'center' }}>
                  <div style={{ width: '42%', borderTop: '1px solid #1F2937', paddingTop: '4px' }}>
                    <strong style={{ fontSize: '9.2px', color: '#111827' }}>{repNombre}</strong><br />
                    <span style={{ fontSize: '8.5px', color: '#4B5563' }}>C.I.: {repCedula}</span><br />
                    <span style={{ fontSize: '8px', color: '#6B7280' }}>Firma del Padre / Madre o Tutor Legal</span>
                  </div>

                  <div style={{ width: '42%', borderTop: '1px solid #1F2937', paddingTop: '4px' }}>
                    <strong style={{ fontSize: '9.2px', color: '#111827' }}>{profNombre}</strong><br />
                    <span style={{ fontSize: '8.5px', color: '#4B5563' }}>Reg. SENESCYT / MSP: {profReg}</span><br />
                    <span style={{ fontSize: '8px', color: '#6B7280' }}>Firma y Sello de la/el Psicólogo/a</span>
                  </div>
                </div>
              </div>

              {/* Pie de página 2 */}
              <div style={{ position: 'absolute', bottom: '12mm', left: '18mm', right: '18mm', borderTop: '1px solid #D9E2DC', paddingTop: '4px', fontSize: '8px', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                <span>Consentimiento Informado para Intervención Psicológica · Ley Orgánica de Protección de Datos</span>
                <span>Página 2 de 2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

