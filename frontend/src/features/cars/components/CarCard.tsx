'use client';

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Automovel } from './BookingModal';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getCarDisplaySpecs, resolveStudioCarImage } from '@/lib/carPresentation';

interface CarCardProps {
  carro: Automovel;
  index: number;
  onSelect: (car: Automovel) => void;
}

const formatShortCircuitName = (name: string) =>
  name
    .replace('Circuit de la Sarthe ', '')
    .replace('Circuit de ', '')
    .replace('Autodromo Nazionale ', '')
    .replace('Autódromo de ', '')
    .replace(' International Racing Course', '')
    .replace(' Nordschleife', '')
    .replace(' Circuit', '')
    .replace(/[()]/g, '')
    .trim();

export function CarCard({ carro, index, onSelect }: CarCardProps) {
  const { formatPrice } = useCurrencyStore();
  const { user } = useAuthStore();
  const isStaff = Boolean(user && user.role !== 'CLIENTE');
  const staffTarget = user?.role === 'BANCO' ? '/analises' : '/frota';
  const specs = getCarDisplaySpecs(carro);
  const imageSrc = resolveStudioCarImage(carro);

  const circuitosList =
    carro.circuitosDisponiveis && carro.circuitosDisponiveis.length > 0
      ? carro.circuitosDisponiveis.map((c) => formatShortCircuitName(c.nome))
      : [specs.circuit];

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.24), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col"
    >
      {/* Topo editorial sem borda de card */}
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <Link
          to={`/cars/${carro.id}`}
          className="text-xl sm:text-2xl font-medium tracking-tight text-white hover:text-[#FF1717] transition-colors"
        >
          {carro.marca} {carro.modelo}
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/45 shrink-0">
          {specs.category} · {carro.ano}
        </span>
      </div>

      {/* Palco Studio Livre sem caixa fechada */}
      <Link
        to={`/cars/${carro.id}`}
        className="relative h-56 sm:h-64 w-full flex items-center justify-center my-4 cursor-pointer"
        aria-label={`Ver detalhes de ${carro.marca} ${carro.modelo}`}
      >
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[78%] h-8 rounded-full bg-black/85 blur-xl group-hover:bg-[#FF1717]/15 transition-colors duration-500 pointer-events-none" />
        <div className="absolute inset-x-10 top-6 bottom-6 rounded-full bg-[radial-gradient(ellipse,rgba(255,255,255,0.05)_0%,transparent_72%)] pointer-events-none" />
        <img
          src={imageSrc}
          alt={`${carro.marca} ${carro.modelo}`}
          loading="lazy"
          className="relative z-10 w-full h-full object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.88)] group-hover:-translate-y-1 group-hover:scale-[1.03] transition-all duration-500"
        />
      </Link>

      {/* Grade de Especificações com Linhas Ultrafinas (Padrão FleetCompareSection) */}
      <div>
        <div className="grid grid-cols-3 gap-4 pb-4 border-b border-white/10">
          <div>
            <p className="text-[11px] font-medium text-white/45 mb-1">Categoria</p>
            <p className="text-xs sm:text-sm text-white/90 truncate">{specs.category} Track</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-white/45 mb-1">Potência</p>
            <p className="text-xs sm:text-sm text-white/90 tabular-nums">{specs.power}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-white/45 mb-1">Homologação</p>
            <p className="text-xs sm:text-sm text-white/90 truncate">
              {circuitosList.length > 1 ? `${circuitosList.length} circuitos` : circuitosList[0]}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 py-4 border-b border-white/10 items-baseline">
          <div className="text-lg sm:text-xl font-medium tracking-tight text-white tabular-nums">
            {specs.topSpeed.replace(/ km\/h/i, '')}
            <span className="text-[11px] text-white/45 font-normal ml-1">km/h</span>
          </div>
          <div className="text-lg sm:text-xl font-medium tracking-tight text-white tabular-nums">
            {specs.accel.replace(/s$/i, '')}
            <span className="text-[11px] text-white/45 font-normal ml-1">s (0–100)</span>
          </div>
          <div className="text-lg sm:text-xl font-medium tracking-tight text-white tabular-nums">
            {formatPrice(carro.precoPorDia)}
            <span className="text-[11px] text-white/45 font-normal ml-1">/sessão</span>
          </div>
        </div>

        <div className="py-3.5 border-b border-white/10 flex items-center justify-between gap-4 text-xs">
          <span className="text-white/45 font-mono uppercase tracking-wider text-[10px] shrink-0">
            Boxes disponíveis
          </span>
          <span className="text-white/75 truncate text-right">
            {circuitosList.join(' · ')}
          </span>
        </div>

        {/* Ações limpas */}
        <div className="pt-5 flex items-center justify-between gap-3">
          <Link
            to={`/cars/${carro.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/65 hover:text-white transition-colors"
          >
            <span>Ficha técnica</span>
            <ArrowUpRight size={14} />
          </Link>

          {isStaff ? (
            <Link
              to={staffTarget}
              className="bg-white/10 text-white hover:bg-[#FF1717] border border-white/15 hover:border-[#FF1717] text-xs font-medium px-6 py-2.5 rounded-full transition-all duration-200 active:scale-[0.98]"
            >
              {user?.role === 'BANCO' ? 'Painel de Auditoria' : 'Gerenciar nos Boxes'}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onSelect(carro)}
              className="bg-[#F3F4F6] text-[#08090C] hover:bg-[#FF1717] hover:text-white text-xs font-medium px-6 py-2.5 rounded-full transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              Reservar Sessão
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
