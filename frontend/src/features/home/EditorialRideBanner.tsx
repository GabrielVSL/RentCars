'use client';

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function EditorialRideBanner() {
  return (
    <section className="relative w-full min-h-[64vh] sm:min-h-[72vh] flex items-center justify-center overflow-hidden bg-[#08090C] select-none">
      {/* Atmosfera fotográfica dark GT3 RS */}
      <img
        src="/banner-gt3.jpg"
        alt="Porsche 911 GT3 RS no pitlane"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
        loading="lazy"
      />

      {/* Máscaras de fusão contínua com a Hero acima e a faixa de marcas abaixo */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#08090C] via-[#08090C]/70 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#08090C] via-[#08090C]/80 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,9,12,0.55)_0%,rgba(8,9,12,0.82)_100%)] pointer-events-none" />

      {/* Conteúdo Editorial Centralizado */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 container mx-auto px-6 text-center max-w-2xl"
      >
        <p className="text-[11px] font-mono font-medium tracking-[0.22em] text-white/55 uppercase mb-3">
          Track Day & Performance
        </p>

        <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-white leading-[1.1] mb-4 font-sans">
          Encontre o Carro Ideal para a Sua Próxima Volta.
        </h2>

        <p className="text-sm sm:text-base text-white/70 font-normal leading-relaxed max-w-xl mx-auto mb-8 font-sans">
          Superesportivos preparados no box com telemetria integrada, freios carbono-cerâmica e disponibilidade imediata nos principais autódromos.
        </p>

        <Link
          to="/pistas"
          className="inline-flex items-center gap-2 bg-[#FF1717] hover:bg-[#e01414] text-white text-xs sm:text-sm font-medium tracking-wide px-7 py-3 rounded-full transition-all duration-200 shadow-lg shadow-[#FF1717]/25 hover:shadow-[#FF1717]/40 active:scale-[0.98]"
        >
          <span>Explorar Pistas</span>
          <ArrowRight size={15} />
        </Link>
      </motion.div>
    </section>
  );
}
