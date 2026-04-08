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

// Icons
const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-500">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-500">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-500">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const CarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.9 17 10 16 10s-2.7.9-3.5 1.1c-.8.2-1.5 1-1.5 1.9v3c0 .6.4 1 1 1h2"/>
    <path d="M18 12H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Z"/>
    <path d="M7 16v.01"/>
    <path d="M12 16v.01"/>
    <path d="M17 16v.01"/>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

// Location options mapping
const LOCATION_OPTIONS = [
  ...AIRPORTS.map(loc => ({
    value: loc.name,
    label: loc.name,
    description: `${loc.city}, ${loc.state}`,
    icon: <MapPinIcon />,
  })),
  ...POPULAR_CITIES.map(loc => ({
    value: loc.name,
    label: loc.name,
    description: `${loc.city}, ${loc.state}`,
    icon: <MapPinIcon />,
  })),
];

// Frame Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// Helper
const buildLocationFromOption = (opt: (typeof LOCATION_OPTIONS)[0] | null | undefined): Location | null => {
  if (!opt) return null;
  const baseName = opt.label;
  const [city, , state] = baseName.split(' - ');
  return {
    id: '',
    name: baseName,
    city: city || baseName,
    state: state || '',
    country: 'Brasil',
  };
};

interface SearchSectionProps {
  onSuccess?: () => void;
}

// Success Icon
const SuccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-emerald-600">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// Alert Icon
const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" x2="12" y1="8" y2="12"/>
    <line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>
);

// Main Component
export default function SearchSection({ onSuccess }: SearchSectionProps) {
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
    const option = LOCATION_OPTIONS.find(opt => opt.value === value) || null;
    setLocation(buildLocationFromOption(option));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const pickupLocation = fd.get('pickupLocation') as string;
    const pickupDate = fd.get('pickupDate') as string;
    const returnDate = fd.get('returnDate') as string;
    const pickupTime = fd.get('pickupTime') as string;
    const returnTime = fd.get('returnTime') as string;

    const params = {
      pickupLocation,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
    };

    localStorage.setItem('rentcars_search_params', JSON.stringify(params));
    setShowSuccess(true);
    onSuccess?.();

    setTimeout(() => {
      navigate('/cars', { state: { searchParams: params } });
    }, 1000);
  };

  return (
    <section className="relative py-12 md:py-16 lg:py-24 bg-gradient-to-b from-white via-blue-50/30 to-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="space-y-6"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-100 px-4 py-2 rounded-full">
              <SparklesIcon />
              <span>Busca Inteligente</span>
            </div>
          </motion.div>

          {/* Card Container */}
          <motion.div variants={cardVariants} className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/15 via-cyan-400/15 to-emerald-400/15 rounded-3xl blur-2xl" />

            {/* Main card */}
            <div className="relative bg-white backdrop-blur-xl rounded-2xl shadow-lg p-4 md:p-6 lg:p-8 border border-gray-100">
              <form onSubmit={onSubmit} className="space-y-6">
                {/* Location & Dates Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Location Select - lg:col-span-2 */}
                  <div className="lg:col-span-2">
                    <Select
                      
                      options={LOCATION_OPTIONS}
                      value={formData.pickupLocation}
                      onValueChange={handleLocationChange}
                      placeholder="Selecione a retirada..."
                      searchable
                      error={!!errors.location}
                    />
                    {errors.location && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertIcon />
                        <span>{errors.location}</span>
                      </p>
                    )}
                  </div>

                  {/* Pickup Date */}
                  <div>
                    <Input
                      type="date"
                      name="pickupDate"
                      value={formData.pickupDate}
                      onChange={() => {}}
                      placeholder="Data de retirada"
                      leftIcon={<CalendarIcon />}
                      error={!!errors.pickupDate}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.pickupDate && (
                      <p className="mt-1 text-xs text-red-500">{errors.pickupDate}</p>
                    )}
                  </div>

                  {/* Return Date */}
                  <div>
                    <Input
                      type="date"
                      name="returnDate"
                      value={formData.returnDate}
                      onChange={() => {}}
                      placeholder="Data de devolução"
                      leftIcon={<CalendarIcon />}
                      error={!!errors.returnDate}
                      min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                    />
                    {errors.returnDate && (
                      <p className="mt-1 text-xs text-red-500">{errors.returnDate}</p>
                    )}
                  </div>
                </div>

                {/* Time Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pickup Time */}
                  <div>
                    <Input
                      type="time"
                      name="pickupTime"
                      value={formData.pickupTime}
                      onChange={() => {}}
                      placeholder="Horário de retirada"
                      leftIcon={<ClockIcon />}
                    />
                  </div>

                  {/* Return Time */}
                  <div>
                    <Input
                      type="time"
                      name="returnTime"
                      value={formData.returnTime}
                      onChange={() => {}}
                      placeholder="Horário de devolução"
                      leftIcon={<ClockIcon />}
                    />
                  </div>
                </div>

                {/* Rental Days Info */}
                <div className="flex items-center justify-center">
                  {isPickupBeforeReturn ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-full">
                      <CalendarIcon />
                      <span>
                        <strong className="font-semibold text-blue-700">{rentalDays}</strong> diaria{rentalDays !== 1 ? 's' : ''} de aluguel
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-4 py-2 rounded-full">
                      <AlertIcon />
                      <span>A data de devolução deve ser posterior à retirada</span>
                    </div>
                  )}
                </div>

                {/* Date Range Error */}
                {errors.dateRange && (
                  <div className="flex items-center justify-center gap-2 text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">
                    <AlertIcon />
                    <span>{errors.dateRange}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    leftIcon={<SearchIcon />}
                    rightIcon={<CarIcon />}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25"
                  >
                    Buscar Veículos
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="w-full sm:w-auto"
                  >
                    Limpar
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-white/95 backdrop-blur-xl border border-emerald-200 shadow-2xl rounded-full px-6 py-3 flex items-center gap-3">
              <SuccessIcon />
              <span className="font-medium text-gray-800">Buscando os melhores veículos...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
