import React from 'react';

interface PsiviaLogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'icon-only' | 'app-icon' | 'badge';
  theme?: 'light' | 'dark' | 'color';
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PsiviaLogo: React.FC<PsiviaLogoProps> = ({
  className = '',
  variant = 'horizontal',
  theme = 'color',
  showSubtitle = true,
  size = 'md',
}) => {
  const gradientId = React.useId();

  // Dimensión del isotipo
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
  };

  const currentSize = iconSizes[size] || 36;

  // Isotipo SVG: Perfil de cabeza humana con red neuronal / árbol de sinapsis
  const IsotypeSvg = (
    <svg
      width={currentSize}
      height={currentSize}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        {/* Gradiente oficial PSIVIA: Confianza (#00B5B8) -> Equilibrio (#2F80ED) -> Tecnología (#6345A5) */}
        <linearGradient id={`${gradientId}-grad`} x1="10%" y1="90%" x2="90%" y2="10%">
          <stop offset="0%" stopColor="#00B5B8" />
          <stop offset="45%" stopColor="#2F80ED" />
          <stop offset="100%" stopColor="#6345A5" />
        </linearGradient>

        <linearGradient id={`${gradientId}-node`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0F7FA" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>

      {/* Silueta de Cabeza Humana estilizada con curva fluida */}
      <path
        d="M 68 18 
           C 40 18, 22 36, 22 62 
           C 22 78, 30 92, 40 102 
           C 35 96, 34 88, 36 80 
           C 40 64, 52 50, 68 45 
           C 74 43, 80 43, 85 46 
           C 87 40, 88 34, 86 28 
           C 82 21, 75 18, 68 18 Z
           M 68 18 
           C 85 18, 98 32, 98 48 
           C 98 52, 96 56, 94 59 
           C 96 61, 98 63, 100 65 
           C 102 67, 100 70, 97 71 
           C 98 74, 98 77, 96 79 
           C 94 81, 92 82, 89 83 
           C 90 86, 89 90, 86 92 
           C 82 94, 76 96, 73 98 
           C 66 102, 63 108, 61 114 
           C 54 110, 48 104, 45 96 
           C 52 92, 58 84, 62 76 
           C 66 66, 68 56, 68 46 
           C 68 36, 68 26, 68 18 Z"
        fill={`url(#${gradientId}-grad)`}
      />

      {/* Forma externa del cráneo en gradiente complementario */}
      <path
        d="M 28 58 
           C 28 34, 45 16, 70 16 
           C 88 16, 99 28, 102 44 
           C 103 48, 101 53, 98 55 
           C 102 58, 104 62, 102 66 
           C 98 71, 95 72, 95 76 
           C 95 81, 92 85, 87 88 
           C 82 91, 78 94, 74 99 
           C 70 104, 68 110, 68 114 
           C 64 114, 58 108, 54 102 
           C 40 92, 28 78, 28 58 Z"
        fill={`url(#${gradientId}-grad)`}
        opacity="0.95"
      />

      {/* Corte interno negativo del rostro para definir el perfil facial */}
      <path
        d="M 68 20 
           C 82 20, 92 31, 94 44 
           C 91 46, 88 47, 86 50 
           C 83 54, 82 58, 83 62 
           C 84 65, 87 67, 89 69 
           C 88 72, 85 74, 83 76 
           C 81 78, 81 81, 83 83 
           C 80 85, 77 87, 74 90 
           C 70 94, 68 98, 67 104 
           C 65 98, 62 92, 58 87 
           C 54 82, 49 76, 47 70 
           C 44 60, 46 48, 53 38 
           C 57 32, 62 26, 68 20 Z"
        fill="#FFFFFF"
        opacity={theme === 'dark' ? '0.12' : '0.96'}
      />

      {/* Red Neuronal / Árbol Sináptico de Inteligencia */}
      <g stroke={`url(#${gradientId}-grad)`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Tronco / Eje central del árbol neuronal */}
        <line x1="68" y1="88" x2="68" y2="58" />
        {/* Ramas principales */}
        <line x1="68" y1="58" x2="52" y2="44" />
        <line x1="68" y1="58" x2="84" y2="44" />
        <line x1="68" y1="58" x2="68" y2="34" />
        {/* Ramificaciones secundarias */}
        <line x1="52" y1="44" x2="44" y2="34" />
        <line x1="52" y1="44" x2="54" y2="28" />
        <line x1="68" y1="34" x2="60" y2="24" />
        <line x1="68" y1="34" x2="76" y2="24" />
        <line x1="84" y1="44" x2="82" y2="30" />
        <line x1="84" y1="44" x2="92" y2="36" />
        {/* Conexiones interneuronales */}
        <line x1="54" y1="28" x2="60" y2="24" strokeDasharray="1 3" />
        <line x1="76" y1="24" x2="82" y2="30" strokeDasharray="1 3" />
      </g>

      {/* Nodos / Sinapsis circulares brillantes */}
      <g fill={`url(#${gradientId}-node)`} stroke={`url(#${gradientId}-grad)`} strokeWidth="2">
        <circle cx="68" cy="88" r="3.5" />
        <circle cx="68" cy="58" r="4" />
        <circle cx="52" cy="44" r="3.5" />
        <circle cx="84" cy="44" r="3.5" />
        <circle cx="68" cy="34" r="3.5" />
        <circle cx="44" cy="34" r="3" />
        <circle cx="54" cy="28" r="3" />
        <circle cx="60" cy="24" r="2.8" />
        <circle cx="76" cy="24" r="2.8" />
        <circle cx="82" cy="30" r="3" />
        <circle cx="92" cy="36" r="3" />
      </g>
    </svg>
  );

  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{IsotypeSvg}</div>;
  }

  if (variant === 'app-icon') {
    return (
      <div
        className={`w-12 h-12 rounded-2xl bg-[#0E172A] shadow-md border border-white/10 flex items-center justify-center p-1.5 ${className}`}
        style={{
          boxShadow: '0 4px 14px rgba(0, 181, 184, 0.25)',
        }}
      >
        {IsotypeSvg}
      </div>
    );
  }

  const textColor =
    theme === 'dark'
      ? 'text-white'
      : theme === 'light'
      ? 'text-[#0E172A]'
      : 'text-[var(--color-text-primary)]';

  const subColor =
    theme === 'dark'
      ? 'text-white/80'
      : theme === 'light'
      ? 'text-[#475569]'
      : 'text-[var(--color-text-secondary)]';

  return (
    <div
      className={`inline-flex items-center gap-3 ${
        variant === 'full' ? 'flex-col sm:flex-row text-center sm:text-left' : ''
      } ${className}`}
    >
      <div className="relative shrink-0">{IsotypeSvg}</div>

      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-1.5">
          {/* Wordmark PSIVIA con tipografía geométrica estilizada */}
          <span
            className={`font-extrabold tracking-[0.14em] text-lg sm:text-xl ${textColor} font-sans`}
            style={{ letterSpacing: '0.12em' }}
          >
            PSI<span className="text-[#2F80ED]">V</span>I<span className="text-[#00B5B8]">A</span>
          </span>
        </div>

        {showSubtitle && (
          <span
            className={`text-[9px] sm:text-[10px] font-medium tracking-wide ${subColor} max-w-xs sm:max-w-md line-clamp-1`}
          >
            Plataforma Psicológica Inteligente para Valoración, Interpretación y Análisis
          </span>
        )}
      </div>
    </div>
  );
};

export default PsiviaLogo;
