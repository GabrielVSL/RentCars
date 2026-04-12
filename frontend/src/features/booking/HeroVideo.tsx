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
    <section className="relative h-screen overflow-hidden">
      {/* Background Video - Fullscreen autoplay loop muted */}
      <div className="absolute inset-0 bg-black">
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

      {/* Cinematic dark vignette - frames the center for the car */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-black/60" />

      {/* Bottom lift gradient - protects text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Hero Typography - Bottom third positioning */}
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pt-20 md:pt-24 pb-16 md:pb-24 lg:pb-32 z-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl text-left drop-shadow-2xl"
        >
          {/* Premium badge */}
          <motion.div variants={fadeInUp} className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative">
                <SparklesIcon className="h-5 w-5 text-amber-400 drop-shadow-md" aria-hidden="true" />
                <div className="absolute inset-0 blur-md bg-amber-400/30" />
              </div>
              <span className="text-xs md:text-sm font-semibold text-white/80 uppercase tracking-[0.2em] drop-shadow-md">
                Premium Car Rental
              </span>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.div variants={fadeInUp} className="mb-6 md:mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] tracking-tight">
              <span className="block text-white drop-shadow-xl mb-2">
                Encontre seu
              </span>
              <span className="block text-white drop-shadow-xl mb-2">
                Carro
              </span>
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow-lg" style={{
                backgroundSize: '200% auto',
              }}>
                Perfeito
              </span>
            </h1>
          </motion.div>

          {/* Supporting copy */}
          <motion.div variants={fadeInUp}>
            <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-2xl leading-relaxed drop-shadow-md font-light">
              Compare preços de mais de 1000 veículos em todo o Brasil.
              <span className="text-cyan-300 font-medium block mt-3 md:mt-4 drop-shadow-sm">
                Preços transparentes • Cancelamento grátis • KM livre
              </span>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-9 md:w-6 md:h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1"
        >
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4], y: [2, 6, 2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 bg-white/60 rounded-full"
          />
        </motion.div>
      </motion.div>

      {/* SEAMLESS FADE: Otimizado para garantir o preto puro na base e evitar quebra de pixels */}
      <div className="absolute -bottom-1 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none" />
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