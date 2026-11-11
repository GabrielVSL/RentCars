import React from 'react';

interface CountryFlagProps {
  countryCode: 'DE' | 'FR' | 'BE' | 'IT' | 'MC' | 'GB' | 'BR' | 'JP' | string;
  className?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({ countryCode, className = 'w-6 h-4' }) => {
  const code = countryCode.toUpperCase();

  switch (code) {
    // Alemanha (Preto, Vermelho, Ouro)
    case 'DE':
    case 'ALEMANHA':
      return (
        <svg viewBox="0 0 5 3" className={`rounded-sm shadow-sm shrink-0 ${className}`}>
          <rect width="5" height="1" y="0" fill="#000000" />
          <rect width="5" height="1" y="1" fill="#DD0000" />
          <rect width="5" height="1" y="2" fill="#FFCE00" />
        </svg>
      );

    // França (Azul, Branco, Vermelho)
    case 'FR':
    case 'FRANÇA':
      return (
        <svg viewBox="0 0 3 2" className={`rounded-sm shadow-sm shrink-0 ${className}`}>
          <rect width="1" height="2" x="0" fill="#002395" />
          <rect width="1" height="2" x="1" fill="#FFFFFF" />
          <rect width="1" height="2" x="2" fill="#ED2939" />
        </svg>
      );

    // Bélgica (Preto, Amarelo, Vermelho)
    case 'BE':
    case 'BÉLGICA':
      return (
        <svg viewBox="0 0 3 2" className={`rounded-sm shadow-sm shrink-0 ${className}`}>
          <rect width="1" height="2" x="0" fill="#000000" />
          <rect width="1" height="2" x="1" fill="#FDDA24" />
          <rect width="1" height="2" x="2" fill="#EF3340" />
        </svg>
      );

    // Itália (Verde, Branco, Vermelho)
    case 'IT':
    case 'ITÁLIA':
      return (
        <svg viewBox="0 0 3 2" className={`rounded-sm shadow-sm shrink-0 ${className}`}>
          <rect width="1" height="2" x="0" fill="#009246" />
          <rect width="1" height="2" x="1" fill="#FFFFFF" />
          <rect width="1" height="2" x="2" fill="#CE2B37" />
        </svg>
      );

    // Mônaco (Vermelho superior, Branco inferior)
    case 'MC':
    case 'MÔNACO':
      return (
        <svg viewBox="0 0 5 4" className={`rounded-sm shadow-sm shrink-0 ${className}`}>
          <rect width="5" height="2" y="0" fill="#CE1126" />
          <rect width="5" height="2" y="2" fill="#FFFFFF" />
        </svg>
      );

    // Reino Unido (Union Jack)
    case 'GB':
    case 'UK':
    case 'REINO UNIDO':
      return (
        <svg viewBox="0 0 60 30" className={`rounded-sm shadow-sm shrink-0 ${className}`}>
          <clipPath id="s">
            <path d="M0,0 v30 h60 v-30 z"/>
          </clipPath>
          <clipPath id="t">
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
          </clipPath>
          <g clipPath="url(#s)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
          </g>
        </svg>
      );

    // Brasil (Verde, Losango Amarelo, Círculo Azul com Faixa)
    case 'BR':
    case 'BRASIL':
      return (
        <svg viewBox="0 0 20 14" className={`rounded-sm shadow-sm shrink-0 ${className}`}>
          <rect width="20" height="14" fill="#009739" />
          <polygon points="10,1.5 18.5,7 10,12.5 1.5,7" fill="#FEDD00" />
          <circle cx="10" cy="7" r="3.5" fill="#012169" />
          <path d="M 6.8,7.2 A 3.5,3.5 0 0 0 13.2,7" fill="none" stroke="#FFFFFF" strokeWidth="0.6" />
        </svg>
      );

    // Japão (Branco com Círculo Vermelho)
    case 'JP':
    case 'JAPÃO':
      return (
        <svg viewBox="0 0 3 2" className={`rounded-sm shadow-sm shrink-0 ${className}`}>
          <rect width="3" height="2" fill="#FFFFFF" />
          <circle cx="1.5" cy="1" r="0.6" fill="#BC002D" />
        </svg>
      );

    default:
      return (
        <span className="text-base leading-none shrink-0">🏁</span>
      );
  }
};
