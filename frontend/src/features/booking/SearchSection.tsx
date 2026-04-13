'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchForm } from '@/hooks/useSearchForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { Location } from '@/types';
import { AIRPORTS, POPULAR_CITIES } from '@/types';

// ==========================================
// ÍCONES (Ajustados para a paleta clara)
// ==========================================
const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-500">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-500">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-500">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const CarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.9 17 10 16 10s-2.7.9-3.5 1.1c-.8.2-1.5 1-1.5 1.9v3c0 .6.4 1 1 1h2"/><path d="M18 12H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Z"/><path d="M7 16v.01"/><path d="M12 16v.01"/><path d="M17 16v.01"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-blue-500">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

const SuccessIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-emerald-500">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-500">
    <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>
);

// ==========================================
// LÓGICA DE DADOS (100% Preservada)
// ==========================================
const LOCATION_OPTIONS = [
  ...AIRPORTS.map(loc => ({ value: loc.name, label: loc.name, description: `${loc.city}, ${loc.state}`, icon: <MapPinIcon /> })),
  ...POPULAR_CITIES.map(loc => ({ value: loc.name, label: loc.name, description: `${loc.city}, ${loc.state}`, icon: <MapPinIcon /> })),
];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

const buildLocationFromOption = (opt: (typeof LOCATION_OPTIONS)[0] | null | undefined): Location | null => {
  if (!opt) return null;
  const baseName = opt.label;
  const [city, , state] = baseName.split(' - ');
  return { id: '', name: baseName, city: city || baseName, state: state || '', country: 'Brasil' };
};

export default function SearchSection({ onSuccess }: { onSuccess?: () => void }) {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    formData,
    errors,
    isSubmitting,
    isPickupBeforeReturn,
    rentalDays,
    setLocation,
  } = useSearchForm();

  const handleLocationChange = (value: string | null) => {
    setLocation(buildLocationFromOption(LOCATION_OPTIONS.find(opt => opt.value === value) || null));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const params = { pickupLocation: fd.get('pickupLocation'), pickupDate: fd.get('pickupDate'), returnDate: fd.get('returnDate'), pickupTime: fd.get('pickupTime'), returnTime: fd.get('returnTime') };
    
    localStorage.setItem('rentcars_search_params', JSON.stringify(params));
    setShowSuccess(true);
    onSuccess?.();
    
    setTimeout(() => navigate('/cars', { state: { searchParams: params } }), 1000);
  };

  // ==========================================
  // RENDERIZAÇÃO (Nova UI Light Premium)
  // ==========================================
  return (
    <section className="relative overflow-visible w-full">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={containerVariants} className="space-y-6">
          
          {/* Badge Off-White Superior */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-[0.15em] bg-white border border-gray-200 px-5 py-2.5 rounded-full shadow-sm">
              <SparklesIcon />
              <span>Busca Inteligente</span>
            </div>
          </motion.div>

          {/* A Ilha de Vidro Premium */}
          <motion.div variants={itemVariants} className="relative bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-8 md:p-10 border border-white">
            <form onSubmit={onSubmit} className="space-y-6">
              
              {/* Linha 1: Local e Datas */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                <div className="lg:col-span-2">
                  <Select
                    options={LOCATION_OPTIONS}
                    value={formData.pickupLocation}
                    onValueChange={handleLocationChange}
                    placeholder="Selecione a retirada..."
                    searchable
                    error={!!errors.location}
                    className="bg-slate-50 border-gray-200 text-slate-900 placeholder:text-slate-400 rounded-2xl h-14 hover:border-blue-300 focus:border-blue-500 transition-colors"
                  />
                  {errors.location && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertIcon /><span>{errors.location}</span></p>}
                </div>

                <div>
                  <Input
                    type="date"
                    name="pickupDate"
                    value={formData.pickupDate}
                    onChange={() => {}}
                    leftIcon={<CalendarIcon />}
                    error={!!errors.pickupDate}
                    min={new Date().toISOString().split('T')[0]}
                    // Removemos a classe 'color-scheme-dark' para o calendário do navegador ficar claro
                    className="bg-slate-50 border-gray-200 text-slate-900 placeholder:text-slate-400 rounded-2xl h-14 hover:border-blue-300 focus:border-blue-500 transition-colors"
                  />
                  {errors.pickupDate && <p className="mt-1.5 text-xs text-red-500">{errors.pickupDate}</p>}
                </div>

                <div>
                  <Input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={() => {}}
                    leftIcon={<CalendarIcon />}
                    error={!!errors.returnDate}
                    min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                    className="bg-slate-50 border-gray-200 text-slate-900 placeholder:text-slate-400 rounded-2xl h-14 hover:border-blue-300 focus:border-blue-500 transition-colors"
                  />
                  {errors.returnDate && <p className="mt-1.5 text-xs text-red-500">{errors.returnDate}</p>}
                </div>
              </div>

              {/* Linha 2: Horários */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Input
                    type="time"
                    name="pickupTime"
                    value={formData.pickupTime}
                    onChange={() => {}}
                    leftIcon={<ClockIcon />}
                    className="bg-slate-50 border-gray-200 text-slate-900 placeholder:text-slate-400 rounded-2xl h-14 hover:border-blue-300 transition-colors"
                  />
                </div>
                <div>
                  <Input
                    type="time"
                    name="returnTime"
                    value={formData.returnTime}
                    onChange={() => {}}
                    leftIcon={<ClockIcon />}
                    className="bg-slate-50 border-gray-200 text-slate-900 placeholder:text-slate-400 rounded-2xl h-14 hover:border-blue-300 transition-colors"
                  />
                </div>
              </div>

              {/* Indicador de Diárias (Agora suave e elegante) */}
              <div className="flex items-center justify-center pt-2">
                {isPickupBeforeReturn ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-gray-100 px-5 py-2.5 rounded-full font-medium shadow-sm">
                    <CalendarIcon />
                    <span><strong className="text-blue-600">{rentalDays}</strong> diaria{rentalDays !== 1 ? 's' : ''} de aluguel</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-5 py-2.5 rounded-full shadow-sm">
                    <AlertIcon />
                    <span>A data de devolução deve ser posterior à retirada</span>
                  </div>
                )}
              </div>

              {errors.dateRange && (
                <div className="flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                  <AlertIcon />
                  <span>{errors.dateRange}</span>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 border-t border-gray-100/50 mt-4">
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  leftIcon={<SearchIcon />}
                  rightIcon={<CarIcon />}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl py-6 px-10 shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] transition-all transform hover:-translate-y-0.5"
                >
                  Buscar Veículos
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-600 border-gray-200 rounded-2xl py-6 px-8 transition-colors"
                >
                  Limpar
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>

      {/* Toast de Sucesso (Claro e Flutuante) */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-white/95 backdrop-blur-xl border border-emerald-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-full px-6 py-3.5 flex items-center gap-3">
              <SuccessIcon />
              <span className="font-medium text-slate-800">Buscando os melhores veículos...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}