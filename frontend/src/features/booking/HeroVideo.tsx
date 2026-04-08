'use client';

import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

interface HeroVideoProps {
  videoSrc: string;
  posterSrc: string;
}

export default function HeroVideo({ videoSrc, posterSrc }: HeroVideoProps) {
  return (
    <section className="relative min-h-screen overflow-hidden">
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

      {/* Dark Overlay - Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30" />

      {/* Subtle radial accent for premium feel */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

      {/* Hero Typography - Centered, minimalist, high contrast */}
      <div className="relative container mx-auto px-4 pt-24 pb-16 h-full flex items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-5xl mx-auto text-center"
        >
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <SparklesIcon className="h-5 w-5 text-amber-400" aria-hidden="true" />
              <span className="text-sm font-semibold text-white/60 uppercase tracking-widest">
                Premium Car Rental
              </span>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="mb-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              Encontre seu Carro
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Perfeito
              </span>
            </h1>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Compare preços de mais de 1000 veículos em todo o Brasil.
              <span className="text-emerald-400 font-medium block mt-2">
                Preços transparentes • Cancelamento grátis • KM livre
              </span>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Subtle scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5], y: [2, 6, 2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 bg-white/60 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 3-1.9 5.3"/>
      <path d="M6.8 8.5 12 3"/>
      <path d="m12 3 1.9 5.3"/>
      <path d="M17.2 8.5 12 3"/>
      <path d="M12 5.8v4.3"/>
      <path d="M12 21v-5.3"/>
      <path d="M6.8 15.5 12 21"/>
      <path d="m12 21 1.9-5.3"/>
      <path d="M17.2 15.5 12 21"/>
      <path d="M12 18.2v-4.3"/>
    </svg>
  );
}
