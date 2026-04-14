'use client';

import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

interface HeroVideoProps {
  videoSrc: string;
  posterSrc: string;
}

export default function HeroVideo({ videoSrc, posterSrc }: HeroVideoProps) {
  return (
    <section className="relative h-screen overflow-hidden bg-black">
      {/* Background Video - 100% Nítido e Sem Cortes */}
      <div className="absolute inset-0">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
      </div>

      {/* Vignette escuro APENAS para garantir a leitura do texto */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/10 to-black/30 pointer-events-none" />

      {/* Tipografia */}
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pt-20 md:pt-24 pb-28 md:pb-32 z-20 pointer-events-none">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl text-left drop-shadow-2xl"
        >
          <motion.div variants={fadeInUp} className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative">
                <SparklesIcon className="h-5 w-5 text-blue-400 drop-shadow-md" aria-hidden="true" />
              </div>
              <span className="text-xs md:text-sm font-semibold text-white/90 uppercase tracking-[0.2em] drop-shadow-md">
                Premium Car Rental
              </span>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="mb-6 md:mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] tracking-tighter">
              <span className="block text-white drop-shadow-xl mb-2">Encontre seu</span>
              <span className="block text-white drop-shadow-xl mb-2">Carro</span>
              <span className="block bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                Perfeito
              </span>
            </h1>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-2xl leading-relaxed drop-shadow-md font-light">
              Compare preços de mais de 1000 veículos em todo o Brasil.
              <span className="text-blue-300 font-medium block mt-3 md:mt-4 drop-shadow-sm">
                Preços transparentes • Cancelamento grátis • KM livre
              </span>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-9 md:w-6 md:h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1"
        >
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4], y: [2, 6, 2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 bg-white/80 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 3-1.9 5.3" />
      <path d="M6.8 8.5 12 3" />
      <path d="m12 3 1.9 5.3" />
      <path d="M17.2 8.5 12 3" />
      <path d="M12 5.8v4.3" />
      <path d="M12 21v-5.3" />
      <path d="M6.8 15.5 12 21" />
      <path d="m12 21 1.9-5.3" />
      <path d="M17.2 15.5 12 21" />
      <path d="M12 18.2v-4.3" />
    </svg>
  );
}