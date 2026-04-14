'use client';
import { motion } from 'framer-motion';

const brandLogos = [
  "/logos/vw.webp", "/logos/fiat.svg", "/logos/chevrolet.webp",
  "/logos/byd.svg", "/logos/bmw.svg", "/logos/audi.webp",
  "/logos/jeep.svg", "/logos/toyota.svg", "/logos/tesla.svg"
];

export function TrustMarquee() {
  return (
    <div className="relative py-16 bg-transparent overflow-hidden">
      <div className="container mx-auto px-6 mb-10">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Experiência garantida pelas melhores montadoras
        </p>
      </div>

      <div className="relative flex items-center">
        {/* Máscaras de gradiente para suavizar as bordas */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#F5F5F7] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#F5F5F7] to-transparent z-10" />

        <motion.div
          className="flex whitespace-nowrap gap-20 items-center opacity-40 hover:opacity-80 transition-opacity duration-700"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        >
          {[...brandLogos, ...brandLogos].map((src, i) => (
            <div key={i} className="w-32 h-12 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-500">
              <img src={src} alt="Brand" className="max-h-full max-w-full object-contain" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}