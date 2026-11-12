'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CIRCUITS, Circuit, CircuitLiveWeather, getCircuitLiveWeather } from '@/services/telemetryService';
import { api } from '@/services/api';
import { Automovel } from '@/features/booking/SessionBookingModal';
import { resolveStudioCarImage, getCarDisplaySpecs } from '@/lib/carPresentation';
import CircuitBookingModal from '../components/CircuitBookingModal';
import WorldMapCanvas from '../components/WorldMapCanvas';
import { CountryFlag } from '@/components/ui/CountryFlag';
import {
  Volume2,
  VolumeX,
  Maximize2,
  X,
  Thermometer,
  CalendarCheck,
} from 'lucide-react';

interface CircuitDisplayMeta {
  simplifiedName: string;
  countryCode: string;
  countryName: string;
  modality: string;
}

const CIRCUIT_META: Record<string, CircuitDisplayMeta> = {
  nurburgring: {
    simplifiedName: 'Nürburgring',
    countryCode: 'DE',
    countryName: 'Alemanha',
    modality: 'Endurance & 24h Nürburgring',
  },
  le_mans: {
    simplifiedName: 'Le Mans',
    countryCode: 'FR',
    countryName: 'França',
    modality: '24h de Le Mans & WEC',
  },
  spa: {
    simplifiedName: 'Spa-Francorchamps',
    countryCode: 'BE',
    countryName: 'Bélgica',
    modality: 'Fórmula 1 & 24h de Spa',
  },
  monza: {
    simplifiedName: 'Monza',
    countryCode: 'IT',
    countryName: 'Itália',
    modality: 'Fórmula 1 & GT Velocidade Máxima',
  },
  monaco: {
    simplifiedName: 'Mônaco',
    countryCode: 'MC',
    countryName: 'Mônaco',
    modality: 'Fórmula 1 Grand Prix de Mônaco',
  },
  silverstone: {
    simplifiedName: 'Silverstone',
    countryCode: 'GB',
    countryName: 'Reino Unido',
    modality: 'Fórmula 1 & Multi-Modalidades',
  },
  interlagos: {
    simplifiedName: 'Interlagos',
    countryCode: 'BR',
    countryName: 'Brasil',
    modality: 'Fórmula 1 & Multi-Modalidades',
  },
  suzuka: {
    simplifiedName: 'Suzuka',
    countryCode: 'JP',
    countryName: 'Japão',
    modality: 'Fórmula 1 & Super GT',
  },
};

export default function PistasPage() {
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit>(CIRCUITS[0]);
  const [fleet, setFleet] = useState<Automovel[]>([]);
  const [selectedCarForBooking, setSelectedCarForBooking] = useState<Automovel | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [weatherData, setWeatherData] = useState<Record<string, CircuitLiveWeather>>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Índice da pista selecionada
  const currentIndex = CIRCUITS.findIndex((c) => c.id === selectedCircuit.id);

  const currentMeta = CIRCUIT_META[selectedCircuit.id] || {
    simplifiedName: selectedCircuit.name,
    countryCode: 'BR',
    countryName: selectedCircuit.country,
    modality: selectedCircuit.categoryLabel,
  };

  const handleSelectCircuit = useCallback((circuit: Circuit) => {
    setSelectedCircuit(circuit);
  }, []);

  const handleNextCircuit = useCallback(() => {
    const nextIdx = (currentIndex + 1) % CIRCUITS.length;
    handleSelectCircuit(CIRCUITS[nextIdx]);
  }, [currentIndex, handleSelectCircuit]);

  const handlePrevCircuit = useCallback(() => {
    const prevIdx = (currentIndex - 1 + CIRCUITS.length) % CIRCUITS.length;
    handleSelectCircuit(CIRCUITS[prevIdx]);
  }, [currentIndex, handleSelectCircuit]);

  // Transição do vídeo nativo: reseta poster até o novo vídeo carregar e dar play
  useEffect(() => {
    setIsVideoReady(false);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [selectedCircuit.id]);

  // Sincroniza áudio (mute / unmute) no vídeo nativo
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (!isMuted) {
        videoRef.current.volume = 0.75;
      }
    }
  }, [isMuted]);

  // Teclas de atalho no teclado (← Anterior, → Próxima, ESC fechar modais)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBookingOpen || isMapModalOpen) {
        if (e.key === 'Escape') {
          setIsBookingOpen(false);
          setIsMapModalOpen(false);
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        handleNextCircuit();
      } else if (e.key === 'ArrowLeft') {
        handlePrevCircuit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBookingOpen, isMapModalOpen, handleNextCircuit, handlePrevCircuit]);

  // Carrega o clima ao vivo quando um circuito é selecionado
  useEffect(() => {
    if (weatherData[selectedCircuit.id]) return;

    getCircuitLiveWeather(selectedCircuit).then((weather) => {
      setWeatherData((prev) => ({ ...prev, [selectedCircuit.id]: weather }));
    });
  }, [selectedCircuit, weatherData]);

  useEffect(() => {
    api
      .get('/api/automoveis')
      .then((res) => setFleet(Array.isArray(res.data) ? res.data : []))
      .catch(() => setFleet([]));
  }, []);

  const circuitCars = useMemo(() => {
    return fleet.filter(
      (car) =>
        car.circuito?.id === selectedCircuit.id ||
        car.circuitosDisponiveis?.some((c) => c.id === selectedCircuit.id)
    );
  }, [fleet, selectedCircuit.id]);

  const activeWeather = weatherData[selectedCircuit.id] || null;

  const handleOpenBooking = (car?: Automovel) => {
    setSelectedCarForBooking(car || null);
    setIsBookingOpen(true);
  };

  return (
    <div className="relative w-screen h-[100dvh] max-h-[100dvh] bg-[#08090C] text-white overflow-hidden select-none font-sans">
      
      {/* =========================================================================
          1. PALCO DE STREAMING: VÍDEO NATIVO 1080P COM LOOP INFINITO E SEM OVERLAYS
          ========================================================================= */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        
        {/* Poster estático imediato (desaparece assim que o vídeo nativo iniciar) */}
        <img
          key={`poster-${selectedCircuit.id}`}
          src={selectedCircuit.videoThumbnail}
          alt={selectedCircuit.name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 z-[1] ${
            isVideoReady ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Player de Vídeo Nativo HTML5 (Zero YouTube, Zero Pause, Loop Infinito) */}
        <video
          ref={videoRef}
          key={`video-${selectedCircuit.id}`}
          src={`/circuits/${selectedCircuit.id}.mp4`}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onPlaying={() => setIsVideoReady(true)}
          onCanPlayThrough={() => setIsVideoReady(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-85 z-0"
        />

        {/* MÁSCARAS DE VINHETA CINEMATOGRÁFICA */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090C] via-[#08090C]/90 via-40% md:via-50% to-transparent z-10" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#08090C] via-[#08090C]/60 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#08090C] via-[#08090C]/90 to-transparent z-10" />
      </div>

      {/* =========================================================================
          2. CONTROLE DE ÁUDIO DO VÍDEO (Abaixo da navbar, sem moldura e discreto)
          ========================================================================= */}
      <div className="absolute top-20 sm:top-24 right-6 sm:right-10 z-20 pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsMuted((prev) => !prev)}
          className="text-white/40 hover:text-white transition-colors cursor-pointer p-1.5 focus:outline-none"
          title={isMuted ? 'Ativar som do motor' : 'Mutar som'}
          aria-label={isMuted ? 'Ativar som do motor' : 'Mutar som'}
        >
          {isMuted ? (
            <VolumeX size={18} className="text-white/40 hover:text-white transition-colors" />
          ) : (
            <Volume2 size={18} className="text-[#FF1717] hover:text-[#ff4d4d] transition-colors" />
          )}
        </button>
      </div>

      {/* =========================================================================
          3. ÁREA PRINCIPAL: COLUNA ESQUERDA (ESPECIFICAÇÕES, CARROS E MAPA FLEXÍVEL)
          ========================================================================= */}
      <div className="relative z-10 w-full h-full flex flex-col justify-start pt-14 sm:pt-16 pb-20 px-6 sm:px-10 lg:px-14 pointer-events-none overflow-hidden">
        
        <div className="max-w-2xl w-full flex flex-col justify-start pointer-events-auto h-full pb-2">
          
          {/* Linha 1: Eyebrow com Mini Bandeira Vetorial + País + Modalidade */}
          <div className="flex items-center gap-2.5 mb-1.5 shrink-0">
            <CountryFlag countryCode={currentMeta.countryCode} className="w-4 h-3 rounded-[2px]" />
            <p className="text-[11px] font-mono font-medium tracking-[0.2em] text-white/60 uppercase">
              {currentMeta.countryName} · {currentMeta.modality}
            </p>
          </div>

          {/* Linha 2: Nome do Circuito */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-[1.08] mb-1.5 shrink-0">
            {selectedCircuit.name}
          </h1>

          {/* Linha 3: Sinopse Editorial */}
          <p className="text-xs sm:text-sm text-white/75 font-normal leading-relaxed mb-3 max-w-xl shrink-0">
            {selectedCircuit.synopsis}
          </p>

          {/* Linha 4: ESPECIFICAÇÕES DA PISTA (Acima dos carros, estética minimalista e clean) */}
          <div className="flex items-center gap-4 sm:gap-6 py-2 px-3.5 mb-3 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md max-w-xl shrink-0">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/45">Extensão</span>
              <span className="text-xs sm:text-sm font-medium text-white font-mono mt-0.5">
                {selectedCircuit.lengthKm}
              </span>
            </div>
            
            <div className="w-[1px] h-6 bg-white/10" />

            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/45">Curvas</span>
              <span className="text-xs sm:text-sm font-medium text-white font-mono mt-0.5">
                {selectedCircuit.corners} curvas
              </span>
            </div>

            <div className="w-[1px] h-6 bg-white/10" />

            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/45">Recorde</span>
              <span className="text-xs sm:text-sm font-medium text-white font-mono mt-0.5">
                {selectedCircuit.lapRecord}
              </span>
            </div>

            {activeWeather && (
              <>
                <div className="w-[1px] h-6 bg-white/10 hidden sm:block" />
                <div className="flex-col hidden sm:flex">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-white/45">Asfalto</span>
                  <span className="text-xs sm:text-sm font-medium text-white font-mono mt-0.5 flex items-center gap-1">
                    <Thermometer size={11} className="text-[#FF1717]" />
                    {activeWeather.temperature}°C ({activeWeather.gripStatus})
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Linha 5: Supercarros no Box (Fonte ?nica da API + Est?tica Transparente Clean sem Cards Blocados) */}
          <div className="mb-3 max-w-xl shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                Supercarros homologados no box deste circuito
              </span>
              <button
                type="button"
                onClick={() => handleOpenBooking()}
                className="text-[10px] font-mono text-white/45 hover:text-white transition-colors cursor-pointer"
              >
                {circuitCars.length} modelos dispon?veis
              </button>
            </div>

            {circuitCars.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 sm:gap-5 items-end">
                {circuitCars.map((car) => {
                  const specs = getCarDisplaySpecs(car);
                  return (
                    <button
                      key={car.id}
                      type="button"
                      onClick={() => handleOpenBooking(car)}
                      className="group relative text-left cursor-pointer focus:outline-none pt-1 pb-2"
                      title={`Agendar sess?o com ${car.marca} ${car.modelo}`}
                    >
                      <div className="relative h-16 sm:h-20 w-full flex items-center justify-center mb-1.5">
                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-[78%] h-3 rounded-full bg-black/85 blur-md group-hover:bg-[#FF1717]/25 transition-colors duration-300 pointer-events-none" />
                        <img
                          src={resolveStudioCarImage(car)}
                          alt={`${car.marca} ${car.modelo}`}
                          loading="lazy"
                          className="relative z-10 w-full h-full object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.92)] group-hover:-translate-y-1 group-hover:scale-[1.06] transition-all duration-300"
                        />
                      </div>

                      <div className="h-[1px] w-full bg-white/10 group-hover:bg-[#FF1717] transition-colors mb-1.5" />

                      <p className="text-[11px] font-medium text-white/90 group-hover:text-white transition-colors truncate">
                        {car.modelo}
                      </p>
                      <p className="text-[10px] text-white/45 font-mono truncate">
                        {specs.power} ? {specs.accel}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs font-mono text-white/40 py-4">
                Conecte o backend para carregar os carros deste box...
              </p>
            )}
          </div>

{/* Linha 6: Botão de Disponibilidade (Compacto com Ícone CalendarCheck e Alinhado à Direita) */}
          <div className="flex justify-end mb-2 max-w-xl shrink-0">
            <button
              type="button"
              onClick={() => handleOpenBooking()}
              className="flex items-center gap-1.5 bg-[#FF1717] hover:bg-[#e01414] text-white text-[11px] font-medium tracking-wider uppercase px-3.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-[#FF1717]/20 hover:shadow-[#FF1717]/35 active:scale-[0.98]"
            >
              <CalendarCheck size={13} className="text-white" />
              <span>Disponibilidade</span>
            </button>
          </div>

          {/* Linha 7: O MAPA REAL INTERATIVO EMBUTIDO (Altura Flexível para preencher o espaço) */}
          <div className="w-full max-w-xl flex-1 min-h-[160px] max-h-[380px] rounded-2xl bg-[#08090C]/85 border border-white/10 backdrop-blur-md shadow-2xl overflow-hidden relative">
            
            {/* Botão de Tela Cheia: Símbolo minimalista flutuando no canto superior direito */}
            <button
              type="button"
              onClick={() => setIsMapModalOpen(true)}
              className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-lg bg-[#08090C]/80 hover:bg-[#08090C] text-white/70 hover:text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg hover:border-white/30"
              title="Expandir mapa em tela cheia"
            >
              <Maximize2 size={12} />
            </button>

            {/* Canvas do Mapa Interativo com Leaflet e traçado GPS */}
            <WorldMapCanvas
              circuits={CIRCUITS}
              selectedCircuit={selectedCircuit}
              compact={true}
            />

          </div>

        </div>

      </div>

      {/* =========================================================================
          4. FITA NO RODAPÉ: TODOS OS 8 CIRCUITOS VISÍVEIS SEM SCROLLBAR E SEM RETICÊNCIAS
          ========================================================================= */}
      <div className="absolute bottom-3 left-0 right-0 z-30 pointer-events-auto flex items-center justify-center px-4 sm:px-8">
        <div className="flex items-center gap-2 sm:gap-2.5 w-full max-w-7xl mx-auto">
          {CIRCUITS.map((circuit) => {
            const isActive = circuit.id === selectedCircuit.id;
            const meta = CIRCUIT_META[circuit.id] || {
              simplifiedName: circuit.name,
              countryCode: 'BR',
              countryName: circuit.country,
              modality: circuit.categoryLabel,
            };

            return (
              <button
                key={circuit.id}
                type="button"
                onClick={() => handleSelectCircuit(circuit)}
                className={`group relative flex-1 min-w-0 flex items-center gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? 'bg-white/10 border-[#FF1717] ring-1 ring-[#FF1717]/50 shadow-lg'
                    : 'bg-[#08090C]/80 hover:bg-white/[0.07] border-white/10 hover:border-white/20'
                }`}
              >
                {/* Bandeira Vetorial do País */}
                <CountryFlag
                  countryCode={meta.countryCode}
                  className="w-5 h-3.5 sm:w-6 sm:h-4 rounded-[2px] shadow-sm border border-white/10 shrink-0"
                />

                {/* Nome do Circuito e País Padronizados (Sem reticências no Spa) */}
                <div className="flex flex-col items-start text-left min-w-0 flex-1 overflow-hidden">
                  <span className="text-[9px] font-mono text-white/45 uppercase tracking-wider truncate w-full leading-none mb-1">
                    {meta.countryName}
                  </span>
                  <span
                    className={`text-[11px] sm:text-xs tracking-tight whitespace-nowrap transition-colors ${
                      isActive ? 'text-white font-semibold' : 'text-white/80 group-hover:text-white'
                    }`}
                  >
                    {meta.simplifiedName}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          5. MODAL DE SATÉLITE / MAPA EXPANDIDO (Tela Cheia)
          ========================================================================= */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl h-[85vh] rounded-2xl bg-[#08090C] border border-white/15 overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header do Modal */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0C0E13] z-10">
              <div className="flex items-center gap-3">
                <CountryFlag countryCode={currentMeta.countryCode} className="w-6 h-4 rounded-sm" />
                <div>
                  <h3 className="text-base font-normal text-white">
                    {selectedCircuit.name} — Malha Cartográfica & Satélite
                  </h3>
                  <p className="text-[11px] text-white/50">
                    {selectedCircuit.location} · {selectedCircuit.country}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Fechar Mapa (ESC)"
              >
                <X size={16} />
              </button>
            </div>

            {/* Container do Leaflet em Tela Cheia */}
            <div className="flex-1 w-full h-full relative">
              <WorldMapCanvas
                circuits={CIRCUITS}
                selectedCircuit={selectedCircuit}
                compact={false}
              />
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODAL DE DISPONIBILIDADE & AGENDAMENTO
          ========================================================================= */}
      <CircuitBookingModal
        circuit={selectedCircuit}
        availableCars={circuitCars}
        initialCar={selectedCarForBooking}
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedCarForBooking(null);
        }}
      />

    </div>
  );
}
