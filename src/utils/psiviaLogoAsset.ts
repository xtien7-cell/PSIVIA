/**
 * Logotipo Oficial de PSIVIA en formato SVG y Data URL
 * Colores de marca:
 * - Confianza: #00B5B8 (Turquesa)
 * - Equilibrio: #2F80ED (Azul)
 * - Tecnología: #6345A5 (Violeta)
 * - Bienestar: #0E172A (Azul Marino)
 */

export const PSIVIA_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 110" width="520" height="110" fill="none">
  <defs>
    <linearGradient id="psivia-grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00B5B8" />
      <stop offset="45%" stop-color="#2F80ED" />
      <stop offset="100%" stop-color="#6345A5" />
    </linearGradient>
    <linearGradient id="node-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E0F7FA" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>
  </defs>

  <!-- ISOTIPO: Perfil de cabeza humana con red sináptica -->
  <g transform="translate(10, 5)">
    <!-- Silueta de Cabeza estilizada -->
    <path d="M 52 14 C 30 14, 16 28, 16 50 C 16 63, 23 75, 31 83 C 27 78, 26 71, 28 65 C 31 52, 41 41, 53 37 C 58 35, 63 35, 67 37 C 68 32, 69 27, 67 22 C 64 16, 58 14, 52 14 Z M 52 14 C 66 14, 76 25, 76 38 C 76 41, 75 44, 73 47 C 75 48, 76 50, 78 52 C 79 53, 78 56, 75 56 C 76 59, 76 61, 75 63 C 73 64, 71 65, 69 66 C 70 68, 69 72, 67 73 C 64 75, 59 76, 57 78 C 51 81, 49 86, 47 91 C 42 88, 37 83, 35 76 C 41 73, 45 67, 48 60 C 51 52, 53 44, 53 36 C 53 28, 53 20, 52 14 Z" fill="url(#psivia-grad)" />
    
    <!-- Contorno craneal -->
    <path d="M 22 46 C 22 26, 35 12, 55 12 C 69 12, 78 22, 80 35 C 81 38, 79 42, 77 44 C 80 46, 82 49, 80 52 C 77 56, 75 57, 75 60 C 75 64, 72 67, 68 70 C 64 72, 61 75, 58 79 C 55 83, 53 88, 53 91 C 50 91, 45 86, 42 81 C 31 73, 22 62, 22 46 Z" fill="url(#psivia-grad)" opacity="0.95" />
    
    <!-- Espacio interno facial -->
    <path d="M 53 16 C 64 16, 72 24, 74 35 C 71 36, 69 37, 67 40 C 65 43, 64 46, 65 49 C 66 52, 68 53, 70 55 C 69 57, 67 59, 65 60 C 63 62, 63 64, 65 66 C 62 68, 60 69, 58 72 C 55 75, 53 78, 52 83 C 51 78, 48 73, 45 69 C 42 65, 38 60, 36 56 C 34 48, 36 38, 41 30 C 44 25, 48 20, 53 16 Z" fill="#FFFFFF" opacity="0.96" />

    <!-- Red Neuronal / Árbol Sináptico -->
    <g stroke="url(#psivia-grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="53" y1="70" x2="53" y2="46" />
      <line x1="53" y1="46" x2="41" y2="35" />
      <line x1="53" y1="46" x2="66" y2="35" />
      <line x1="53" y1="46" x2="53" y2="26" />
      <line x1="41" y1="35" x2="34" y2="27" />
      <line x1="41" y1="35" x2="43" y2="22" />
      <line x1="53" y1="26" x2="47" y2="18" />
      <line x1="53" y1="26" x2="60" y2="18" />
      <line x1="66" y1="35" x2="64" y2="24" />
      <line x1="66" y1="35" x2="72" y2="29" />
    </g>

    <!-- Nodos sinápticos -->
    <g fill="url(#node-grad)" stroke="url(#psivia-grad)" stroke-width="1.6">
      <circle cx="53" cy="70" r="2.8" />
      <circle cx="53" cy="46" r="3.2" />
      <circle cx="41" cy="35" r="2.8" />
      <circle cx="66" cy="35" r="2.8" />
      <circle cx="53" cy="26" r="2.8" />
      <circle cx="34" cy="27" r="2.4" />
      <circle cx="43" cy="22" r="2.4" />
      <circle cx="47" cy="18" r="2.2" />
      <circle cx="60" cy="18" r="2.2" />
      <circle cx="64" cy="24" r="2.4" />
      <circle cx="72" cy="29" r="2.4" />
    </g>
  </g>

  <!-- LOGOTIPO / WORDMARK: PSIVIA -->
  <g transform="translate(115, 20)">
    <!-- Letras estilizadas -->
    <text x="0" y="44" font-family="'Open Sans', 'Inter', Arial, sans-serif" font-weight="900" font-size="44" letter-spacing="4" fill="#0E172A">PSI<tspan fill="#2F80ED">V</tspan>I<tspan fill="#00B5B8">A</tspan></text>
    
    <!-- Subtítulo oficial -->
    <text x="2" y="63" font-family="'Open Sans', 'Inter', Arial, sans-serif" font-weight="700" font-size="11.5" letter-spacing="1.2" fill="#475569">PLATAFORMA PSICOLÓGICA INTELIGENTE</text>
    <text x="2" y="78" font-family="'Open Sans', 'Inter', Arial, sans-serif" font-weight="600" font-size="9.5" letter-spacing="0.8" fill="#64748B">Valoración, Interpretación y Análisis Clínico</text>
  </g>
</svg>`;

// Data URL limpio codificado para etiquetas <img> en HTML y PDF
export const PSIVIA_LOGO_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(PSIVIA_LOGO_SVG)}`;

/**
 * Genera el encabezado estándar e institucional con el logotipo oficial de PSIVIA
 * para Certificados, Consentimientos Informados e Informes Clínicos.
 */
export function getPsiviaDocumentHeaderHtml(config?: {
  unit_city?: string;
  unit_address?: string;
  unit_phone?: string;
  unit_email?: string;
  prof_names?: string;
  prof_license?: string;
}): string {
  const contactParts = [
    config?.unit_address || 'Av. República y Eloy Alfaro, Quito - Ecuador',
    config?.unit_phone ? `Tel: ${config.unit_phone}` : 'Tel: 0995123456',
    config?.unit_email ? `Email: ${config.unit_email}` : 'contacto@psivia.app',
  ].filter(Boolean);

  return `
    <div style="text-align: center; border-bottom: 2.5px solid #00B5B8; padding-bottom: 10px; margin-bottom: 14px;">
      <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 6px;">
        <img src="${PSIVIA_LOGO_DATA_URL}" alt="PSIVIA" style="height: 54px; max-width: 320px; display: block; margin: 0 auto;" />
      </div>
      <div style="font-size: 8.5px; font-weight: 700; color: #00B5B8; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px;">
        VALORACIÓN · INTERPRETACIÓN · ANÁLISIS CLÍNICO
      </div>
      <div style="font-size: 8px; color: #64748B; margin-top: 3px; font-weight: 500;">
        ${contactParts.join(' · ')}
      </div>
    </div>
  `;
}
