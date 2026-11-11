'use client';

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Automovel } from './BookingModal';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { getCarDisplaySpecs, resolveStudioCarImage } from '@/lib/carPresentation';

interface CarCardProps {
  carro: Automovel;
  index: number;
  onSelect: (car: Automovel) => void;
}

export function CarCard({ carro, index, onSelect }: CarCardProps) {
  const { formatPrice } = useCurrencyStore();
  const specs = getCarDisplaySpecs(carro);
  const imageSrc = resolveStudioCarImage(carro);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.25), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col"
    >
      {/* Palco Studio sem fundo */}
      <Link
        to={`/cars/${carro.id}`}
        className="aspect-[16/9] relative overflow-hidden bg-gradient-to-b from-[#0E1118] to-[#08090C] flex items-center justify-center p-6 border-b border-white/[0.06]"
        aria-label={`Ver detalhes de ${carro.marca} ${carro.modelo}`}
      >
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[70%] h-6 rounded-full bg-black/80 blur-xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />

        <img
          src={imageSrc}
          alt={`${carro.marca} ${carro.modelo}`}
          loading="lazy"
          className="relative z-10 w-full h-full object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.85)] group-hover:scale-[1.04] transition-transform duration-500"
        />

        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/70 bg-[#08090C]/75 border border-white/10 backdrop-blur-md px-2.5 py-1 rounded-full">
            {specs.circuit}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 bg-[#08090C]/75 border border-white/10 backdrop-blur-md px-2.5 py-1 rounded-full">
            {specs.category} · {carro.ano}
          </span>
        </div>
      </Link>

      {/* Conteúdo */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/45 mb-1">
            {carro.marca}
          </p>

          <Link
            to={`/cars/${carro.id}`}
            className="text-xl font-medium text-white hover:text-[#FF1717] transition-colors tracking-tight block mb-5"
          >
            {carro.modelo}
          </Link>

          {/* 3 Métricas alinhadas */}
          <div className="grid grid-cols-3 gap-3 py-3.5 border-y border-white/[0.08] mb-5">
            <div>
              <p className="text-[10px] text-white/45 mb-0.5">Potência</p>
              <p className="text-sm font-medium text-white tabular-nums">{specs.power}</p>
            </div>
            <div className="border-x border-white/[0.08] px-3">
              <p className="text-[10px] text-white/45 mb-0.5">0–100 km/h</p>
              <p className="text-sm font-medium text-white tabular-nums">{specs.accel}</p>
            </div>
            <div className="pl-1">
              <p className="text-[10px] text-white/45 mb-0.5">Vel. Máx.</p>
              <p className="text-sm font-medium text-white tabular-nums">{specs.topSpeed}</p>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-white/45 mb-0.5">Sessão / Diária</p>
            <p className="text-lg font-medium text-white tabular-nums">
              {formatPrice(carro.precoPorDia)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/cars/${carro.id}`}
              className="px-4 py-2 rounded-full border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 text-xs font-medium text-white/85 hover:text-white transition-all flex items-center gap-1"
            >
              <span>Detalhes</span>
              <ArrowUpRight size={13} />
            </Link>
            <button
              type="button"
              onClick={() => onSelect(carro)}
              className="px-5 py-2 rounded-full bg-[#F3F4F6] text-[#08090C] hover:bg-[#FF1717] hover:text-white text-xs font-medium transition-all cursor-pointer active:scale-[0.98]"
            >
              Reservar
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
