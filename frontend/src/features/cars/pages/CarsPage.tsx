'use client';

import { useState, useEffect } from 'react';
import { Loader2, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/services/api';
import { CarsFilter } from '../components/CarsFilter';
import { CarCard } from '../components/CarCard';
import { BookingModal, Automovel } from '../components/BookingModal';
import { CIRCUITS } from '@/services/telemetryService';

export default function CarsPage() {
  const [carros, setCarros] = useState<Automovel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Automovel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterDates, setFilterDates] = useState({ start: '', end: '' });
  const [activeCircuitFilter, setActiveCircuitFilter] = useState<string>('all');

  useEffect(() => {
    const saved = localStorage.getItem('rentcars_search_params');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setFilterDates({ start: p.pickupDate || '', end: p.returnDate || '' });
      } catch {
        // ignore
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
        setCarros(response.data);
      } catch (error) { 
        console.error("Erro ao buscar carros:", error); 
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

  // Filtra carros pelo circuito selecionado
  const filteredCars = carros.filter((car) => {
    if (activeCircuitFilter === 'all') return true;
    const m = (car.modelo + ' ' + car.marca).toLowerCase();
    if (activeCircuitFilter === 'nurburgring') return m.includes('porsche') || m.includes('gt3');
    if (activeCircuitFilter === 'lemans') return m.includes('bmw') || m.includes('m4');
    if (activeCircuitFilter === 'spa') return m.includes('mercedes') || m.includes('amg');
    if (activeCircuitFilter === 'monza') return m.includes('audi') || m.includes('r8');
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08090C]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#FF1717]" size={42} />
          <span className="font-mono text-xs uppercase tracking-widest text-white/50">Carregando Telemetria...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090C] text-white pt-28 pb-32 selection:bg-[#FF1717] selection:text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Filtro de Datas no Topo */}
        <CarsFilter 
          start={filterDates.start} 
          end={filterDates.end} 
          onDateChange={(start, end) => setFilterDates({ start, end })} 
          onClear={() => {
            setFilterDates({ start: '', end: '' });
            localStorage.removeItem('rentcars_search_params');
          }}
        />

        {/* Header Editorial */}
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FF1717] animate-ping" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#FF1717]">
              Homologated Track Fleet
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-sans tracking-tight text-white uppercase leading-none">
            Frota de <span className="text-[#FF1717]">Pista.</span>
          </h1>
          <p className="text-white/60 mt-3 text-base font-light max-w-2xl font-sans">
            Veículos com especificação de competição, telemetria VBOX e pneus de alta aderência prontos para sessões cronometradas nos autódromos oficiais da Europa.
          </p>

          {/* Abas de Filtro por Circuito */}
          <div className="flex flex-wrap gap-2 pt-6 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveCircuitFilter('all')}
              className={`px-4 py-2 rounded-full font-bold transition-all cursor-pointer ${activeCircuitFilter === 'all' ? 'bg-[#FF1717] text-white shadow-[0_0_15px_rgba(255,23,23,0.4)]' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'}`}
            >
              Todos os Circuitos ({carros.length})
            </button>
            {CIRCUITS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCircuitFilter(c.id)}
                className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2 cursor-pointer ${activeCircuitFilter === c.id ? 'bg-[#FF1717] text-white shadow-[0_0_15px_rgba(255,23,23,0.4)]' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'}`}
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Grid de Carros ou Empty State */}
        {filteredCars.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col items-center justify-center py-20 text-center bg-[#0F1117] rounded-3xl border border-white/10 shadow-2xl"
          >
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 text-[#FF1717] border border-white/10">
              <Activity size={36} />
            </div>
            <h3 className="text-2xl font-black font-sans text-white uppercase tracking-tight mb-2">Nenhum Veículo Disponível</h3>
            <p className="text-white/50 text-sm max-w-md mx-auto mb-8 font-mono">
              Todos os carros alocados para este circuito já estão reservados ou na pista para as datas selecionadas.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterDates({ start: '', end: '' });
                setActiveCircuitFilter('all');
                localStorage.removeItem('rentcars_search_params');
              }}
              className="bg-[#FF1717] text-white px-6 py-3 rounded-full font-mono text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all shadow-lg cursor-pointer"
            >
              Redefinir Filtros
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
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

      {/* Modal de Reserva */}
      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        car={selectedCar} 
      />
    </div>
  );
}
