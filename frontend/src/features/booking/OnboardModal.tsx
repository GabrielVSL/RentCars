'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy } from 'lucide-react';
import { Circuit } from '@/services/telemetryService';

interface OnboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  circuit: Circuit | null;
}

export function OnboardModal({ isOpen, onClose, circuit }: OnboardModalProps) {
  if (!circuit) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-5xl bg-[#08090C] border border-white/15 rounded-3xl overflow-hidden shadow-[0_25px_90px_rgba(0,0,0,0.95)] flex flex-col font-mono text-white z-10"
          >
            {/* Top Bar Técnica */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/70">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF1717] animate-ping" />
                <span className="text-xs font-black uppercase tracking-[0.25em] text-[#FF1717]">
                  LIVE ONBOARD COCKPIT // 4K TELEMETRY
                </span>
                <span className="text-xs text-white/40 hidden sm:inline">
                  • {circuit.name} ({circuit.flag} {circuit.country})
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Fechar vídeo onboard"
              >
                <X size={18} />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${circuit.onboardYoutubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={`${circuit.name} Onboard Hot Lap`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Bottom Bar: Telemetria da Volta & Setores */}
            <div className="p-6 bg-gradient-to-t from-black via-black/80 to-[#08090C] border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest mb-1">
                  <Trophy size={12} className="text-[#FF1717]" />
                  <span>Recorde Oficial de Volta</span>
                </div>
                <div className="text-xl md:text-2xl font-black text-white">
                  {circuit.lapRecord} <span className="text-xs font-normal text-white/50">• {circuit.recordHolder}</span>
                </div>
              </div>

              {/* Setores cronometrados */}
              <div className="flex flex-wrap gap-2 text-xs">
                {circuit.sectors.map((sec, i) => (
                  <div key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <span className="text-[#FF1717] font-bold">S{i + 1}:</span>
                    <span className="text-white/80">{sec.targetTime}</span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
