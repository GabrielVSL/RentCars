'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function TimingSheetSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !rowsRef.current) return;

    const rows = rowsRef.current.querySelectorAll('.timing-row');
    
    // Animação GSAP limpa, leve e acelerada por hardware (zero travamentos)
    const ctx = gsap.context(() => {
      gsap.fromTo(
        rows,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: rowsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const protocols = [
    {
      index: '01',
      code: 'SPEC // MACHINE',
      title: 'A Máquina Pronta no Box',
      tagline: 'ROLLCAGE FIA · FREIOS PCCB CARBONO-CERÂMICA · MICHELIN CUP 2R',
      description:
        'Esqueça a dor de cabeça de possuir um supercarro, gerenciar mecânicos ou transportar carretas pela Europa. Você chega ao autódromo e seu veículo está no box com pneus slick pré-aquecidos, tanque cheio de combustível 102 octanas e telemetria calibrada para as condições do dia.',
      telemetry: 'SETUP: TRACK PACK DRY // TYRE TEMP: 78°C',
    },
    {
      index: '02',
      code: 'RISK // UNDERWRITING',
      title: 'Garantia Bancária & Apólice de Pista',
      tagline: 'ANÁLISE MULTI-RENDA · EMISSÃO DE CONTRATO SEM TRAVAR CARTÃO',
      description:
        'Baterias em circuitos como Nürburgring e Spa exigem cauções de alto risco que chegam a € 50.000. Nosso sistema de underwriting bancário integrado avalia sua renda comprovada em minutos e emite a garantia internacional de pista sem consumir o limite do seu cartão de crédito pessoal.',
      telemetry: 'PROTOCOL: #APX-BANK-CREDIT // RISK: APPROVED',
    },
    {
      index: '03',
      code: 'PITLANE // ARRIVE & DRIVE',
      title: 'Paddock VIP & Infraestrutura de Box',
      tagline: 'BOX PRIVATIVO · COMUNICAÇÃO VIA RÁDIO · MECÂNICOS DEDICADOS',
      description:
        'Acesso irrestrito ao pitlane oficial. Receba macacão, sapatilha e capacete Bell/Stilo homologados com Hans Device. Sua equipe de apoio realiza checagem de pressão de pneus, alinhamento de suspensão e reposição de combustível a cada retorno ao box.',
      telemetry: 'BOX ACCESS: FIA GRADE 1 PASS // FUEL: 102 OCTANE',
    },
    {
      index: '04',
      code: 'DATA // VBOX TELEMETRY',
      title: 'Telemetria e Coaching de Alta Performance',
      tagline: 'LOGGING CURVA A CURVA · VBOX HD DUAL CAMERA · COACH FIA',
      description:
        'Dois módulos de câmera HD e sistema VBOX gravam velocidade, força G lateral, ângulo de esterço e pressão de frenagem. Ao fim de cada stint de pista, faça o debriefing técnico curva a curva com um piloto instrutor licenciado pela federação internacional.',
      telemetry: 'DATA RATE: 100 HZ GPS // DELTA SPLIT ANALYSIS',
    },
  ];

  return (
    <section 
      ref={containerRef} 
      className="py-28 px-6 bg-[#08090C] text-white border-b border-white/10 font-mono relative overflow-hidden"
    >
      <div className="container mx-auto max-w-7xl">
        
        {/* Header Técnico Editorial (Estilo Porsche Motorsport / AKQA) */}
        <div className="border-b border-white/10 pb-10 mb-16">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-white/40 mb-4 tracking-[0.25em] uppercase">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF1717]" />
              <span>APEX // RACING PROTOCOLS & UNDERWRITING</span>
            </div>
            <span>HOMOLOGATION REF. 2026</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black font-sans uppercase tracking-tight text-white leading-tight">
            Arrive & Drive. <br />
            <span className="text-[#FF1717]">O Motorsport Elevado à Perfeição.</span>
          </h2>
          <p className="text-white/60 text-sm md:text-base font-sans font-light mt-4 max-w-3xl leading-relaxed">
            Eliminamos intermediários e burocracias. Uma experiência de corrida sem concessões, com suporte bancário internacional e telemetria de nível de Fórmula 1 e WEC.
          </p>
        </div>

        {/* Tabela de Telemetria / Timing Rows (Zero Cards de IA) */}
        <div ref={rowsRef} className="flex flex-col divide-y divide-white/10">
          {protocols.map((proto) => (
            <div
              key={proto.index}
              className="timing-row py-10 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start group hover:bg-white/[0.02] transition-colors px-4 -mx-4 rounded-xl"
            >
              {/* Coluna 1: Índice & Código */}
              <div className="lg:col-span-3 flex flex-col justify-between">
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-3xl md:text-4xl font-black text-[#FF1717]">
                    /{proto.index}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-white/50">
                    {proto.code}
                  </span>
                </div>
                <div className="text-[10px] text-[#FF1717]/80 tracking-widest uppercase">
                  {proto.telemetry}
                </div>
              </div>

              {/* Coluna 2: Conteúdo & Descrição */}
              <div className="lg:col-span-6">
                <h3 className="text-xl md:text-2xl font-black font-sans text-white uppercase tracking-tight mb-2">
                  {proto.title}
                </h3>
                <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-4">
                  {proto.tagline}
                </div>
                <p className="text-white/70 text-xs md:text-sm font-sans font-light leading-relaxed">
                  {proto.description}
                </p>
              </div>

              {/* Coluna 3: Status de Box */}
              <div className="lg:col-span-3 flex lg:justify-end items-center">
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 group-hover:border-[#FF1717]/50 group-hover:text-[#FF1717] transition-colors">
                  [ PROTOCOL ACTIVE ]
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
