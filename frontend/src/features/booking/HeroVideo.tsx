'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroVideoProps {
  videoSrc?: string;
  posterSrc?: string;
  onExploreClick?: () => void;
}

export default function HeroVideo({
  videoSrc = '/hero.mp4',
  posterSrc = '/hero-poster.jpg',
  onExploreClick,
}: HeroVideoProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [videoParallax, setVideoParallax] = useState({ x: 0, y: 0 });

  // Desaparece permanentemente na primeira rolagem e só volta ao recarregar a página
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setHasScrolled(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax de profundidade no vídeo ao mover o mouse
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
      setVideoParallax({ x: -normX * 8, y: -normY * 8 });
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, []);

  const handleScrollDown = () => {
    setHasScrolled(true);
    if (onExploreClick) {
      onExploreClick();
      return;
    }
    const target = document.getElementById('main-content');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen h-[100dvh] w-full bg-[#08090C] text-white overflow-hidden select-none">
      {/* 1. Background Video em Looping com Poster do 1º Frame + Parallax de Profundidade */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{ x: videoParallax.x, y: videoParallax.y }}
          transition={{ type: 'spring', stiffness: 90, damping: 22, mass: 0.5 }}
          className="w-full h-full scale-[1.04]"
        >
          <video
            className="w-full h-full object-cover filter brightness-[0.72] contrast-[1.12]"
            src={videoSrc}
            poster={posterSrc}
            autoPlay
            loop
            muted
            playsInline
          />
        </motion.div>

        {/* Gradientes Cinematográficos de Profundidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090C] via-black/30 to-black/50 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/75 pointer-events-none" />
      </div>

      {/* 2. Indicador Tímido e Minimalista: some na 1ª rolagem e só volta ao recarregar a página */}
      <AnimatePresence>
        {!hasScrolled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.4 } }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-auto"
          >
            <button
              type="button"
              onClick={handleScrollDown}
              className="group flex flex-col items-center gap-1.5 cursor-pointer focus:outline-none"
              aria-label="Descer para explorar"
            >
              <span className="text-[9px] font-sans font-medium tracking-[0.3em] uppercase text-white/35 group-hover:text-white/70 transition-colors">
                scroll
              </span>

              {/* Fio de cabelo vertical de 1px com pulso vermelho sutil */}
              <div className="w-[1px] h-7 bg-white/20 relative overflow-hidden rounded-full">
                <motion.div
                  animate={{ y: [-14, 28] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  className="w-full h-3.5 bg-[#FF1717] rounded-full"
                />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
