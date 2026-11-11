'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowDownRight } from 'lucide-react';

export interface BrandShowcaseItem {
  id: string;
  name: string;
  division: string;
  origin: string;
  logo: string;
  logoClass: string;
  highlightModel: string;
  summary: string;
}

const BRANDS: BrandShowcaseItem[] = [
  {
    id: 'porsche',
    name: 'Porsche',
    division: 'Porsche Motorsport',
    origin: 'Stuttgart · GT3 & GT4',
    logo: '/brands/porsche.svg',
    logoClass: 'h-20 sm:h-24 w-auto',
    highlightModel: '911 GT3 RS & 718 GT4 RS',
    summary: 'Motores boxer aspirados até 9.000 rpm preparados para Nürburgring Nordschleife e o traçado de Mônaco.',
  },
  {
    id: 'bmw',
    name: 'BMW M',
    division: 'BMW M Motorsport',
    origin: 'Munique · GT4 & GT3',
    logo: '/brands/bmw.svg',
    logoClass: 'h-16 sm:h-20 w-auto',
    highlightModel: 'M4 Competition & M8 Coupé',
    summary: '510 CV a 625 CV biturbo com teto CFRP e precisão em alta velocidade para Spa-Francorchamps e Le Mans.',
  },
  {
    id: 'mercedes',
    name: 'Mercedes-AMG',
    division: 'AMG Customer Racing',
    origin: 'Affalterbach · GT2 Series',
    logo: '/brands/mercedes.svg',
    logoClass: 'h-16 sm:h-20 w-auto',
    highlightModel: 'GT Track Series & Black Series',
    summary: 'V8 biturbo de até 734 CV com aerodinâmica de competição calibrados para Monza e Silverstone.',
  },
  {
    id: 'audi',
    name: 'Audi Sport',
    division: 'Audi Sport Racing',
    origin: 'Neckarsulm · V10 & 800V',
    logo: '/brands/audi.svg',
    logoClass: 'h-10 sm:h-12 w-auto',
    highlightModel: 'R8 V10 & RS e-tron GT',
    summary: 'Do V10 atmosférico em Interlagos ao torque elétrico de 925 CV com eixo direcional em Suzuka.',
  },
];

interface BrandShowcaseStripProps {
  onSelectBrand?: (brandName: string) => void;
}

export function BrandShowcaseStrip({ onSelectBrand }: BrandShowcaseStripProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const prevIndex = (activeIndex - 1 + BRANDS.length) % BRANDS.length;
  const nextIndex = (activeIndex + 1) % BRANDS.length;

  const activeBrand = BRANDS[activeIndex];
  const prevBrand = BRANDS[prevIndex];
  const nextBrand = BRANDS[nextIndex];

  const handleSelectModel = () => {
    if (onSelectBrand) {
      onSelectBrand(activeBrand.name);
    }
    const target = document.getElementById('fleet-compare');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative py-20 sm:py-28 px-6 bg-[#08090C] border-y border-white/[0.08] overflow-hidden select-none">
      {/* Brilho sutil de estúdio ao fundo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_65%)] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Cabeçalho discreto */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-[11px] font-mono font-medium tracking-[0.22em] text-white/45 uppercase mb-2.5">
            Montadoras Homologadas
          </p>
          <h2 className="text-2xl sm:text-4xl font-medium tracking-tight text-white font-sans">
            Engenharia de Pista por Divisão
          </h2>
        </div>

        {/* Palco Simétrico de 3 Posições (Flanking Muted + Center Spotlight) */}
        <div className="relative flex items-center justify-center gap-4 sm:gap-6 lg:gap-8">
          {/* Seta Esquerda */}
          <button
            type="button"
            onClick={() => setActiveIndex(prevIndex)}
            className="hidden sm:flex w-10 h-10 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/25 text-white/55 hover:text-white items-center justify-center transition-all cursor-pointer shrink-0"
            aria-label="Marca anterior"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Card Lateral Esquerdo (Recuado & Monocromático Suave) */}
          <button
            type="button"
            onClick={() => setActiveIndex(prevIndex)}
            className="hidden md:flex flex-col items-center justify-center w-48 lg:w-56 h-52 rounded-2xl bg-white/[0.015] border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.03] transition-all duration-300 cursor-pointer group shrink-0 px-6"
            aria-label={`Selecionar ${prevBrand.name}`}
          >
            <img
              src={prevBrand.logo}
              alt={prevBrand.name}
              className="max-h-14 w-auto object-contain opacity-35 group-hover:opacity-75 transition-opacity duration-300"
            />
            <span className="mt-4 text-[11px] font-mono uppercase tracking-widest text-white/35 group-hover:text-white/65 transition-colors">
              {prevBrand.name}
            </span>
          </button>

          {/* Card Central em Spotlight */}
          <div className="relative w-full max-w-md min-h-[290px] sm:min-h-[310px] rounded-2xl bg-white/[0.03] border border-white/15 backdrop-blur-md p-7 sm:p-9 flex flex-col items-center justify-between text-center shadow-2xl overflow-hidden">
            {/* Halo radial de showroom atrás do emblema */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-44 bg-[radial-gradient(circle,rgba(255,255,255,0.09)_0%,rgba(255,23,23,0.04)_45%,transparent_75%)] pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeBrand.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex flex-col items-center w-full"
              >
                <div className="h-24 flex items-center justify-center mb-4">
                  <img
                    src={activeBrand.logo}
                    alt={activeBrand.name}
                    className={`${activeBrand.logoClass} object-contain drop-shadow-[0_6px_18px_rgba(255,255,255,0.08)]`}
                  />
                </div>

                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/45 mb-1.5">
                  {activeBrand.origin}
                </span>

                <h3 className="text-lg font-medium text-white tracking-tight mb-2">
                  {activeBrand.division} — {activeBrand.highlightModel}
                </h3>

                <p className="text-xs sm:text-sm text-white/60 font-normal leading-relaxed max-w-sm">
                  {activeBrand.summary}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card Lateral Direito (Recuado & Monocromático Suave) */}
          <button
            type="button"
            onClick={() => setActiveIndex(nextIndex)}
            className="hidden md:flex flex-col items-center justify-center w-48 lg:w-56 h-52 rounded-2xl bg-white/[0.015] border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.03] transition-all duration-300 cursor-pointer group shrink-0 px-6"
            aria-label={`Selecionar ${nextBrand.name}`}
          >
            <img
              src={nextBrand.logo}
              alt={nextBrand.name}
              className="max-h-14 w-auto object-contain opacity-35 group-hover:opacity-75 transition-opacity duration-300"
            />
            <span className="mt-4 text-[11px] font-mono uppercase tracking-widest text-white/35 group-hover:text-white/65 transition-colors">
              {nextBrand.name}
            </span>
          </button>

          {/* Seta Direita */}
          <button
            type="button"
            onClick={() => setActiveIndex(nextIndex)}
            className="hidden sm:flex w-10 h-10 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/25 text-white/55 hover:text-white items-center justify-center transition-all cursor-pointer shrink-0"
            aria-label="Próxima marca"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Barra inferior de seleção rápida + CTA limpo */}
        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {BRANDS.map((brand, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-white/10 text-white border-white/25'
                      : 'bg-transparent text-white/45 border-transparent hover:text-white/80 hover:bg-white/[0.03]'
                  }`}
                >
                  {brand.name}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleSelectModel}
            className="inline-flex items-center gap-2 bg-[#FF1717] hover:bg-[#e01414] text-white text-xs sm:text-sm font-medium px-6 py-2.5 rounded-full transition-all duration-200 cursor-pointer shadow-md shadow-[#FF1717]/20 hover:shadow-[#FF1717]/35 active:scale-[0.98]"
          >
            <span>Ver {activeBrand.name} na Frota</span>
            <ArrowDownRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
