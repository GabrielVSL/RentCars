import type { BlueprintArchitecture } from '@/lib/carPresentation';

interface CarBlueprintSvgProps {
  architecture: BlueprintArchitecture;
  className?: string;
}

/**
 * Wireframe vetorial visto de cima adaptado ao layout do chassi (motor traseiro, central ou dianteiro).
 */
export function CarBlueprintSvg({ architecture, className = 'w-44 h-auto text-white/80' }: CarBlueprintSvgProps) {
  return (
    <svg
      viewBox="0 0 220 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Contorno principal da carroceria */}
      <path
        d={
          architecture === 'rear-engine'
            ? 'M44 82 C44 38, 72 18, 110 18 C148 18, 176 38, 176 82 L182 150 C186 175, 186 270, 184 315 L186 385 C186 420, 160 436, 110 436 C60 436, 34 420, 34 385 L36 315 C34 270, 34 175, 38 150 Z'
            : architecture === 'mid-engine'
              ? 'M42 90 C42 40, 74 16, 110 16 C146 16, 178 40, 178 90 L185 165 C189 205, 189 285, 185 335 L182 396 C180 426, 154 438, 110 438 C66 438, 40 426, 38 396 L35 335 C31 285, 31 205, 35 165 Z'
              : 'M40 85 C40 36, 72 16, 110 16 C148 16, 180 36, 180 85 L183 185 C184 225, 184 285, 182 330 L179 396 C177 426, 152 438, 110 438 C68 438, 43 426, 41 396 L38 330 C36 285, 36 225, 37 185 Z'
        }
        stroke="currentColor"
        strokeWidth="1.6"
      />

      {/* Caixas de roda sutis */}
      <path d="M36 92 C48 92, 52 104, 52 128 C52 150, 46 160, 37 162" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
      <path d="M184 92 C172 92, 168 104, 168 128 C168 150, 174 160, 183 162" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
      <path d="M34 316 C48 316, 54 328, 54 356 C54 382, 48 392, 36 394" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
      <path d="M186 316 C172 316, 166 328, 166 356 C166 382, 172 392, 184 394" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />

      {/* Retrovisores laterais */}
      <path d="M37 154 L20 162 L22 174 L38 168" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M183 154 L200 162 L198 174 L182 168" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />

      {/* Faróis dianteiros */}
      <path d="M50 56 C56 38, 68 32, 76 34 C74 48, 64 58, 50 56 Z" stroke="currentColor" strokeWidth="1.3" opacity="0.7" />
      <path d="M170 56 C164 38, 152 32, 144 34 C146 48, 156 58, 170 56 Z" stroke="currentColor" strokeWidth="1.3" opacity="0.7" />

      {/* Capô / entradas de ar frontais */}
      {architecture === 'front-gt' ? (
        <>
          <path d="M74 52 L84 128 M146 52 L136 128" stroke="currentColor" strokeWidth="1" opacity="0.45" />
          <rect x="86" y="72" width="48" height="24" rx="6" stroke="currentColor" strokeWidth="1.1" opacity="0.55" />
        </>
      ) : (
        <>
          <path d="M68 48 L76 132 M152 48 L144 132" stroke="currentColor" strokeWidth="1" opacity="0.45" />
          <path d="M88 64 L96 86 M132 64 L124 86" stroke="currentColor" strokeWidth="1.2" opacity="0.65" />
        </>
      )}

      {/* Para-brisa e teto */}
      <path
        d={
          architecture === 'mid-engine'
            ? 'M56 144 C78 128, 142 128, 164 144 L154 202 C136 194, 84 194, 66 202 Z'
            : 'M56 164 C78 148, 142 148, 164 164 L154 220 C136 212, 84 212, 66 220 Z'
        }
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Teto / Vidros laterais / Vidro traseiro */}
      <path
        d={
          architecture === 'mid-engine'
            ? 'M66 202 L68 296 C86 306, 134 306, 152 296 L154 202'
            : 'M66 220 L68 312 C86 322, 134 322, 152 312 L154 220'
        }
        stroke="currentColor"
        strokeWidth="1.3"
        opacity="0.85"
      />

      {/* Linhas internas de cockpit e coluna C */}
      <path
        d={
          architecture === 'mid-engine'
            ? 'M52 162 L52 310 M168 162 L168 310'
            : 'M52 178 L52 325 M168 178 L168 325'
        }
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />

      {/* Tampa do motor / aerofólio traseiro */}
      {architecture === 'mid-engine' && (
        <path
          d="M74 316 L146 316 L140 388 L80 388 Z"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.65"
        />
      )}
      {architecture === 'rear-engine' && (
        <>
          <path d="M68 342 L152 342 M72 354 L148 354 M76 366 L144 366" stroke="currentColor" strokeWidth="1.1" opacity="0.6" />
          <path d="M40 412 C75 402, 145 402, 180 412 L176 426 C142 418, 78 418, 44 426 Z" stroke="currentColor" strokeWidth="1.5" />
        </>
      )}
      {architecture === 'front-gt' && (
        <path d="M56 388 C86 382, 134 382, 164 388" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      )}

      {/* Lanternas traseiras com leve destaque vermelho */}
      <path d="M50 420 L84 426 M170 420 L136 426" stroke="#FF1717" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}
