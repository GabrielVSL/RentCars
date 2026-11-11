'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, CarFront } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/services/api';
import { CarsFilter } from '../components/CarsFilter';
import { CarCard } from '../components/CarCard';
import { BookingModal, Automovel } from '../components/BookingModal';
import { CIRCUITS } from '@/services/telemetryService';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { getCarDisplaySpecs } from '@/lib/carPresentation';

const BRAND_FILTERS = [
  { id: 'all', label: 'Todas as marcas' },
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

export default function CarsPage() {
  const [carros, setCarros] = useState<Automovel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Automovel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterDates, setFilterDates] = useState({ start: '', end: '' });
  const [activeBrandFilter, setActiveBrandFilter] = useState<string>('all');
  const [activeCircuitFilter, setActiveCircuitFilter] = useState<string>('all');

  useEffect(() => {
    const saved = localStorage.getItem('rentcars_search_params');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setFilterDates({ start: p.pickupDate || '', end: p.returnDate || '' });
      } catch {
        // ignore invalid saved params
      }
    }
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      setIsLoading(true);
      try {
        let url = '/api/automoveis';
        if (filterDates.start && filterDates.end) {
          url += `?inicio=${filterDates.start}T00:00:00&fim=${filterDates.end}T23:59:59`;
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
  }, [filterDates.start, filterDates.end]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08090C]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#FF1717]" size={34} />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
            Carregando frota...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090C] text-white pt-28 pb-28 selection:bg-[#FF1717] selection:text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Filtro de Datas */}
        <CarsFilter
          start={filterDates.start}
          end={filterDates.end}
          onDateChange={(start, end) => setFilterDates({ start, end })}
          onClear={() => {
            setFilterDates({ start: '', end: '' });
            localStorage.removeItem('rentcars_search_params');
          }}
        />

        {/* Cabeçalho Editorial Limpo */}
        <header className="mb-12">
          <p className="text-[11px] font-mono font-medium uppercase tracking-[0.22em] text-white/45 mb-2.5">
            Frota Homologada · {carros.length} Veículos
          </p>

          <h1 className="text-3xl sm:text-5xl font-medium font-sans tracking-tight text-white leading-[1.08]">
            Frota de Pista
          </h1>
          <p className="text-white/60 mt-3 text-sm sm:text-base font-normal max-w-2xl">
            Todos os superesportivos disponíveis nos boxes oficiais da plataforma, prontos para reserva ou inspeção completa de ficha técnica.
          </p>

          {/* Filtro por Montadora */}
          <div className="flex flex-wrap gap-2 pt-6">
            {BRAND_FILTERS.map((brand) => {
              const isActive = activeBrandFilter === brand.id;
              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => setActiveBrandFilter(brand.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-white text-[#08090C] border-white'
                      : 'bg-white/[0.03] text-white/65 hover:text-white border-white/10 hover:border-white/25'
                  }`}
                >
                  {brand.label}
                </button>
              );
            })}
          </div>

          {/* Filtro por Circuito */}
          <div className="flex flex-wrap gap-2 pt-3">
            <button
              type="button"
              onClick={() => setActiveCircuitFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                activeCircuitFilter === 'all'
                  ? 'bg-[#FF1717] text-white border-[#FF1717] shadow-md shadow-[#FF1717]/25'
                  : 'bg-white/[0.02] text-white/55 hover:text-white border-white/[0.08] hover:border-white/20'
              }`}
            >
              Todos os circuitos
            </button>
            {CIRCUITS.map((c) => {
              const isActive = activeCircuitFilter === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCircuitFilter(c.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 cursor-pointer border ${
                    isActive
                      ? 'bg-[#FF1717] text-white border-[#FF1717] shadow-md shadow-[#FF1717]/25'
                      : 'bg-white/[0.02] text-white/55 hover:text-white border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <CountryFlag
                    countryCode={CIRCUIT_COUNTRY_CODES[c.id] || 'DE'}
                    className="w-4 h-3 rounded-[2px] shrink-0"
                  />
                  <span>{c.name.replace('Circuit de ', '').replace('Autodromo Nazionale ', '').replace('Autódromo de ', '').replace(' International Racing Course', '').replace(' Circuit', '')}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Grid de Carros ou Empty State */}
        {filteredCars.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center bg-white/[0.02] rounded-2xl border border-white/[0.08]"
          >
            <div className="w-16 h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mb-5 text-[#FF1717] border border-white/10">
              <CarFront size={28} />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              Nenhum veículo encontrado
            </h3>
            <p className="text-white/55 text-sm max-w-md mx-auto mb-7">
              Ajuste o filtro de montadora, circuito ou período para visualizar outros carros disponíveis.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterDates({ start: '', end: '' });
                setActiveBrandFilter('all');
                setActiveCircuitFilter('all');
                localStorage.removeItem('rentcars_search_params');
              }}
              className="bg-[#FF1717] text-white px-6 py-2.5 rounded-full text-xs font-medium hover:bg-[#e01414] transition-all cursor-pointer"
            >
              Redefinir filtros
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
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
