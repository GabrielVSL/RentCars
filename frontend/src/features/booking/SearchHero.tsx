'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchForm } from '@/hooks/useSearchForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Location, AIRPORTS, POPULAR_CITIES } from '@/types';

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 10-8 10s-2-4-2-8a4 4 0 0 1 6-4 4 4 0 0 1 6 0c0 4-2 8-2 8"/>
    <path d="M9 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1"/>
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4"/>
    <path d="M8 2v4"/>
    <path d="M3 10h18"/>
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>
);

const CarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/>
    <circle cx="16.5" cy="17.5" r="2.5"/>
    <path d="M2 12h12"/>
    <path d="M3 12c0 3.3 3 4 5 4s2-1 2-4-2-4-2-4c-2 0-4 1-4 4 0 5 2 8 2 12"/>
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.3-4.3"/>
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.9 5.3"/>
    <path d="M6.8 8.5 12 3"/>
    <path d="m12 3 1.9 5.3"/>
    <path d="M17.2 8.5 12 3"/>
    <path d="M12 5.8v4.3"/>
    <path d="M12 21v-5.3"/>
    <path d="M6.8 15.5 12 21"/>
    <path d="m12 21 1.9-5.3"/>
    <path d="M17.2 15.5 12 21"/>
    <path d="M12 18.2v-4.3"/>
  </svg>
);

const LOCATION_OPTIONS = [
  ...AIRPORTS.map(loc => ({
    value: loc.id,
    label: loc.name,
    description: `${loc.city}, ${loc.state}${loc.airportCode ? ` • ${loc.airportCode}` : ''}`,
    icon: <MapPinIcon className="h-4 w-4 text-muted-foreground" />,
  })),
  ...POPULAR_CITIES.map(loc => ({
    value: loc.id,
    label: loc.name,
    description: `${loc.city}, ${loc.state}`,
    icon: <MapPinIcon className="h-4 w-4 text-muted-foreground" />,
  })),
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export default function SearchHero() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    formData,
    errors,
    isSubmitting,
    isPickupBeforeReturn,
    rentalDays,
    setLocation,
    handleSubmit,
  } = useSearchForm();

  const handleLocationChange = (value: string) => {
    const location = LOCATION_OPTIONS.find(opt => opt.value === value);
    setLocation(location ? {
      id: location.value,
      name: location.label,
      city: location.description.split(',')[0].trim(),
      state: '',
      country: 'Brasil',
    } : null);
  };

  const onSubmit = (params: any) => {
    localStorage.setItem('rentcars_search_params', JSON.stringify(params));
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/cars', { state: { searchParams: params } });
    }, 1000);
  };

  useEffect(() => {
    console.log('Form state:', formData);
    console.log('Errors:', errors);
  }, [formData, errors]);

  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2070&auto=format&fit=crop')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Encontre seu Carro
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Perfeito
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Compare preços de mais de 1000 veículos em todo o Brasil.
              <span className="text-emerald-400 font-medium"> Preços transparentes • Cancelamento grátis • KM livre</span>
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-emerald-500/20 rounded-3xl blur-2xl" />

            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <SparklesIcon className="h-5 w-5 text-amber-500" aria-hidden="true" />
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Busca Inteligente
                </span>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <label htmlFor="pickup-location" className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-rose-500" />
                        Local de Retirada
                      </span>
                    </label>
                    <Select
                      id="pickup-location"
                      name="pickupLocation"
                      options={LOCATION_OPTIONS}
                      value={formData.pickupLocation}
                      onValueChange={handleLocationChange}
                      placeholder="Digite ou selecione..."
                      searchable
                      error={!!errors.location}
                    />
                    {errors.location && (
                      <p id="location-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-red-500" />
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="pickup-date" className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-blue-500" />
                        Retirada
                      </span>
                    </label>
                    <Input
                      id="pickup-date"
                      name="pickupDate"
                      type="date"
                      value={formData.pickupDate}
                      onChange={() => {}}
                      min={new Date().toISOString().split('T')[0]}
                      error={!!errors.pickupDate}
                      leftIcon={<CalendarIcon className="h-4 w-4" />}
                    />
                  </div>

                  <div>
                    <label htmlFor="return-date" className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-purple-500" />
                        Devolução
                      </span>
                    </label>
                    <Input
                      id="return-date"
                      name="returnDate"
                      type="date"
                      value={formData.returnDate}
                      onChange={() => {}}
                      min={formData.pickupDate}
                      error={!!errors.returnDate}
                      leftIcon={<CalendarIcon className="h-4 w-4" />}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label htmlFor="pickup-time" className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-emerald-500" />
                        Horário
                      </span>
                    </label>
                    <Input
                      id="pickup-time"
                      name="pickupTime"
                      type="time"
                      value={formData.pickupTime}
                      onChange={() => {}}
                      step="900"
                      leftIcon={<ClockIcon className="h-4 w-4" />}
                    />
                  </div>

                  <div>
                    <label htmlFor="return-time" className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-orange-500" />
                        Horário
                      </span>
                    </label>
                    <Input
                      id="return-time"
                      name="returnTime"
                      type="time"
                      value={formData.returnTime}
                      onChange={() => {}}
                      step="900"
                      leftIcon={<ClockIcon className="h-4 w-4" />}
                    />
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="text-sm text-gray-600 mb-3 min-h-[20px]">
                      {!isPickupBeforeReturn && formData.pickupDate && formData.returnDate ? (
                        <span className="text-red-500 font-medium flex items-center gap-1">
                          Ajuste as datas
                        </span>
                      ) : rentalDays > 0 ? (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          {rentalDays} {rentalDays === 1 ? 'dia' : 'dias'}
                        </span>
                      ) : (
                        <span />
                      )}
                    </div>
                  </div>
                </div>

                {errors.dateRange && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2"
                  >
                    {errors.dateRange}
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    isLoading={isSubmitting}
                    leftIcon={<SearchIcon className="h-4 w-4" />}
                    rightIcon={<CarIcon className="h-4 w-4" />}
                    className="flex-1 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg hover:shadow-blue-500/30"
                  >
                    {isSubmitting ? 'Buscando...' : 'Buscar Carros'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => window.location.reload()}
                    className="flex-1"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-100 text-center"
              >
                <p className="font-medium flex items-center justify-center gap-2">
                  <SparklesIcon className="h-4 w-4" />
                  Busca realizada com sucesso! Redirecionando...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="absolute bottom-8 left-4 md:left-12 opacity-20">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-white/20 font-serif text-2xl"
          >
            ✧
          </motion.div>
        </div>
      </div>
    </section>
  );
}
