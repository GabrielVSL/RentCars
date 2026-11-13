'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowUpRight, Loader2 } from 'lucide-react';
import { Automovel } from '@/features/cars/components/BookingModal';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getCarDisplaySpecs, resolveStudioCarImage } from '@/lib/carPresentation';

interface FleetCompareSectionProps {
  cars: Automovel[];
  isLoading: boolean;
  focusedBrand: { brand: string; seq: number } | null;
  onSelectCar: (car: Automovel) => void;
}

export function FleetCompareSection({
  cars,
  isLoading,
  focusedBrand,
  onSelectCar,
}: FleetCompareSectionProps) {
  const { formatPrice } = useCurrencyStore();
  const { user } = useAuthStore();
  const isStaff = Boolean(user && user.role !== 'CLIENTE');
  const staffTarget = user?.role === 'BANCO' ? '/analises' : '/frota';
  const [startIndex, setStartIndex] = useState(0);

  // Quando o usuário clica em uma marca na faixa superior, posiciona o veículo correspondente no slot principal
  useEffect(() => {
    if (!focusedBrand || cars.length === 0) return;
    const token = focusedBrand.brand.toLowerCase().split(' ')[0];
    const matchIdx = cars.findIndex((c) =>
      `${c.marca} ${c.modelo}`.toLowerCase().includes(token)
    );
    if (matchIdx >= 0) {
      setStartIndex(matchIdx);
    }
  }, [focusedBrand, cars]);

  const visibleCars = useMemo(() => {
    if (cars.length === 0) return [];
    if (cars.length === 1) return [cars[0]];
    const first = cars[startIndex % cars.length];
    const second = cars[(startIndex + 1) % cars.length];
    return [first, second];
  }, [cars, startIndex]);

  const handlePrev = () => {
    if (cars.length <= 1) return;
    setStartIndex((prev) => (prev - 1 + cars.length) % cars.length);
  };

  const handleNext = () => {
    if (cars.length <= 1) return;
    setStartIndex((prev) => (prev + 1) % cars.length);
  };

  return (
    <section
      id="fleet-compare"
      className="relative py-24 sm:py-32 px-6 bg-[#08090C] text-white overflow-hidden select-none"
    >
      {/* Luz ambiente sutil de estúdio */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[780px] h-[420px] bg-[radial-gradient(ellipse,rgba(255,255,255,0.04)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Cabeçalho centralizado limpo */}
        <div className="text-center mb-14 sm:mb-20">
          <p className="text-[11px] font-mono font-medium tracking-[0.22em] text-white/45 uppercase mb-2.5">
            Frota Disponível
          </p>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-white font-sans">
            Compare os Modelos. Sinta a Pista.
          </h2>
          <p className="text-sm sm:text-base text-white/60 font-normal mt-3 max-w-xl mx-auto">
            Analise desempenho, preparação de circuito e valores lado a lado antes de garantir seu horário no box.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/50">
            <Loader2 className="animate-spin text-[#FF1717]" size={28} />
            <span className="text-xs font-mono uppercase tracking-widest">Carregando frota...</span>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-white/[0.08] bg-white/[0.02] max-w-lg mx-auto px-6">
            <p className="text-sm text-white/70 mb-5">
              Nenhum veículo disponível retornado pela API no momento.
            </p>
            <Link
              to="/cars"
              className="inline-flex items-center gap-2 text-xs font-medium text-white bg-white/10 hover:bg-white/15 px-5 py-2.5 rounded-full transition-colors"
            >
              <span>Abrir catálogo</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="relative">
            {/* Setas laterais de navegação */}
            {cars.length > 2 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="hidden lg:flex absolute -left-6 top-[44%] -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-white/10 bg-[#08090C]/90 hover:bg-white/10 hover:border-white/25 text-white/60 hover:text-white items-center justify-center transition-all cursor-pointer"
                  aria-label="Modelo anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="hidden lg:flex absolute -right-6 top-[44%] -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-white/10 bg-[#08090C]/90 hover:bg-white/10 hover:border-white/25 text-white/60 hover:text-white items-center justify-center transition-all cursor-pointer"
                  aria-label="Próximo modelo"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Grid comparativo lado a lado (2 carros) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={startIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={`grid gap-12 lg:gap-16 ${
                  visibleCars.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2'
                }`}
              >
                {visibleCars.map((car) => {
                  const specs = getCarDisplaySpecs(car);
                  const imageSrc = resolveStudioCarImage(car);
                  const isHighlighted =
                    focusedBrand &&
                    `${car.marca} ${car.modelo}`
                      .toLowerCase()
                      .includes(focusedBrand.brand.toLowerCase().split(' ')[0]);

                  return (
                    <div key={car.id} className="flex flex-col group">
                      {/* Nome do modelo no topo esquerdo (estilo Print 1) */}
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <Link
                          to={`/cars/${car.id}`}
                          className="text-lg sm:text-xl font-medium tracking-tight text-white hover:text-[#FF1717] transition-colors"
                        >
                          {car.marca} {car.modelo}
                        </Link>
                        <span
                          className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                            isHighlighted
                              ? 'border-[#FF1717]/60 text-[#FF1717] bg-[#FF1717]/10'
                              : 'border-white/10 text-white/50 bg-white/[0.02]'
                          }`}
                        >
                          {specs.category}
                        </span>
                      </div>

                      {/* Palco da imagem sem fundo + sombra de estúdio no chão */}
                      <Link
                        to={`/cars/${car.id}`}
                        className="relative h-52 sm:h-60 w-full flex items-center justify-center my-4 cursor-pointer"
                        aria-label={`Ver detalhes de ${car.marca} ${car.modelo}`}
                      >
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[78%] h-8 rounded-full bg-black/80 blur-xl pointer-events-none" />
                        <div className="absolute inset-x-12 top-8 bottom-8 rounded-full bg-[radial-gradient(ellipse,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />
                        <img
                          src={imageSrc}
                          alt={`${car.marca} ${car.modelo}`}
                          className="relative z-10 w-full h-full object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.85)] group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      </Link>

                      {/* Grade de especificações (estilo Print 1 com linhas ultrafinas) */}
                      <div className="mt-2">
                        {/* Linha 1: 3 rótulos técnicos */}
                        <div className="grid grid-cols-3 gap-4 pb-4 border-b border-white/10">
                          <div>
                            <div className="text-[11px] font-medium text-white/50 mb-1">Categoria</div>
                            <div className="text-xs sm:text-sm text-white/90 font-normal truncate">{specs.category} Track</div>
                          </div>
                          <div>
                            <div className="text-[11px] font-medium text-white/50 mb-1">Potência</div>
                            <div className="text-xs sm:text-sm text-white/90 font-normal">{specs.power}</div>
                          </div>
                          <div>
                            <div className="text-[11px] font-medium text-white/50 mb-1">Circuito Base</div>
                            <div className="text-xs sm:text-sm text-white/90 font-normal truncate">{specs.circuit}</div>
                          </div>
                        </div>

                        {/* Linha 2: 3 métricas principais em destaque */}
                        <div className="grid grid-cols-3 gap-4 py-4 border-b border-white/10 items-baseline">
                          <div className="text-lg sm:text-xl font-medium tracking-tight text-white tabular-nums">
                            {specs.topSpeed.replace(/ km\/h/i, '')}
                            <span className="text-[11px] text-white/50 font-normal ml-1">km/h</span>
                          </div>
                          <div className="text-lg sm:text-xl font-medium tracking-tight text-white tabular-nums">
                            {specs.accel.replace(/s$/i, '')}
                            <span className="text-[11px] text-white/50 font-normal ml-1">s (0–100)</span>
                          </div>
                          <div className="text-lg sm:text-xl font-medium tracking-tight text-white tabular-nums">
                            {car.ano}
                            <span className="text-[11px] text-white/50 font-normal ml-1">spec</span>
                          </div>
                        </div>

                        {/* Linha 3: Preço e Status */}
                        <div className="py-4 space-y-1.5 text-xs sm:text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-white/55">Sessão Track Experience</span>
                            <span className="text-white font-medium tabular-nums">
                              {formatPrice(car.precoPorDia)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/55">Disponibilidade</span>
                            <span className="text-white/85 font-normal">Pronto no box</span>
                          </div>
                        </div>

                        {/* Ações centralizadas */}
                        <div className="pt-4 flex items-center justify-center gap-3">
                          <Link
                            to={`/cars/${car.id}`}
                            className="border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 text-white/85 hover:text-white text-xs sm:text-sm font-medium px-6 py-2.5 rounded-full transition-all duration-200"
                          >
                            Ver Detalhes
                          </Link>
                          {isStaff ? (
                            <Link
                              to={staffTarget}
                              className="bg-white/10 text-white hover:bg-[#FF1717] border border-white/15 hover:border-[#FF1717] text-xs sm:text-sm font-medium px-8 py-2.5 rounded-full transition-all duration-200 shadow-sm active:scale-[0.98]"
                            >
                              {user?.role === 'BANCO' ? 'Painel de Auditoria' : 'Gerenciar nos Boxes'}
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onSelectCar(car)}
                              className="bg-[#F3F4F6] text-[#08090C] hover:bg-[#FF1717] hover:text-white text-xs sm:text-sm font-medium px-8 py-2.5 rounded-full transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.98]"
                            >
                              Reservar Sessão
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Controles móveis + indicadores e link para catálogo completo */}
            <div className="mt-12 flex flex-col items-center gap-5">
              {cars.length > 2 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="lg:hidden w-9 h-9 rounded-full border border-white/10 bg-white/[0.03] text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-2">
                    {cars.map((car, idx) => (
                      <button
                        key={car.id}
                        type="button"
                        onClick={() => setStartIndex(idx)}
                        aria-label={`Mostrar ${car.marca} ${car.modelo}`}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === startIndex % cars.length
                            ? 'w-6 bg-[#FF1717]'
                            : 'w-1.5 bg-white/20 hover:bg-white/40'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="lg:hidden w-9 h-9 rounded-full border border-white/10 bg-white/[0.03] text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
                    aria-label="Próximo"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              <Link
                to="/cars"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-white/55 hover:text-white transition-colors"
              >
                <span>Ver todos os veículos ({cars.length})</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
