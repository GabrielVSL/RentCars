'use client';
import { motion } from 'framer-motion';
import { CIRCUITS } from '@/services/telemetryService';

export function TrustMarquee() {
  const marqueeItems = [...CIRCUITS, ...CIRCUITS];

  return (
    <div className="relative py-12 bg-[#08090C] border-y border-white/10 overflow-hidden select-none">
      
      {/* Label Superior */}
      <div className="container mx-auto px-6 mb-6">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white/40">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF1717]" />
            <span>HOMOLOGATED FIA GRADE 1 CIRCUITS · LIVE PITLANE ACCESS</span>
          </div>
          <span className="hidden sm:inline">EUROPEAN MOTORSPORT NETWORK</span>
        </div>
      </div>

      <div className="relative flex items-center">
        {/* Máscaras de Gradiente Escuro nas extremidades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-[#08090C] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-[#08090C] to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex whitespace-nowrap gap-12 md:gap-16 items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        >
          {marqueeItems.map((c, i) => (
            <div 
              key={`${c.id}-${i}`} 
              className="flex items-center gap-4 py-2 px-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#FF1717]/50 transition-all duration-300 group"
            >
              <span className="text-xl">{c.flag}</span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black font-mono tracking-tight text-white group-hover:text-[#FF1717] transition-colors">
                    {c.name.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                    {c.code}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-white/40">
                  <span>{c.lengthKm}</span>
                  <span>·</span>
                  <span>{c.corners} Curvas</span>
                  <span>·</span>
                  <span className="text-[#FF1717]">Recorde: {c.lapRecord}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

    </div>
  );
}
