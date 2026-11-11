'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import HeroVideo from '@/features/booking/HeroVideo';
import { TrustMarquee } from '@/features/home/TrustMarquee';
import { CircuitRadarMap } from '@/features/home/CircuitRadarMap';
import { TimingSheetSection } from '@/features/home/TimingSheetSection';
import { CarCard } from '@/features/cars/components/CarCard';
import { BookingModal, Automovel } from '@/features/cars/components/BookingModal';
import { api } from '@/services/api';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomeLayout() {
  const defaultVideoSrc = '/hero.mp4';
  const defaultPosterSrc = '/hero-poster.jpg';

  const [cars, setCars] = useState<Automovel[]>([]);
  const [selectedCar, setSelectedCar] = useState<Automovel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    api.get('/api/automoveis')
      .then((res) => setCars(res.data))
      .catch(() => {});
  }, []);

  const handleOpenBooking = (car: Automovel) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090C] text-white selection:bg-[#FF1717] selection:text-white">
      <Header transparent={true} />
      
      <main className="flex-1">
        
        {/* ATO 1: O GANCHO CINEMATOGRÁFICO MINIMALISTA (Hero Video 100vh + Logo Centralizada) */}
        <HeroVideo videoSrc={defaultVideoSrc} posterSrc={defaultPosterSrc} />
        
        {/* Âncora de Scroll Suave para o Início do Conteúdo (Zero Invasão na Hero) */}
        <div id="main-content" />

        {/* ATO 2: A AUTORIDADE (Circuitos Europeus FIA Grade 1) */}
        <TrustMarquee />

        {/* ATO 3: RADAR DE CONTROLE DE PISTA EUROPEU (Map + Telemetria Live + Onboard 4K) */}
        <CircuitRadarMap />

        {/* ATO 4: TIMING SHEET EDITORIAL AKQA (The Machine, Underwriting, Arrive & Drive, VBOX) */}
        <TimingSheetSection />

        {/* ATO 5: VITRINE DE PISTA NA HOME (Homologated Fleet Showcase) */}
        <section id="circuit-fleet" className="py-28 px-6 bg-[#08090C] border-b border-white/10 relative">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#FF1717] animate-ping" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#FF1717]">
                    Official Fleet Grid
                  </span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black font-sans uppercase tracking-tight text-white leading-none">
                  Frota de <span className="text-[#FF1717]">Pista.</span>
                </h2>
                <p className="text-white/60 text-sm md:text-base font-light mt-3 max-w-xl font-sans">
                  Superesportivos preparados para baterias cronometradas com telemetria e apólice de pista inclusos.
                </p>
              </div>

              <Link
                to="/cars"
                className="self-start md:self-auto px-6 py-3.5 rounded-full font-mono text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/15 text-white hover:bg-[#FF1717] hover:text-white hover:border-[#FF1717] transition-all flex items-center gap-2 group cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,23,23,0.4)]"
              >
                <span>Ver Todos os Veículos ({cars.length})</span>
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {/* Grid dos Carros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {cars.slice(0, 4).map((car, idx) => (
                <CarCard 
                  key={car.id} 
                  carro={car} 
                  index={idx} 
                  onSelect={handleOpenBooking} 
                />
              ))}
            </div>
          </div>
        </section>

        {/* ATO 6: O CLÍMAX FINAL (Pitlane Call to Action) */}
        <section className="py-32 px-6 bg-[#08090C] overflow-hidden relative border-t border-white/10">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            {/* Brilho neon de fundo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#FF1717]/10 blur-[150px] rounded-full pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 mb-6 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#FF1717]">
              Green Flag // Pitlane Open
            </div>

            <h2 className="text-4xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight leading-tight">
              O Cronômetro está correndo. <br />
              <span className="text-[#FF1717]">Entre no Pitlane.</span>
            </h2>
            <p className="text-white/60 text-base md:text-xl font-light mb-10 max-w-2xl mx-auto leading-relaxed font-sans">
              Escolha seu supercarro, emita seu contrato de crédito de franquia e sinta as forças G nos circuitos mais lendários do mundo.
            </p>
            
            <button 
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-[#FF1717] text-white font-mono text-xs font-black uppercase tracking-widest px-10 py-5 rounded-full hover:bg-white hover:text-black hover:shadow-[0_0_35px_rgba(255,23,23,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Iniciar Reserva de Pista ↗
            </button>
          </div>
        </section>

      </main>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        car={selectedCar} 
      />
    </div>
  );
}
