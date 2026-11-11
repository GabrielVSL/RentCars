'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Circuit } from '@/services/telemetryService';
import { Layers, RotateCcw } from 'lucide-react';

interface WorldMapCanvasProps {
  circuits: Circuit[];
  selectedCircuit: Circuit;
  onSelectCircuit?: (circuit: Circuit) => void;
  filterCategory?: string;
  compact?: boolean;
}

export default function WorldMapCanvas({
  circuits,
  selectedCircuit,
  filterCategory = 'ALL',
  compact = false,
}: WorldMapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tracksLayerRef = useRef<L.LayerGroup | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapMode, setMapMode] = useState<'streets' | 'satellite'>('streets');
  const [gpsData, setGpsData] = useState<Record<string, [number, number][]>>({});
  const [isLoadingMap, setIsLoadingMap] = useState(true);

  // Carrega as coordenadas GPS reais (OpenStreetMap / FIA) das 8 pistas
  useEffect(() => {
    fetch('/circuits-gps.json')
      .then((res) => res.json())
      .then((data: Record<string, [number, number][]>) => {
        setGpsData(data);
      })
      .catch((err) => {
        console.error('Erro ao carregar dados GPS:', err);
      });
  }, []);

  // Pré-carregamento inteligente (pre-fetch) em segundo plano dos blocos da pista anterior e próxima
  const prefetchCircuitTiles = useCallback((circuit: Circuit) => {
    if (!circuit) return;
    // Pré-carrega os zooms 12 e 13 (usados pelo fitBounds dependendo da extensão da pista)
    for (const z of [12, 13]) {
      const x = Math.floor(((circuit.lon + 180) / 360) * Math.pow(2, z));
      const y = Math.floor(
        ((1 - Math.log(Math.tan((circuit.lat * Math.PI) / 180) + 1 / Math.cos((circuit.lat * Math.PI) / 180)) / Math.PI) / 2) *
          Math.pow(2, z)
      );
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          const img = new Image();
          img.src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y + dy}/${x + dx}`;
        }
      }
    }
  }, []);

  // Cria a camada de tiles (World Street Map elegante que o usuário prefere ou Satélite Real)
  const createTileLayer = useCallback((mode: 'streets' | 'satellite') => {
    if (mode === 'satellite') {
      return L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          minZoom: 2,
          keepBuffer: 3,
          updateWhenZooming: false,
          updateWhenIdle: true,
          attribution: '',
        }
      );
    }
    // ESRI World Street Map com o dark mode calibrado (ruas nítidas e continentes em ardósia)
    return L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        minZoom: 2,
        keepBuffer: 3,
        className: 'dark-leaflet-tiles',
        updateWhenZooming: false,
        updateWhenIdle: true,
        attribution: '',
      }
    );
  }, []);

  // Inicializa o Mapa já posicionado DIRETAMENTE na primeira pista
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCenter: [number, number] = [selectedCircuit.lat, selectedCircuit.lon];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13.5,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      worldCopyJump: true,
    });

    const tileLayer = createTileLayer('streets');
    tileLayer.addTo(map);
    currentTileLayerRef.current = tileLayer;

    const tracksLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);

    tracksLayerRef.current = tracksLayer;
    markersLayerRef.current = markersLayer;
    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [createTileLayer]); // eslint-disable-line react-hooks/exhaustive-deps

  // Alterna o tipo de mapa (Ruas vs Satélite) sem recriar o mapa
  const handleToggleMapMode = () => {
    const map = mapRef.current;
    if (!map) return;

    const newMode = mapMode === 'streets' ? 'satellite' : 'streets';
    setMapMode(newMode);

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const newLayer = createTileLayer(newMode);
    newLayer.addTo(map);
    currentTileLayerRef.current = newLayer;
  };

  // Pré-carrega em segundo plano as pistas adjacentes sempre que a pista ativa mudar
  useEffect(() => {
    if (!selectedCircuit || circuits.length === 0) return;
    const currentIndex = circuits.findIndex((c) => c.id === selectedCircuit.id);
    if (currentIndex !== -1) {
      const nextCircuit = circuits[(currentIndex + 1) % circuits.length];
      const prevCircuit = circuits[(currentIndex - 1 + circuits.length) % circuits.length];
      prefetchCircuitTiles(nextCircuit);
      prefetchCircuitTiles(prevCircuit);
    }
  }, [selectedCircuit, circuits, prefetchCircuitTiles]);

  // Renderiza traçados da pista ativa (1 ÚNICO elemento visual por pista, sem redundâncias)
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    const tracksLayer = tracksLayerRef.current;
    if (!map || !markersLayer || !tracksLayer) return;

    markersLayer.clearLayers();
    tracksLayer.clearLayers();

    const trackCoords = gpsData[selectedCircuit.id];

    // Renderiza apenas o traçado real cravado na malha viária
    if (trackCoords && trackCoords.length > 0) {
      // 1. Asfalto / Casing de contraste
      const roadCasing = L.polyline(trackCoords, {
        color: '#08090C',
        weight: 7,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false,
      });

      // 2. Traçado Vermelho Apex de corrida
      const roadLine = L.polyline(trackCoords, {
        color: '#FF1717',
        weight: 3.5,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false,
      });

      // 3. Faixa central tracejada branca
      const centerLine = L.polyline(trackCoords, {
        color: '#FFFFFF',
        weight: 1,
        opacity: 0.5,
        dashArray: '6, 8',
        interactive: false,
      });

      roadCasing.addTo(tracksLayer);
      roadLine.addTo(tracksLayer);
      centerLine.addTo(tracksLayer);
    }
  }, [selectedCircuit, filterCategory, gpsData]);

  // Transição Clean e Sincronizada com os Tiles (Zero Tela Preta Descarregada)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedCircuit) return;

    // 1. Fecha a cortina opaca imediatamente antes de mover a câmera
    setIsLoadingMap(true);

    // Aguarda os dados GPS estarem prontos para posicionar já no enquadramento final
    if (Object.keys(gpsData).length === 0) return;

    let isCancelled = false;
    let minDurationReached = false;
    let tilesLoaded = false;

    const tryRevealMap = () => {
      if (!isCancelled && minDurationReached && tilesLoaded) {
        setIsLoadingMap(false);
      }
    };

    const tileLayer = currentTileLayerRef.current;

    const handleTileLoad = () => {
      tilesLoaded = true;
      tryRevealMap();
    };

    if (tileLayer) {
      tileLayer.once('load', handleTileLoad);
    }

    // 2. Reposiciona o mapa silenciosamente por trás da cortina opaca
    const trackCoords = gpsData[selectedCircuit.id];
    const isDesktop = window.innerWidth >= 1024;

    if (trackCoords && trackCoords.length > 0) {
      const bounds = L.latLngBounds(trackCoords);
      if (compact) {
        map.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 14.5,
          animate: false,
        });
      } else {
        map.fitBounds(bounds, {
          paddingTopLeft: isDesktop ? [80, 90] : [30, 80],
          paddingBottomRight: isDesktop ? [480, 90] : [30, 280],
          maxZoom: 13.5,
          animate: false,
        });
      }
    } else {
      map.setView([selectedCircuit.lat, selectedCircuit.lon], compact ? 14 : 13.5, { animate: false });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 60);

    // Se os tiles já estavam em cache (ex: pre-fetch), marca como carregado
    const checkCached = setTimeout(() => {
      const loadingFlag = tileLayer ? (tileLayer as unknown as { _loading?: boolean })._loading : false;
      if (!loadingFlag) {
        tilesLoaded = true;
        tryRevealMap();
      }
    }, 80);

    // 3. Tempo mínimo elegante (900ms) para transição suave e limpa sem pressa
    const minTimer = setTimeout(() => {
      minDurationReached = true;
      tryRevealMap();
    }, 900);

    // 4. Fallback máximo de segurança (1650ms) caso algum tile demore na rede
    const maxFallbackTimer = setTimeout(() => {
      tilesLoaded = true;
      minDurationReached = true;
      tryRevealMap();
    }, 1650);

    return () => {
      isCancelled = true;
      clearTimeout(checkCached);
      clearTimeout(minTimer);
      clearTimeout(maxFallbackTimer);
      if (tileLayer) {
        tileLayer.off('load', handleTileLoad);
      }
    };
  }, [selectedCircuit, gpsData]);

  // Controles manuais de zoom
  const handleZoomIn = () => {
    mapRef.current?.zoomIn(1);
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut(1);
  };

  // Centraliza novamente o traçado da pista ativa
  const handleRecenter = () => {
    const map = mapRef.current;
    if (!map) return;
    const trackCoords = gpsData[selectedCircuit.id];
    if (trackCoords && trackCoords.length > 0) {
      const bounds = L.latLngBounds(trackCoords);
      map.fitBounds(bounds, {
        padding: compact ? [20, 20] : [80, 80],
        maxZoom: compact ? 14.5 : 13.5,
        animate: true,
      });
    } else {
      map.setView([selectedCircuit.lat, selectedCircuit.lon], compact ? 14 : 13.5, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-full bg-[#08090C] overflow-hidden select-none">
      {/* Container real do Mapa Interativo */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Cortina Clean de Transição — 100% Opaca até o mapa estar carregado, com fade-out suave */}
      <div
        className={`absolute inset-0 z-30 bg-[#08090C] flex items-center justify-center ${
          compact ? 'p-4' : 'lg:pr-[480px]'
        } transition-opacity ease-out ${
          isLoadingMap
            ? 'opacity-100 duration-100 pointer-events-auto'
            : 'opacity-0 duration-500 pointer-events-none'
        }`}
      >
        {compact ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-[#FF1717] animate-spin" />
            <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">
              Carregando Malha...
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3.5 text-center px-6">
            <div className="flex items-center gap-2 text-[11px] font-sans text-white/45 uppercase tracking-[0.22em]">
              <span>{selectedCircuit.flag}</span>
              <span>{selectedCircuit.location} · {selectedCircuit.country}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-normal text-white tracking-tight">
              {selectedCircuit.name}
            </h3>
            {/* Barra de progresso minimalista de 1px */}
            <div className="w-44 h-[1.5px] bg-white/10 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full bg-[#FF1717] transition-all ease-out ${
                  isLoadingMap ? 'w-full duration-[950ms]' : 'w-0 duration-0'
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Vinheta suave para fusão perfeita com a estética do site */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          compact
            ? 'shadow-[inset_0_0_40px_rgba(8,9,12,0.7)]'
            : 'shadow-[inset_0_0_90px_rgba(8,9,12,0.85)]'
        } z-10`}
      />

      {/* Controles discretos no canto do mapa */}
      <div
        className={`absolute ${
          compact ? 'right-3 bottom-3' : 'left-6 bottom-6'
        } z-20 flex items-end gap-1.5`}
      >
        {/* Botão de Reset/Centralizar Traçado */}
        <button
          type="button"
          onClick={handleRecenter}
          className={`${
            compact ? 'w-7 h-7' : 'w-8 h-8'
          } rounded-xl bg-[#08090C]/85 hover:bg-[#08090C] text-white/70 hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer backdrop-blur-md shadow-xl`}
          title="Centralizar traçado da pista"
        >
          <RotateCcw size={compact ? 12 : 14} />
        </button>

        {/* Zoom In/Out Lado a Lado */}
        <div className="flex flex-row items-center gap-0.5 rounded-xl bg-[#08090C]/85 border border-white/10 p-0.5 backdrop-blur-md shadow-xl">
          <button
            type="button"
            onClick={handleZoomIn}
            className={`${
              compact ? 'w-6 h-6 text-sm' : 'w-7 h-7 text-base'
            } rounded-lg hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center font-light transition-colors cursor-pointer`}
            aria-label="Aproximar zoom"
            title="Aproximar"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className={`${
              compact ? 'w-6 h-6 text-sm' : 'w-7 h-7 text-base'
            } rounded-lg hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center font-light transition-colors cursor-pointer`}
            aria-label="Afastar zoom"
            title="Afastar"
          >
            −
          </button>
        </div>

        {/* Alternador de Modo: Ruas vs Satélite */}
        <button
          type="button"
          onClick={handleToggleMapMode}
          className={`${
            compact ? 'px-2.5 h-7 text-[11px]' : 'px-3 h-8 text-xs'
          } rounded-xl bg-[#08090C]/85 hover:bg-[#08090C] text-white/75 hover:text-white border border-white/10 flex items-center gap-1.5 font-sans font-normal transition-colors cursor-pointer backdrop-blur-md shadow-xl`}
          title="Alternar entre modo Ruas e Satélite"
        >
          <Layers size={compact ? 12 : 13} className="text-[#FF1717]" />
          <span>{mapMode === 'streets' ? 'Satélite' : 'Ruas'}</span>
        </button>
      </div>
    </div>
  );
}
