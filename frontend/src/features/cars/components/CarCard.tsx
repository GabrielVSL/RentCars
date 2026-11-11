'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Flag } from 'lucide-react';
import { Automovel } from './BookingModal';
import { useCurrencyStore } from '@/store/useCurrencyStore';

interface CarCardProps {
  carro: Automovel;
  index: number;
  onSelect: (car: Automovel) => void;
}

// Mapeia specs de pista de acordo com o modelo/marca
function getTrackSpecs(modelo: string, marca: string) {
  const m = modelo.toLowerCase();
  if (m.includes('gt3') || marca.toLowerCase().includes('porsche')) {
    return {
      circuit: 'Nürburgring Nordschleife 🇩🇪',
      circuitCode: 'NBR-GRN',
      topSpeed: '296 KM/H',
      accel: '3.2s',
      power: '525 CV',
      trackSetup: 'FIA Rollcage + Cup 2R',
    };
  }
  if (m.includes('m4') || marca.toLowerCase().includes('bmw')) {
    return {
      circuit: 'Bugatti Circuit Le Mans 🇫🇷',
      circuitCode: 'LMS-24',
      topSpeed: '290 KM/H',
      accel: '3.5s',
      power: '510 CV',
      trackSetup: 'Track Pack Carbon',
    };
  }
  if (m.includes('amg') || marca.toLowerCase().includes('mercedes')) {
    return {
      circuit: 'Spa-Francorchamps 🇧🇪',
      circuitCode: 'SPA-EAU',
      topSpeed: '315 KM/H',
      accel: '3.1s',
      power: '730 CV',
      trackSetup: 'Track Series Aero',
    };
  }
  return {
    circuit: 'Autodromo di Monza 🇮🇹',
    circuitCode: 'MNZ-PAR',
    topSpeed: '331 KM/H',
    accel: '3.1s',
    power: '620 CV',
    trackSetup: 'V10 High-Downforce',
  };
}

export function CarCard({ carro, index, onSelect }: CarCardProps) {
  const { formatPrice } = useCurrencyStore();
  const specs = getTrackSpecs(carro.modelo, carro.marca);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-[#0F1117] rounded-3xl overflow-hidden border border-white/10 hover:border-[#FF1717]/50 shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:shadow-[0_25px_60px_rgba(255,23,23,0.15)] transition-all duration-500 flex flex-col"
    >
      {/* Moldura de Pista (Dark Studio com Glow) */}
      <div className="aspect-[16/10] relative overflow-hidden bg-gradient-to-b from-[#181B24] to-[#0A0B0E] flex items-center justify-center border-b border-white/5">
        {carro.imageUrl ? (
          <img 
            src={carro.imageUrl} 
            alt={carro.modelo} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black/40 text-white/30 font-mono text-xs">
            TELEMETRY VIEW
          </div>
        )}
        
        {/* Circuito Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <span className="bg-black/80 backdrop-blur-md text-[#FF1717] border border-[#FF1717]/40 text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF1717] animate-pulse" />
            {specs.circuitCode}
          </span>
          <span className="bg-white/10 backdrop-blur-md text-white/80 text-[10px] font-mono px-2.5 py-1 rounded-full">
            {carro.ano}
          </span>
        </div>
      </div>

      {/* Dados do Veículo */}
      <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-[#FF1717] mb-1 font-bold">
            <span>{carro.marca}</span>
            <span className="text-white/40">{specs.circuit.split(' ')[0]}</span>
          </div>

          <h3 className="text-2xl font-black font-sans text-white tracking-tight leading-none mb-3">
            {carro.modelo}
          </h3>

          <div className="text-xs font-mono text-white/60 mb-5 flex items-center gap-1.5">
            <Flag size={13} className="text-[#FF1717]" />
            <span>{specs.circuit}</span>
          </div>
          
          {/* Métricas de Telemetria de Pista */}
          <div className="grid grid-cols-3 gap-2 bg-black/40 p-3 rounded-2xl border border-white/5 font-mono mb-6 text-center">
            <div>
              <div className="text-xs md:text-sm font-black text-white">{specs.topSpeed}</div>
              <div className="text-[9px] text-white/40 uppercase">Top Speed</div>
            </div>
            <div className="border-x border-white/10">
              <div className="text-xs md:text-sm font-black text-[#FF1717]">{specs.accel}</div>
              <div className="text-[9px] text-white/40 uppercase">0-100 KM/H</div>
            </div>
            <div>
              <div className="text-xs md:text-sm font-black text-white">{specs.power}</div>
              <div className="text-[9px] text-white/40 uppercase">Potência</div>
            </div>
          </div>
        </div>

        {/* Rodapé do Card: Preço e Botão */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase font-mono font-bold text-white/40 tracking-widest mb-0.5">Sessão / Diária</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-[#FF1717] tracking-tight">
                {formatPrice(carro.precoPorDia)}
              </span>
              <span className="text-[10px] font-mono text-white/40">/dia</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => onSelect(carro)}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/15 text-white flex items-center justify-center group-hover:bg-[#FF1717] group-hover:text-white group-hover:scale-105 transition-all duration-300 shadow-lg cursor-pointer"
            title="Reservar Bateria de Pista"
          >
            <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
