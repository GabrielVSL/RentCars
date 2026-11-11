'use client';

import { useState, useEffect } from 'react';
import { CIRCUITS, Circuit, CircuitLiveWeather, getCircuitLiveWeather } from '@/services/telemetryService';
import { OnboardModal } from '@/features/booking/OnboardModal';
import { Play, ChevronRight } from 'lucide-react';

interface CircuitRadarMapProps {
  onSelectCircuit?: (circuit: Circuit) => void;
}

export function CircuitRadarMap({ onSelectCircuit }: CircuitRadarMapProps) {
  const [activeCircuit, setActiveCircuit] = useState<Circuit>(CIRCUITS[0]); // Nürburgring
  const [weather, setWeather] = useState<CircuitLiveWeather | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoadingWeather(true);
    getCircuitLiveWeather(activeCircuit).then((data) => {
      if (isMounted) {
        setWeather(data);
        setLoadingWeather(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [activeCircuit]);

  const handleSelect = (c: Circuit) => {
    setActiveCircuit(c);
    if (onSelectCircuit) {
      onSelectCircuit(c);
    }
  };

  // Coordenadas relativas de plotagem estilizada no mapa tático da Europa (viewBox 0 0 800 500)
  const mapCoordinates: Record<string, { x: number; y: number }> = {
    nurburgring: { x: 395, y: 220 }, // Eifel, Alemanha
    spa: { x: 360, y: 210 },         // Ardenas, Bélgica
    monza: { x: 435, y: 310 },       // Milão, Itália
    monaco: { x: 410, y: 345 },      // Riviera, Mônaco
  };

  return (
    <section id="race-control-map" className="py-28 px-6 bg-[#08090C] text-white border-b border-white/10 font-mono relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#FF1717]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Header da Seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs text-white/40 tracking-[0.25em] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#FF1717] animate-ping" />
              <span>RACE CONTROL // EUROPEAN SATELLITE RADAR</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black font-sans uppercase tracking-tight text-white leading-tight">
              Hubs de Pista <span className="text-[#FF1717]">Oficiais.</span>
            </h2>
            <p className="text-white/60 text-xs md:text-sm font-sans font-light mt-2 max-w-2xl">
              Nossa infraestrutura permanente nos autódromos da FIA. Selecione um circuito no radar tático para carregar a telemetria ao vivo e os carros homologados naquele box.
            </p>
          </div>

          {/* Abas Rápidas */}
          <div className="flex flex-wrap gap-2 text-xs">
            {CIRCUITS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect(c)}
                className={`px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                  activeCircuit.id === c.id
                    ? 'bg-[#FF1717] text-white border-[#FF1717] font-black shadow-[0_0_20px_rgba(255,23,23,0.4)]'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {c.flag} {c.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Grade: Mapa Tático à Esquerda + Cockpit de Telemetria à Direita */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Radar Tático Europeu (SVG Vetorial de Alta Precisão) */}
          <div className="lg:col-span-7 bg-[#0D0F15] border border-white/15 rounded-3xl p-6 md:p-8 relative flex flex-col justify-between overflow-hidden shadow-2xl">
            
            {/* Linhas de Grade Tática */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            </div>

            {/* Cabeçalho do Radar */}
            <div className="flex items-center justify-between text-xs text-white/40 border-b border-white/10 pb-4 relative z-10">
              <span>LAT {activeCircuit.lat.toFixed(4)}° N // LON {activeCircuit.lon.toFixed(4)}° E</span>
              <span className="text-[#FF1717] font-bold">● RADAR SWEEP ACTIVE</span>
            </div>

            {/* Visualização Cartográfica Tática */}
            <div className="relative h-72 md:h-96 w-full my-6 flex items-center justify-center">
              <svg viewBox="0 0 800 500" className="w-full h-full filter drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                {/* Contorno simplificado e elegante da Europa Ocidental */}
                <path
                  d="M 220,120 L 260,110 L 310,130 L 330,170 L 380,180 L 410,160 L 440,190 L 460,220 L 490,200 L 510,240 L 470,280 L 440,290 L 450,330 L 490,380 L 470,410 L 430,370 L 390,350 L 360,380 L 340,360 L 350,320 L 320,300 L 290,320 L 260,310 L 280,260 L 300,240 L 290,200 L 260,190 L 240,150 Z"
                  fill="rgba(255,255,255,0.02)"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Ilhas Britânicas */}
                <path
                  d="M 240,140 L 280,130 L 290,160 L 270,180 L 240,190 L 230,160 Z"
                  fill="rgba(255,255,255,0.01)"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />

                {/* Linhas de conexão vetoriais entre os hubs */}
                <line x1="395" y1="220" x2="360" y2="210" stroke="#FF1717" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                <line x1="395" y1="220" x2="435" y2="310" stroke="#FF1717" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                <line x1="435" y1="310" x2="410" y2="345" stroke="#FF1717" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

                {/* Plotagem de Cada Hub Oficial */}
                {CIRCUITS.map((c) => {
                  const pos = mapCoordinates[c.id];
                  if (!pos) return null;
                  const isActive = c.id === activeCircuit.id;

                  return (
                    <g key={c.id} className="cursor-pointer" onClick={() => handleSelect(c)}>
                      {/* Círculo de Pulso se Ativo */}
                      {isActive && (
                        <circle cx={pos.x} cy={pos.y} r="18" fill="none" stroke="#FF1717" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
                      )}
                      
                      {/* Nó Central */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isActive ? "7" : "4"}
                        fill={isActive ? "#FF1717" : "#ffffff"}
                        stroke={isActive ? "#000000" : "rgba(255,255,255,0.3)"}
                        strokeWidth="2"
                        className="transition-all duration-300"
                      />

                      {/* Rótulo do Hub */}
                      <text
                        x={pos.x + 12}
                        y={pos.y + 4}
                        fill={isActive ? "#FF1717" : "rgba(255,255,255,0.6)"}
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight={isActive ? "bold" : "normal"}
                      >
                        {c.code} // {c.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Rodapé do Radar com Traçado Oficial FIA */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF1717]" />
                <span>HUB ATIVO: {activeCircuit.name.toUpperCase()}</span>
              </div>
              <span>EXTENSÃO: {activeCircuit.lengthKm} · {activeCircuit.corners} CURVAS</span>
            </div>

          </div>

          {/* Painel Lateral: Traçado FIA 100% Real, Telemetria & Onboard */}
          <div className="lg:col-span-5 bg-[#0D0F15] border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative">
            <div>
              {/* Header do Circuito */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black font-sans text-white">{activeCircuit.name}</span>
                    <span className="text-lg">{activeCircuit.flag}</span>
                  </div>
                  <div className="text-xs text-white/40">{activeCircuit.location} · {activeCircuit.region}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-black/60 border border-white/10" style={{ color: weather?.gripColor || '#FF1717' }}>
                    {weather?.gripStatus || 'DRY TRACK'}
                  </div>
                  <div className="text-[10px] text-white/40 mt-1">
                    {loadingWeather ? 'Carregando satélite...' : `Ar: ${weather?.temperature}°C · Pista: ${weather?.trackTemperature}°C`}
                  </div>
                </div>
              </div>

              {/* Traçado Vetorial Oficial da FIA (Dados de GPS Reais) */}
              <div className="h-44 w-full bg-black/50 rounded-2xl border border-white/10 p-4 flex items-center justify-center relative group">
                <svg
                  viewBox={activeCircuit.svgViewBox}
                  className="w-full h-full max-h-40 stroke-[#FF1717] fill-none filter drop-shadow-[0_0_15px_rgba(255,23,23,0.5)] transition-all duration-700"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={activeCircuit.trackSvgPath} />
                </svg>

                {/* Botão para Assistir Onboard Real */}
                <button
                  type="button"
                  onClick={() => setIsOnboardOpen(true)}
                  className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-black/80 hover:bg-[#FF1717] hover:text-white border border-white/20 hover:border-[#FF1717] text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Play size={13} fill="currentColor" />
                  <span>Onboard Lap 4K</span>
                </button>
              </div>

              {/* Dados de Performance & Recorde */}
              <div className="grid grid-cols-2 gap-3 my-6 text-xs">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">Recorde Oficial</div>
                  <div className="text-base font-black text-[#FF1717] mt-0.5">{activeCircuit.lapRecord}</div>
                  <div className="text-[10px] text-white/50 truncate">{activeCircuit.recordHolder}</div>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">Carro Alocado no Box</div>
                  <div className="text-base font-black text-white mt-0.5 truncate">{activeCircuit.carModel}</div>
                  <div className="text-[10px] text-white/50">{activeCircuit.topSpeed} · {activeCircuit.power}</div>
                </div>
              </div>

            </div>

            {/* Ação: Reservar Bateria neste Hub */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-white/40 uppercase tracking-widest block">Disponibilidade</span>
                <span className="text-xs font-bold text-emerald-400">Box Aberto para Sessão</span>
              </div>

              <a
                href="#circuit-fleet"
                className="px-6 py-3 rounded-xl bg-[#FF1717] text-white font-black text-xs uppercase tracking-wider hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,23,23,0.5)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Ver Carros do Box</span>
                <ChevronRight size={16} />
              </a>
            </div>

          </div>

        </div>

      </div>

      {/* Modal de Onboard Oficial */}
      <OnboardModal
        isOpen={isOnboardOpen}
        onClose={() => setIsOnboardOpen(false)}
        circuit={activeCircuit}
      />
    </section>
  );
}
