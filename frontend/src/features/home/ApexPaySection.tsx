'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShieldCheck, Percent, Wallet } from 'lucide-react';

interface TierOption {
  id: string;
  name: string;
  discount: string;
  threshold: string;
  tagline: string;
  surfaceClass: string;
  borderClass: string;
  glowColor: string;
  accentText: string;
  pillClass: string;
}

const APEX_TIERS: TierOption[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    discount: '0%',
    threshold: 'Entrada',
    tagline: 'Acesso direto à carteira ApexPay e emissão de caução para baterias avulsas.',
    surfaceClass: 'from-[#1B1817] via-[#121114] to-[#0A0A0D]',
    borderClass: 'border-amber-700/30',
    glowColor: 'rgba(180, 115, 65, 0.14)',
    accentText: 'text-amber-300/80',
    pillClass: 'border-amber-700/40 text-amber-200/80 bg-amber-900/15',
  },
  {
    id: 'silver',
    name: 'Silver',
    discount: '5%',
    threshold: 'R$ 10.000+',
    tagline: '5% de desconto automático em todas as sessões após acumular R$ 10 mil em depósitos.',
    surfaceClass: 'from-[#2A2F3A] via-[#171A21] to-[#0B0D12]',
    borderClass: 'border-slate-300/30',
    glowColor: 'rgba(203, 213, 225, 0.16)',
    accentText: 'text-slate-200',
    pillClass: 'border-slate-300/40 text-slate-100 bg-slate-400/10',
  },
  {
    id: 'gold',
    name: 'Gold',
    discount: '10%',
    threshold: 'R$ 25.000+',
    tagline: '10% de desconto automático em qualquer circuito e análise prioritária de crédito.',
    surfaceClass: 'from-[#332A18] via-[#1B1710] to-[#0B0A08]',
    borderClass: 'border-amber-300/35',
    glowColor: 'rgba(245, 196, 81, 0.16)',
    accentText: 'text-amber-200',
    pillClass: 'border-amber-300/40 text-amber-100 bg-amber-400/10',
  },
  {
    id: 'apex_black',
    name: 'Apex Black',
    discount: '15%',
    threshold: 'R$ 50.000+',
    tagline: 'Nível máximo: 15% de desconto automático, cobertura estendida e prioridade de box.',
    surfaceClass: 'from-[#181920] via-[#0D0E13] to-[#050608]',
    borderClass: 'border-[#FF1717]/40',
    glowColor: 'rgba(255, 23, 23, 0.18)',
    accentText: 'text-[#FF1717]',
    pillClass: 'border-[#FF1717]/50 text-white bg-[#FF1717]/15',
  },
];

const BANK_FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Caução sem travar seu cartão',
    description:
      'Garantias de pista avaliadas diretamente pelo motor de risco bancário, sem comprometer o limite do seu cartão pessoal.',
  },
  {
    icon: Percent,
    title: 'Fidelidade progressiva real',
    description:
      'Cada depósito acumulado eleva seu nível do Bronze ao Apex Black, aplicando até 15% de desconto automático nas reservas.',
  },
  {
    icon: Wallet,
    title: 'Carteira dedicada de pista',
    description:
      'Saldo exclusivo para baterias, débito instantâneo no agendamento e histórico transparente de todas as movimentações.',
  },
];

export function ApexPaySection() {
  const [selectedTierIdx, setSelectedTierIdx] = useState(3); // Apex Black em destaque inicial
  const cardWrapperRef = useRef<HTMLDivElement>(null);

  const activeTier = APEX_TIERS[selectedTierIdx];

  // Física 3D suave ao mover o ponteiro sobre o cartão
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 180,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 180,
    damping: 22,
  });
  const sheenX = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, 85]), {
    stiffness: 150,
    damping: 24,
  });
  const sheenY = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, 85]), {
    stiffness: 150,
    damping: 24,
  });

  const sheenBackground = useTransform(
    [sheenX, sheenY],
    ([sx, sy]: number[]) =>
      `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 38%, transparent 70%)`
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardWrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(nx);
    mouseY.set(ny);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      id="apexpay"
      className="relative py-24 sm:py-32 px-6 bg-[#08090C] border-t border-white/[0.08] text-white overflow-hidden select-none"
    >
      {/* Luz ambiente dinâmica conforme o tier selecionado */}
      <div
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[420px] rounded-full blur-[130px] pointer-events-none transition-colors duration-700"
        style={{ background: activeTier.glowColor }}
      />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* ===============================================================
              ESQUERDA: CARTÃO METÁLICO INTERATIVO 3D + SELETOR DE TIER
             =============================================================== */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div
              ref={cardWrapperRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ perspective: 1100 }}
              className="w-full max-w-[400px] py-3"
            >
              <motion.div
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: 'preserve-3d',
                }}
                className={`relative aspect-[1.586/1] w-full rounded-2xl bg-gradient-to-br ${activeTier.surfaceClass} border ${activeTier.borderClass} p-6 sm:p-7 flex flex-col justify-between shadow-[0_28px_60px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors duration-500 overflow-hidden`}
              >
                {/* Brilho metálico especular acompanhando o cursor */}
                <motion.div
                  style={{ background: sheenBackground }}
                  className="absolute inset-0 pointer-events-none mix-blend-screen"
                />

                {/* Textura sutil escovada */}
                <div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(115deg,#fff_0px,#fff_1px,transparent_1px,transparent_4px)] pointer-events-none" />

                {/* Topo do Cartão: Logo + Tag de Tier */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF1717]" />
                    <span className="text-base sm:text-lg font-normal tracking-[-0.03em] text-white lowercase font-sans">
                      apex pay
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border ${activeTier.pillClass} transition-colors duration-300`}
                  >
                    {activeTier.name}
                  </span>
                </div>

                {/* Centro: Chip EMV metálico escuro + Contactless */}
                <div className="relative z-10 flex items-center justify-between my-auto">
                  <svg
                    width="38"
                    height="28"
                    viewBox="0 0 38 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="opacity-75"
                    aria-hidden="true"
                  >
                    <rect
                      x="0.75"
                      y="0.75"
                      width="36.5"
                      height="26.5"
                      rx="4.5"
                      fill="rgba(255,255,255,0.06)"
                      stroke="rgba(255,255,255,0.22)"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M12 1V27M26 1V27M1 10H12M1 18H12M26 10H37M26 18H37M12 14H26"
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth="1"
                    />
                  </svg>

                  <div className="text-right">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
                      Benefício em pista
                    </p>
                    <p className={`text-2xl sm:text-3xl font-medium tracking-tight tabular-nums ${activeTier.accentText} transition-colors duration-300`}>
                      {activeTier.discount === '0%' ? 'Base' : `-${activeTier.discount}`}
                    </p>
                  </div>
                </div>

                {/* Rodapé do Cartão: Titular / Programa */}
                <div className="relative z-10 flex items-end justify-between text-white/60">
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-white/35">
                      Track Credit & Wallet
                    </p>
                    <p className="text-xs font-mono tracking-[0.18em] text-white/80 uppercase mt-0.5">
                      Private Pitlane Member
                    </p>
                  </div>

                  <span className="text-[10px] font-mono tracking-widest text-white/45 tabular-nums">
                    {activeTier.threshold}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Seletor de Acabamento / Tier abaixo do cartão */}
            <div className="mt-5 w-full max-w-[400px]">
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                {APEX_TIERS.map((tier, idx) => {
                  const isActive = idx === selectedTierIdx;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedTierIdx(idx)}
                      className={`py-2 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white text-[#08090C] shadow-sm'
                          : 'text-white/55 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {tier.name}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-white/55 text-center mt-3.5 min-h-[34px] leading-relaxed">
                {activeTier.tagline}
              </p>
            </div>
          </div>

          {/* ===============================================================
              DIREITA: NARRATIVA + BENTO GRID DE RECURSOS BANCÁRIOS
             =============================================================== */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <p className="text-[11px] font-mono font-medium tracking-[0.22em] text-white/45 uppercase mb-2.5">
                ApexPay · Private Track Banking
              </p>
              <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-white leading-[1.1] font-sans">
                Crédito de Pista sem Travar seu Cartão.
              </h2>
              <p className="text-sm sm:text-base text-white/65 font-normal leading-relaxed mt-4 max-w-xl">
                Baterias em circuitos internacionais exigem cauções elevadas. O ecossistema financeiro integrado da Apex avalia seu perfil, libera a garantia de pista e converte depósitos em descontos permanentes.
              </p>
            </div>

            {/* Bento Grid Clean (2 + 1) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BANK_FEATURES.map((feat, idx) => {
                const Icon = feat.icon;
                const isWide = idx === 2;
                return (
                  <div
                    key={feat.title}
                    className={`p-5 rounded-2xl bg-white/[0.025] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/15 transition-colors ${
                      isWide ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#FF1717] shrink-0 mt-0.5">
                        <Icon size={17} />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white tracking-tight mb-1">
                          {feat.title}
                        </h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                          {feat.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Barra minimalista de resumo dos 4 níveis */}
            <div className="grid grid-cols-4 gap-3 pt-4 border-t border-white/[0.08] text-center sm:text-left">
              {APEX_TIERS.map((tier, idx) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setSelectedTierIdx(idx)}
                  className="group text-left cursor-pointer focus:outline-none"
                >
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 group-hover:text-white/70 transition-colors">
                    {tier.name}
                  </p>
                  <p
                    className={`text-sm sm:text-base font-medium tabular-nums mt-0.5 transition-colors ${
                      idx === selectedTierIdx ? 'text-[#FF1717]' : 'text-white/80 group-hover:text-white'
                    }`}
                  >
                    {tier.discount === '0%' ? 'Padrão' : `${tier.discount} off`}
                  </p>
                  <p className="text-[10px] text-white/40 tabular-nums">{tier.threshold}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
