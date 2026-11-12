'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Loader2, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/api';
import { CarsFilter } from '../components/CarsFilter';
import { CarCard } from '../components/CarCard';
import { BookingModal, Automovel } from '../components/BookingModal';
import { CIRCUITS } from '@/services/telemetryService';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { getCarDisplaySpecs } from '@/lib/carPresentation';

const BRAND_FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'porsche', label: 'Porsche' },
  { id: 'bmw', label: 'BMW' },
  { id: 'mercedes', label: 'Mercedes-AMG' },
  { id: 'audi', label: 'Audi' },
];

const CIRCUIT_COUNTRY_CODES: Record<string, string> = {
  nurburgring: 'DE',
  spa: 'BE',
  monza: 'IT',
  monaco: 'MC',
  le_mans: 'FR',
  silverstone: 'GB',
  interlagos: 'BR',
  suzuka: 'JP',
};

const shortCircuitName = (name: string) =>
  name
    .replace('Circuit de la Sarthe ', '')
    .replace('Circuit de ', '')
    .replace('Autodromo Nazionale ', '')
    .replace('Autódromo de ', '')
    .replace(' International Racing Course', '')
    .replace(' Circuit', '');

export default function CarsPage() {
  const [carros, setCarros] = useState<Automovel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Automovel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activeBrandFilter, setActiveBrandFilter] = useState<string>('all');
  const [activeCircuitFilter, setActiveCircuitFilter] = useState<string>('all');
  const [circuitDropdownOpen, setCircuitDropdownOpen] = useState(false);
  const circuitMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (circuitMenuRef.current && !circuitMenuRef.current.contains(e.target as Node)) {
        setCircuitDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      setIsLoading(true);
      try {
        let url = '/api/automoveis';
        if (selectedDate) {
          url += `?inicio=${selectedDate}T08:00:00&fim=${selectedDate}T22:00:00`;
        }
        const response = await api.get(url);
        setCarros(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Erro ao buscar carros:', error);
        setCarros([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCars();
  }, [selectedDate]);

  const handleOpenBooking = (car: Automovel) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const filteredCars = useMemo(() => {
    return carros.filter((car) => {
      if (activeBrandFilter !== 'all') {
        const brandMatch = car.marca.toLowerCase().includes(activeBrandFilter);
        if (!brandMatch) return false;
      }

      if (activeCircuitFilter !== 'all') {
        if (car.circuitosDisponiveis && car.circuitosDisponiveis.length > 0) {
          return car.circuitosDisponiveis.some((c) => c.id === activeCircuitFilter);
        }
        if (car.circuito?.id) {
          return car.circuito.id === activeCircuitFilter;
        }
        const specs = getCarDisplaySpecs(car);
        const circuitObj = CIRCUITS.find((c) => c.id === activeCircuitFilter);
        return circuitObj
          ? circuitObj.name.toLowerCase().includes(specs.circuit.toLowerCase())
          : true;
      }

      return true;
    });
  }, [carros, activeBrandFilter, activeCircuitFilter]);

  const activeCircuitObj = CIRCUITS.find((c) => c.id === activeCircuitFilter);
  const hasAnyFilter =
    activeBrandFilter !== 'all' || activeCircuitFilter !== 'all' || selectedDate !== '';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08090C]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#FF1717]" size={30} />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
            Carregando frota...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090C] text-white pt-28 pb-28 selection:bg-[#FF1717] selection:text-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Cabeçalho Editorial Limpo */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-mono font-medium uppercase tracking-[0.22em] text-white/45 mb-2.5">
                Frota Homologada · {carros.length} Supercarros
              </p>
              <h1 className="text-3xl sm:text-5xl font-medium font-sans tracking-tight text-white leading-[1.08]">
                Frota de Pista
              </h1>
            </div>
            <p className="text-white/55 text-xs sm:text-sm font-normal max-w-md leading-relaxed">
              Combustível 102 octanas, pneus Cup 2 R e telemetria VBOX inclusos por bateria.
              Operação reduzida de terça a quinta e grade completa com sessão noturna de sexta a domingo.
            </p>
          </div>

          {/* Barra Arquitetônica Única de Filtros (sem bloquinhos espalhados) */}
          <div className="mt-10 border-y border-white/10 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Montadoras: Abas sublinhadas */}
            <nav aria-label="Filtrar por montadora" className="flex items-center gap-6 overflow-x-auto pb-1 lg:pb-0">
              {BRAND_FILTERS.map((brand) => {
                const isActive = activeBrandFilter === brand.id;
                return (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => setActiveBrandFilter(brand.id)}
                    className={`relative pb-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      isActive ? 'text-white' : 'text-white/45 hover:text-white/80'
                    }`}
                  >
                    <span>{brand.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="carsBrandUnderline"
                        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                        className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-[#FF1717]"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Direita: Seletor de Autódromo (Dropdown Único) + Data da Sessão */}
            <div className="flex flex-wrap items-center gap-6">
              {/* Seletor Único de Circuito */}
              <div className="relative" ref={circuitMenuRef}>
                <button
                  type="button"
                  onClick={() => setCircuitDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-2 pb-1.5 border-b text-xs font-medium transition-colors cursor-pointer ${
                    activeCircuitFilter !== 'all'
                      ? 'border-[#FF1717] text-white'
                      : 'border-white/15 hover:border-white/40 text-white/75 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                    Autódromo:
                  </span>
                  {activeCircuitObj ? (
                    <span className="flex items-center gap-1.5">
                      <CountryFlag
                        countryCode={CIRCUIT_COUNTRY_CODES[activeCircuitObj.id] || 'DE'}
                        className="w-3.5 h-2.5 rounded-[1px] shrink-0"
                      />
                      <span>{shortCircuitName(activeCircuitObj.name)}</span>
                    </span>
                  ) : (
                    <span>Todos os 8 boxes</span>
                  )}
                  <ChevronDown
                    size={13}
                    className={`text-white/45 transition-transform ${
                      circuitDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {circuitDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.14 }}
                      className="absolute right-0 top-full mt-3 z-50 w-72 bg-[#0B0E14] border border-white/15 rounded-xl py-1.5 shadow-2xl"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCircuitFilter('all');
                          setCircuitDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-white/[0.04] transition-colors cursor-pointer ${
                          activeCircuitFilter === 'all' ? 'text-white font-semibold' : 'text-white/65'
                        }`}
                      >
                        <span>Todos os circuitos (8 boxes)</span>
                        {activeCircuitFilter === 'all' && <Check size={13} className="text-[#FF1717]" />}
                      </button>

                      <div className="my-1 border-t border-white/10" />

                      {CIRCUITS.map((c) => {
                        const selected = activeCircuitFilter === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setActiveCircuitFilter(c.id);
                              setCircuitDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-white/[0.04] transition-colors cursor-pointer ${
                              selected ? 'text-white font-semibold bg-white/[0.03]' : 'text-white/70'
                            }`}
                          >
                            <span className="flex items-center gap-2.5 truncate">
                              <CountryFlag
                                countryCode={CIRCUIT_COUNTRY_CODES[c.id] || 'DE'}
                                className="w-4 h-3 rounded-[2px] shrink-0"
                              />
                              <span className="truncate">{shortCircuitName(c.name)}</span>
                            </span>
                            <span className="text-[10px] font-mono text-white/40 ml-2 shrink-0">
                              {c.lengthKm}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Seletor de Data Única (com regra de manutenção nas segundas) */}
              <CarsFilter
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onClear={() => setSelectedDate('')}
              />

              {hasAnyFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveBrandFilter('all');
                    setActiveCircuitFilter('all');
                    setSelectedDate('');
                  }}
                  className="text-[11px] font-mono uppercase tracking-wider text-[#FF1717] hover:text-white transition-colors cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Grid Editorial 2 Colunas (Padrão FleetCompareSection) */}
        {filteredCars.length === 0 ? (
          <div className="py-20 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FF1717] mb-1.5">
                Sem resultados no box
              </p>
              <h3 className="text-xl font-medium text-white">
                Nenhum supercarro disponível para essa combinação de filtros.
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedDate('');
                setActiveBrandFilter('all');
                setActiveCircuitFilter('all');
              }}
              className="border border-white/20 hover:border-[#FF1717] text-white px-6 py-2.5 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0"
            >
              Redefinir filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-16">
            {filteredCars.map((carro, index) => (
              <CarCard
                key={carro.id}
                carro={carro}
                index={index}
                onSelect={handleOpenBooking}
              />
            ))}
          </div>
        )}
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        car={selectedCar}
      />
    </div>
  );
}
