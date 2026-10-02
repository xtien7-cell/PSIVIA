import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ClinicalRecord, Patient, UnitConfig, AppliedTest, SessionItem } from '../types';
import { calculateAge, fechaCorta, fechaEnLetras } from './storage';
import { PSIVIA_LOGO_DATA_URL } from './psiviaLogoAsset';

// Formato de fecha y ciudad para pie de documentos
export function getFechaCiudadLetras(unitConfig: UnitConfig): string {
  const ciudad = unitConfig.unit_city || 'Quito';
  return `${ciudad}, ${fechaEnLetras(new Date())}`;
}

export function getDireccionPaciente(p: Patient): string {
  const partes = [
    p.calle_principal,
    p.numero ? `N° ${p.numero}` : '',
    p.calle_secundaria,
    p.barrio ? `Barrio ${p.barrio}` : '',
    p.parish,
    p.canton,
    p.province,
  ].filter(Boolean);
  return partes.length > 0 ? partes.join(', ') : 'No registrada';
}

/**
 * Función auxiliar para guardar PDF con fallback seguro en iframe / navegador
 */
function savePdfWithFallback(pdf: jsPDF, filename: string): void {
  const cleanFilename = `${filename.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  try {
    pdf.save(cleanFilename);
  } catch (err) {
    console.warn('pdf.save falló, usando fallback de blob URL:', err);
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = cleanFilename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  }
}

/**
 * Exporta un elemento HTML que DEBE caber en exactamente 1 sola página A4
 * (Certificado de Atención Psicológica y Certificado de Asistencia).
 * Ocupa el 100% del ancho y alto A4 sin estrecharse ni dejar márgenes laterales excesivos.
 */
export async function exportSinglePageCertificate(
  elementId: string,
  filename: string,
  onStatusChange?: (msg: string) => void
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`No se encontró el elemento con ID: ${elementId}`);
  }

  onStatusChange?.('Preparando certificado en 1 página A4...');

  // Preservar y limpiar temporalmente contentEditable y bordes
  const prevContentEditable = element.getAttribute('contenteditable');
  element.removeAttribute('contenteditable');

  const prevBoxShadow = element.style.boxShadow;
  const prevBorder = element.style.border;
  const prevBackground = element.style.background;
  const prevWidth = element.style.width;

  element.style.boxShadow = 'none';
  element.style.border = 'none';
  element.style.background = '#ffffff';
  element.style.width = '794px'; // Ancho estándar A4 a 96dpi

  try {
    await new Promise((r) => setTimeout(r, 150));

    onStatusChange?.('Capturando documento en alta definición...');
    const canvas = await html2canvas(element, {
      scale: 2.2, // Resolución nítida para impresión profesional
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: 794,
      scrollX: 0,
      scrollY: 0,
    });

    onStatusChange?.('Generando PDF en formato A4 completo...');
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

    // Ocupa exactamente toda la página A4 (ancho y alto completos)
    // Los márgenes del documento (16mm) ya están integrados en el HTML del certificado
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    savePdfWithFallback(pdf, filename);
    return true;
  } finally {
    if (prevContentEditable) {
      element.setAttribute('contenteditable', prevContentEditable);
    }
    element.style.boxShadow = prevBoxShadow;
    element.style.border = prevBorder;
    element.style.background = prevBackground;
    element.style.width = prevWidth;
  }
}

/**
 * Exporta el Consentimiento Informado / Carta Compromiso en PDF limpio estructurado A4.
 * Garantiza descarga confiable y formato A4 perfecto de 2 páginas con logotipo oficial de PSIVIA.
 */
export async function exportCartaCompromisoPdf(
  containerId: string,
  filename: string,
  onStatusChange?: (msg: string) => void
): Promise<boolean> {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error('No se encontró el elemento del Consentimiento Informado');
  }

  onStatusChange?.('Preparando documento de Consentimiento Informado...');
  const pages = container.querySelectorAll<HTMLElement>('.carta-compromiso-page');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

  if (pages.length === 0) {
    // Si no tiene sub-páginas, capturar el contenedor completo
    const prevEditable = container.getAttribute('contenteditable');
    container.removeAttribute('contenteditable');
    try {
      const canvas = await html2canvas(container, {
        scale: 2.1,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    } finally {
      if (prevEditable) container.setAttribute('contenteditable', prevEditable);
    }
  } else {
    for (let i = 0; i < pages.length; i++) {
      onStatusChange?.(`Generando página ${i + 1} de ${pages.length}...`);
      const pageEl = pages[i];
      const prevEditable = pageEl.getAttribute('contenteditable');
      const prevShadow = pageEl.style.boxShadow;
      const prevBorder = pageEl.style.border;
      
      pageEl.removeAttribute('contenteditable');
      pageEl.style.boxShadow = 'none';
      pageEl.style.border = 'none';
      pageEl.style.width = '794px';

      try {
        const canvas = await html2canvas(pageEl, {
          scale: 2.1,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          width: 794,
          scrollX: 0,
          scrollY: 0,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        if (i > 0) pdf.addPage('a4', 'portrait');
        // Se coloca al 100% de la página A4 (210 x 297 mm)
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      } finally {
        if (prevEditable) pageEl.setAttribute('contenteditable', prevEditable);
        pageEl.style.boxShadow = prevShadow;
        pageEl.style.border = prevBorder;
      }
    }
  }

  onStatusChange?.('Descargando Consentimiento Informado en PDF...');
  savePdfWithFallback(pdf, filename);
  return true;
}

/**
 * Exporta la HISTORIA CLÍNICA en formato MULTIPÁGINA A4 sin comprimir ni achicar la letra.
 * Divide los contenidos de forma limpia con encabezado y numeración "Página X de Y".
 */
export async function exportMultiPageClinicalRecord(
  record: ClinicalRecord,
  patient: Patient,
  tests: AppliedTest[],
  sessions: SessionItem[],
  unitConfig: UnitConfig,
  onStatusChange?: (msg: string) => void
): Promise<boolean> {
  onStatusChange?.('Construyendo documento estructurado multipágina...');

  // Crear contenedor temporal invisible pero renderizable
  const host = document.createElement('div');
  host.id = 'psivia-pdf-temp-host';
  host.style.position = 'fixed';
  host.style.top = '-99999px';
  host.style.left = '0';
  host.style.width = '794px'; // 210mm a 96dpi aprox
  host.style.background = '#ffffff';
  host.style.zIndex = '-9999';

  const logoHtml = `<img src="${PSIVIA_LOGO_DATA_URL}" style="max-height: 48px; max-width: 250px; display: block; margin: 0 auto 6px;" alt="PSIVIA" />`;

  const headerHtml = `
    <div style="border-bottom: 2px solid #00B5B8; padding-bottom: 6px; margin-bottom: 12px; text-align: center;">
      ${logoHtml}
      <h3 style="margin: 0; font-size: 13px; font-weight: 700; color: #0E172A; text-transform: uppercase; letter-spacing: 0.5px;">
        PSIVIA — PLATAFORMA PSICOLÓGICA INTELIGENTE
      </h3>
      <div style="font-size: 9px; color: #00B5B8; font-weight: bold; text-transform: uppercase; margin-top: 1px;">
        Valoración · Interpretación · Análisis Clínico
      </div>
      <div style="font-size: 8.5px; color: #64748B; margin-top: 2px;">
        ${[unitConfig.unit_address || 'Av. República y Eloy Alfaro, Quito', unitConfig.unit_phone ? `Tel: ${unitConfig.unit_phone}` : '', unitConfig.unit_email ? `Email: ${unitConfig.unit_email}` : 'contacto@psivia.app'].filter(Boolean).join(' · ')}
      </div>
    </div>
  `;

  const footerHtml = (pageNumber: number, totalPages: number) => `
    <div style="position: absolute; bottom: 12mm; left: 14mm; right: 14mm; border-top: 1px solid #D9E2DC; padding-top: 4px; font-size: 8px; color: #64748B; display: flex; justify-content: space-between; align-items: center;">
      <span><strong>PSIVIA</strong> · Confidencialidad y Secreto Profesional (Acuerdo Ministerial 5216 MSP)</span>
      <span>Página ${pageNumber} de ${totalPages}</span>
    </div>
  `;

  const signatureHtml = `
    <div style="margin-top: 25px; text-align: center; page-break-inside: avoid;">
      <div style="display: inline-block; min-width: 260px; border-top: 1px solid #333; padding-top: 6px;">
        <strong style="font-size: 11px; color: #1E2D26;">${unitConfig.prof_names || record.created_by || 'PROFESIONAL DE LA SALUD'}</strong><br/>
        ${unitConfig.prof_specialty ? `<span style="font-size: 9.5px; color: #4B5563;">${unitConfig.prof_specialty}</span><br/>` : ''}
        ${unitConfig.prof_license ? `<span style="font-size: 9.5px; color: #4B5563;">Reg. Prof. / Senescyt: <strong>${unitConfig.prof_license}</strong></span><br/>` : ''}
        <span style="font-size: 8.5px; color: #6B7280;">Firma y Sello de Responsabilidad Profesional</span>
      </div>
    </div>
  `;

  // SECCIONES DE CONTENIDO
  const edad = calculateAge(patient.birth_date);
  const fechaAtencion = record.created_at ? new Date(record.created_at).toLocaleString('es-EC') : 'Sin fecha';
  const direccion = getDireccionPaciente(patient);

  const diags = record.diagnosticos || [];
  const lugarMap: Record<string, string> = { '710': 'Intramural', '711': 'Extramural' };
  const lugarLugarMap: Record<string, string> = {
    '712': 'Establecimiento de Salud',
    '713': 'Comunidad',
    '714': 'Centros Educativos',
    '715': 'Domicilio',
    '719': 'CDI',
    '720': 'CNH',
    '5115': 'Atención telemática',
    '724': 'Centro de rehabilitación',
    '727': 'Otros',
  };

  const impactos = [
    record.imp_laboral ? 'Laboral' : '',
    record.imp_familiar ? 'Familiar' : '',
    record.imp_social ? 'Social' : '',
    record.imp_pareja ? 'Pareja' : '',
  ].filter(Boolean);

  // Páginas diseñadas a tamaño A4 (297mm x 210mm a escala exacta de 1123px x 794px)
  const pageStyle = `
    width: 794px;
    height: 1123px;
    padding: 14mm 14mm 18mm 14mm;
    box-sizing: border-box;
    background: #ffffff;
    font-family: 'Open Sans', 'Helvetica Neue', Arial, sans-serif;
    color: #1F2937;
    position: relative;
    font-size: 10.5px;
    line-height: 1.45;
  `;

  const sectionTitle = (title: string, icon: string = '■') => `
    <div style="background: #F1F6F4; border-left: 3.5px solid #2B5765; padding: 4px 8px; margin: 9px 0 6px 0; font-size: 11px; font-weight: 700; color: #1E3E49; text-transform: uppercase;">
      ${icon} ${title}
    </div>
  `;

  // PÁGINA 1: Identificación del paciente, motivo de consulta y HEA
  const page1Content = `
    <div class="psivia-pdf-page" style="${pageStyle}">
      ${headerHtml}
      <div style="text-align: center; margin: 4px 0 10px 0;">
        <span style="font-size: 13px; font-weight: 800; letter-spacing: 1px; color: #2B5765; text-transform: uppercase; border-bottom: 1.5px solid #2B5765; padding-bottom: 2px;">
          HISTORIA CLÍNICA PSICOLÓGICA
        </span>
        <div style="font-size: 9px; color: #64748B; margin-top: 3px;">Fecha de Atención: ${fechaAtencion} · N° Expediente: <strong>${patient.cedula}</strong></div>
      </div>

      ${sectionTitle('1. DATOS DE FILIACIÓN DEL PACIENTE')}
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 6px;">
        <tr>
          <td style="padding: 2.5px 4px; width: 22%; font-weight: bold; color: #4B5563;">Apellidos y Nombres:</td>
          <td style="padding: 2.5px 4px; width: 38%; font-weight: bold; color: #111827;">${patient.names}</td>
          <td style="padding: 2.5px 4px; width: 18%; font-weight: bold; color: #4B5563;">Identificación / CI:</td>
          <td style="padding: 2.5px 4px; width: 22%;">${patient.cedula}</td>
        </tr>
        <tr style="background: #F9FAFB;">
          <td style="padding: 2.5px 4px; font-weight: bold; color: #4B5563;">Fecha Nacimiento:</td>
          <td style="padding: 2.5px 4px;">${patient.birth_date || '—'} (${edad} años)</td>
          <td style="padding: 2.5px 4px; font-weight: bold; color: #4B5563;">Sexo / Género:</td>
          <td style="padding: 2.5px 4px;">${patient.sex || '—'} / ${record.identidad_genero || patient.identidad_genero || '—'}</td>
        </tr>
        <tr>
          <td style="padding: 2.5px 4px; font-weight: bold; color: #4B5563;">Estado Civil:</td>
          <td style="padding: 2.5px 4px;">${patient.estado_civil || '—'}</td>
          <td style="padding: 2.5px 4px; font-weight: bold; color: #4B5563;">Teléfono / Celular:</td>
          <td style="padding: 2.5px 4px;">${patient.celular || patient.phone || '—'}</td>
        </tr>
        <tr style="background: #F9FAFB;">
          <td style="padding: 2.5px 4px; font-weight: bold; color: #4B5563;">Nivel de Instrucción:</td>
          <td style="padding: 2.5px 4px;">${patient.education || '—'} (${patient.estado_education || '—'})</td>
          <td style="padding: 2.5px 4px; font-weight: bold; color: #4B5563;">Ocupación / Trabajo:</td>
          <td style="padding: 2.5px 4px;">${patient.profesion || '—'}${patient.lugar_trabajo ? ` · Lugar: ${patient.lugar_trabajo}` : ''}${patient.tipo_empresa ? ` (${patient.tipo_empresa})` : ''}</td>
        </tr>
        <tr>
          <td style="padding: 2.5px 4px; font-weight: bold; color: #4B5563;">Dirección Domicilio:</td>
          <td style="padding: 2.5px 4px;" colspan="3">${direccion}</td>
        </tr>
        <tr style="background: #F9FAFB;">
          <td style="padding: 2.5px 4px; font-weight: bold; color: #4B5563;">Contacto Emergencia:</td>
          <td style="padding: 2.5px 4px;" colspan="3">${patient.contacto_nombre || '—'} (${patient.contacto_parentesco || 'Familiar'}) - Tel: ${patient.contacto_telefono || '—'}</td>
        </tr>
      </table>

      ${sectionTitle('2. MODALIDAD Y LUGAR DE LA ATENCIÓN')}
      <div style="font-size: 10px; margin-bottom: 6px;">
        <strong>Tipo:</strong> ${lugarMap[record.lugar_tipo] || record.lugar_tipo || 'Intramural'} · 
        <strong>Lugar:</strong> ${lugarLugarMap[record.lugar_lugar] || record.lugar_lugar || 'Establecimiento de Salud'} · 
        <strong>Horario:</strong> ${record.lugar_fechainicio ? fechaCorta(record.lugar_fechainicio) : '—'}
        ${record.grupos_prioritarios && record.grupos_prioritarios.length ? `<br/><strong>Grupos prioritarios:</strong> ${record.grupos_prioritarios.join(', ')}` : ''}
      </div>

      ${sectionTitle('3. MOTIVO DE CONSULTA')}
      <div style="font-size: 10px; margin-bottom: 6px;">
        <div style="margin-bottom: 4px;"><strong>Palabras del paciente / usuario:</strong></div>
        <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 4px; padding: 6px 8px; font-style: italic; color: #374151;">
          "${record.motivo_paciente || 'No especificado por el paciente'}"
        </div>
      </div>

      ${sectionTitle('4. HISTORIA DE LA ENFERMEDAD ACTUAL (HEA)')}
      <table style="width: 100%; border-collapse: collapse; font-size: 9.5px;">
        <tr>
          <td style="padding: 3px; width: 50%; vertical-align: top; border: 1px solid #E5E7EB; background: #FAFDFB;">
            <strong>Inicio y curso temporal:</strong><br/>
            ${record.hea_inicio || 'No precisado.'}
          </td>
          <td style="padding: 3px; width: 50%; vertical-align: top; border: 1px solid #E5E7EB; background: #FAFDFB;">
            <strong>Factores precipitantes / desencadenantes:</strong><br/>
            ${record.hea_precipitantes || 'No referidos.'}
          </td>
        </tr>
        <tr>
          <td style="padding: 3px; vertical-align: top; border: 1px solid #E5E7EB; background: #FFFFFF;">
            <strong>Factores mantenedores / mantención:</strong><br/>
            ${record.hea_mantenedores || 'No identificados.'}
          </td>
          <td style="padding: 3px; vertical-align: top; border: 1px solid #E5E7EB; background: #FFFFFF;">
            <strong>Intentos previos de solución / tratamientos:</strong><br/>
            ${record.hea_soluciones || 'Ninguno referido.'}
          </td>
        </tr>
      </table>
      ${impactos.length > 0 ? `<div style="font-size: 9.5px; margin-top: 5px;"><strong>Impacto funcional significativo:</strong> ${impactos.join(' · ')}${record.hea_impacto ? ` (${record.hea_impacto})` : ''}</div>` : ''}

      ${footerHtml(1, 3)}
    </div>
  `;

  // PÁGINA 2: Antecedentes y Examen Mental (MSE)
  const mseItems = [
    { label: 'Apariencia y Conducta', val: record.mse_apariencia },
    { label: 'Actitud hacia Evaluador', val: record.mse_actitud },
    { label: 'Lenguaje y Discurso', val: record.mse_lenguaje },
    { label: 'Estado de Ánimo y Afecto', val: record.mse_animo },
    { label: 'Anhedonia / Disfrute', val: record.mse_anhedonia },
    { label: 'Pensamiento: Curso', val: record.mse_pensamiento_curso },
    { label: 'Pensamiento: Contenido', val: record.mse_pensamiento_contenido },
    { label: 'Percepción Sensorial', val: record.mse_percepcion },
    { label: 'Sensorio y Cognición', val: record.mse_cognicion },
    { label: 'Insight (Conciencia)', val: record.mse_insight },
    { label: 'Juicio y Raciocinio', val: record.mse_juicio },
  ];

  const page2Content = `
    <div class="psivia-pdf-page" style="${pageStyle}">
      ${headerHtml}
      <div style="font-size: 9.5px; color: #64748B; margin-bottom: 8px;">
        Expediente: <strong>${patient.names}</strong> (C.I. ${patient.cedula}) · Continuación
      </div>

      ${sectionTitle('5. ANTECEDENTES RELEVANTES')}
      <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 8px;">
        <tr>
          <td style="padding: 4px; border: 1px solid #E5E7EB; width: 50%; vertical-align: top;">
            <strong>Personales Psicológicos / Psiquiátricos:</strong><br/>
            ${record.ant_personales || 'Sin antecedentes personales de relevancia reportados.'}
          </td>
          <td style="padding: 4px; border: 1px solid #E5E7EB; width: 50%; vertical-align: top;">
            <strong>Familiares Psiquiátricos:</strong><br/>
            ${record.ant_familiares || 'Niega antecedentes familiares patológicos de salud mental.'}
          </td>
        </tr>
        <tr style="background: #F9FAFB;">
          <td style="padding: 4px; border: 1px solid #E5E7EB; vertical-align: top;">
            <strong>Médicos / Clínicos / Quirúrgicos:</strong><br/>
            ${record.ant_medicos || 'Sin antecedentes patológicos médicos declarados.'}
          </td>
          <td style="padding: 4px; border: 1px solid #E5E7EB; vertical-align: top;">
            <strong>Tratamientos Previos / Farmacológicos:</strong><br/>
            ${record.ant_tratamientos || 'Sin tratamientos previos vigentes.'}
          </td>
        </tr>
      </table>
      <div style="font-size: 9px; color: #4B5563; margin-bottom: 5px;">
        <strong>Hábitos y Consumo de Sustancias:</strong> 
        Alcohol: <strong>${record.ant_alcohol || 'No refiere'}</strong> · 
        Tabaco: <strong>${record.ant_tabaco || 'No refiere'}</strong> · 
        Otras sustancias: <strong>${record.ant_drogas || 'No refiere'}</strong>
      </div>
      <div style="font-size: 9px; color: #1E2D26; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 4px; padding: 4px 6px; margin-bottom: 6px;">
        <strong>Redes de Apoyo (Familiar, Social, Comunitaria e Institucional):</strong> ${record.redes_apoyo || 'Sin especificar red de apoyo.'}
      </div>

      ${sectionTitle('6. EXAMEN MENTAL (MENTAL STATUS EXAMINATION - MSE)')}
      <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 6px;">
        <thead>
          <tr style="background: #E8F1EC; color: #1E3E49;">
            <th style="padding: 4px; border: 1px solid #CBD5E1; text-align: left; width: 35%;">Área Evaluada</th>
            <th style="padding: 4px; border: 1px solid #CBD5E1; text-align: left; width: 65%;">Hallazgos Clínicos y Observaciones</th>
          </tr>
        </thead>
        <tbody>
          ${mseItems
            .map(
              (item, i) => `
            <tr style="background: ${i % 2 === 0 ? '#FFFFFF' : '#F9FBFA'};">
              <td style="padding: 3px 5px; border: 1px solid #E2E8F0; font-weight: 600; color: #334155;">${item.label}</td>
              <td style="padding: 3px 5px; border: 1px solid #E2E8F0; color: ${item.val ? '#0F172A' : '#94A3B8'};">
                ${item.val || 'Sin alteraciones clínicamente detectables'}
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      ${record.mse_observaciones ? `<div style="font-size: 9.5px; background: #F8FAFC; border: 1px dashed #CBD5E1; padding: 4px 6px; border-radius: 4px; margin-top: 4px;"><strong>Observaciones adicionales de conducta / MSE:</strong> ${record.mse_observaciones}</div>` : ''}

      ${footerHtml(2, 3)}
    </div>
  `;

  // PÁGINA 3: Pruebas psicométricas, Diagnósticos, Plan y Firma
  const testsRowsHtml =
    tests.length > 0
      ? tests
          .map(
            (t) => `
        <tr>
          <td style="padding: 3px; border: 1px solid #E2E8F0; font-weight: 600;">${t.test_name}</td>
          <td style="padding: 3px; border: 1px solid #E2E8F0; text-align: center;">${t.score} / ${t.max_score || '—'}</td>
          <td style="padding: 3px; border: 1px solid #E2E8F0;">${t.interpretation}</td>
          <td style="padding: 3px; border: 1px solid #E2E8F0; text-align: center;">${fechaCorta(t.applied_date)}</td>
        </tr>
      `
          )
          .join('')
      : `<tr><td colspan="4" style="padding: 4px; border: 1px solid #E2E8F0; text-align: center; color: #64748B;">No se aplicaron pruebas estandarizadas en esta sesión.</td></tr>`;

  const diagsRowsHtml =
    diags.length > 0
      ? diags
          .map(
            (d, idx) => `
        <tr>
          <td style="padding: 3px; border: 1px solid #E2E8F0; text-align: center;">${idx + 1} (${d.tipo.toUpperCase()})</td>
          <td style="padding: 3px; border: 1px solid #E2E8F0; font-weight: 600; color: #2B5765;">${d.cie11 || '—'}</td>
          <td style="padding: 3px; border: 1px solid #E2E8F0; color: #475569;">${d.dsm5 || '—'}</td>
          <td style="padding: 3px; border: 1px solid #E2E8F0;">${d.especificador || 'Sin especificador'}</td>
        </tr>
      `
          )
          .join('')
      : `<tr><td colspan="4" style="padding: 4px; border: 1px solid #E2E8F0; text-align: center; color: #64748B;">En proceso de evaluación diagnóstica diferencial.</td></tr>`;

  const sessionsSummaryHtml =
    sessions.length > 0
      ? `
        <div style="font-size: 9px; margin-top: 5px;">
          <strong>Seguimiento de sesiones:</strong> 
          ${sessions.map((s) => `${fechaCorta(s.date)} (${s.topics || 'Sesión terapéutica'})`).join(' · ')}
        </div>
      `
      : '';

  const page3Content = `
    <div class="psivia-pdf-page" style="${pageStyle}">
      ${headerHtml}
      <div style="font-size: 9.5px; color: #64748B; margin-bottom: 8px;">
        Expediente: <strong>${patient.names}</strong> (C.I. ${patient.cedula}) · Diagnóstico y Plan
      </div>

      ${sectionTitle('7. PRUEBAS PSICOMÉTRICAS Y DE VALORACIÓN CLÍNICA')}
      <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 8px;">
        <thead>
          <tr style="background: #E8F1EC; color: #1E3E49;">
            <th style="padding: 3px; border: 1px solid #CBD5E1; text-align: left; width: 40%;">Prueba / Escala</th>
            <th style="padding: 3px; border: 1px solid #CBD5E1; text-align: center; width: 18%;">Puntaje</th>
            <th style="padding: 3px; border: 1px solid #CBD5E1; text-align: left; width: 28%;">Interpretación Clínica</th>
            <th style="padding: 3px; border: 1px solid #CBD5E1; text-align: center; width: 14%;">Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${testsRowsHtml}
        </tbody>
      </table>

      ${sectionTitle('8. FORMULACIÓN DIAGNÓSTICA')}
      <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 6px;">
        <thead>
          <tr style="background: #E8F1EC; color: #1E3E49;">
            <th style="padding: 3px; border: 1px solid #CBD5E1; text-align: center; width: 18%;">Categoría</th>
            <th style="padding: 3px; border: 1px solid #CBD5E1; text-align: left; width: 36%;">Clasificación CIE-11</th>
            <th style="padding: 3px; border: 1px solid #CBD5E1; text-align: left; width: 26%;">Equivalente DSM-5-TR</th>
            <th style="padding: 3px; border: 1px solid #CBD5E1; text-align: left; width: 20%;">Especificación</th>
          </tr>
        </thead>
        <tbody>
          ${diagsRowsHtml}
        </tbody>
      </table>
      ${record.dx_diferenciales ? `<div style="font-size: 9px; color: #4B5563; margin-bottom: 3px;"><strong>Diagnósticos diferenciales:</strong> ${record.dx_diferenciales}</div>` : ''}
      ${record.hipotesis ? `<div style="font-size: 9px; color: #4B5563; margin-bottom: 3px;"><strong>Hipótesis explicativa:</strong> ${record.hipotesis}</div>` : ''}

      ${sectionTitle('9. PLAN TERAPÉUTICO Y PRONÓSTICO')}
      <div style="background: #FAFDFB; border: 1px solid #E5E7EB; border-radius: 4px; padding: 6px 8px; font-size: 9.5px; line-height: 1.4; margin-bottom: 6px;">
        <div><strong>Enfoque Psicoterapéutico:</strong> ${record.plan_enfoque === 'Otro' ? record.plan_enfoque_otro || 'Otro' : record.plan_enfoque || 'Terapia Cognitivo-Conductual'} · <strong>Frecuencia:</strong> ${record.plan_frecuencia || 'Semanal'}</div>
        <div style="margin-top: 3px;"><strong>Objetivos Terapéuticos:</strong> ${record.plan_objetivos || 'Desarrollo de estrategias de afrontamiento y alivio de sintomatología clínica.'}</div>
        <div style="margin-top: 3px;"><strong>Técnicas Previstas:</strong> ${record.plan_tecnicas || 'Psicoeducación, reestructuración cognitiva y autorregistro.'}</div>
        <div style="margin-top: 3px;"><strong>Pronóstico Clínico:</strong> ${record.plan_pronostico || 'Favorable, con asistencia regular y adherencia terapéutica.'}</div>
        ${sessionsSummaryHtml}
      </div>

      <div style="text-align: right; font-size: 9.5px; color: #4B5563; margin-top: 15px;">
        ${getFechaCiudadLetras(unitConfig)}
      </div>

      ${signatureHtml}
      ${footerHtml(3, 3)}
    </div>
  `;

  // Insertar las 3 páginas en el host
  host.innerHTML = page1Content + page2Content + page3Content;
  document.body.appendChild(host);

  try {
    const pageElements = host.querySelectorAll<HTMLElement>('.psivia-pdf-page');
    const totalPages = pageElements.length;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    for (let i = 0; i < totalPages; i++) {
      onStatusChange?.(`Procesando página ${i + 1} de ${totalPages}...`);
      const pageEl = pageElements[i];

      const canvas = await html2canvas(pageEl, {
        scale: 2.1,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: pageEl.scrollWidth,
        windowHeight: pageEl.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      // Cada página llena exactamente la página A4 manteniendo proporción 100% nítida
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    onStatusChange?.('Guardando archivo PDF...');
    const filename = `Historia_Clinica_${patient.cedula}_${new Date().toISOString().slice(0, 10)}`;
    savePdfWithFallback(pdf, filename);

    return true;
  } finally {
    host.remove();
  }
}
