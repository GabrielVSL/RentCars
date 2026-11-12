'use client';

import { motion } from 'framer-motion';

const RULES = [
  {
    step: '01',
    tag: 'ARRIVE & DRIVE',
    title: 'Sessões & Turnos Cronometrados',
    description:
      'Você reserva a data, a modalidade (Visita ao Box, Fast Lap, Track Experience ou Full Day VIP) e o turno. O supercarro não sai para a rua — ele te aguarda aquecido dentro do box.',
  },
  {
    step: '02',
    tag: 'POSSE EM PISTA',
    title: 'Exclusividade na Sua Bateria',
    description:
      'Durante toda a janela reservada, o veículo é exclusivamente seu em pista com briefing técnico, capacete com rádio e telemetria. No Fast Lap você vai de carona com piloto profissional.',
  },
  {
    step: '03',
    tag: 'ALL-INCLUSIVE BOX',
    title: 'Combustível, Pneus & Telemetria',
    description:
      'Gasolina 102 octanas, pneus Michelin Cup 2 R, pastilhas carbono-cerâmica, equipe de box e gravação VBOX HD já estão inclusos no valor da sessão, sem taxas ocultas.',
  },
  {
    step: '04',
    tag: 'PROTEÇÃO APEXPAY',
    title: 'Seguro Base & Franquia de Pista',
    description:
      'Cobertura base inclusa sem bloquear o limite do seu cartão pessoal. Em caso de avaria além da franquia, o débito é lançado na carteira ApexPay (bloqueando novas reservas até quitação).',
  },
];

const WEEKLY_SCHEDULE = [
  {
    days: 'Segunda-feira',
    regime: 'Manutenção FIA · Pista Fechada',
    accent: 'text-rose-400',
    detail: 'Vistoria de asfalto, barreiras TecPro e calibração oficial de cronometragem. Sem reservas.',
  },
  {
    days: 'Terça a Quinta',
    regime: 'Operação Técnica · Baixa Demanda',
    accent: 'text-amber-300',
    detail: 'Turnos Manhã e Tarde com grade enxuta de boxes (5 a 6 vagas) para pilotagem executiva.',
  },
  {
    days: 'Sexta a Domingo',
    regime: 'Full Grid · Alta Demanda + Noturno',
    accent: 'text-emerald-400',
    detail: 'Grade completa (10 a 14 vagas) nos 3 turnos, liberando a exclusiva Sessão Noturna.',
  },
];

export function ComoFuncionaSection() {
  return (
    <section
      id="como-funciona"
      className="relative py-24 sm:py-28 px-6 bg-[#08090C] text-white border-t border-white/[0.06] select-none"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <p className="text-[11px] font-mono font-medium tracking-[0.22em] text-white/45 uppercase mb-2.5">
              Protocolo de Pista · Arrive &amp; Drive
            </p>
            <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-white font-sans">
              Como Funciona a Experiência.
            </h2>
          </div>
          <p className="text-sm text-white/55 max-w-md font-normal leading-relaxed">
            Modelo de reserva por bateria cronometrada nos principais circuitos FIA. Você chega ao box, veste o equipamento e acelera.
          </p>
        </div>

        {/* Grade Arquitetônica Sem Cards Arredondados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-white/10">
          {RULES.map((rule, idx) => (
            <motion.div
              key={rule.step}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: idx * 0.06, duration: 0.45 }}
              className={`py-8 md:pr-8 flex flex-col justify-between border-b border-white/10 lg:border-b-0 ${
                idx > 0 ? 'lg:pl-8 lg:border-l lg:border-white/10' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-mono text-[#FF1717] font-semibold tracking-widest">
                    {rule.step}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35">
                    {rule.tag}
                  </span>
                </div>
                <h3 className="text-base font-medium text-white tracking-tight mb-2.5">
                  {rule.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-white/60 leading-relaxed">
                  {rule.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Calendário Operacional Semanal da Pista */}
        <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {WEEKLY_SCHEDULE.map((item) => (
            <div key={item.days} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-white">{item.days}</span>
                <span className={`text-[10px] font-mono uppercase tracking-wider ${item.accent}`}>
                  {item.regime}
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
