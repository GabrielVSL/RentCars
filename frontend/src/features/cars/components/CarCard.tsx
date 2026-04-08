'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import type { Car } from '@/types';

const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const FuelIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>
    <path d="M15 22V10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2Z"/>
    <path d="M15 6V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2"/>
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 10-8 10s-2-4-2-8a4 4 0 0 1 6-4 4 4 0 0 1 6 0c0 4-2 8-2 8"/>
    <path d="M9 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1"/>
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

interface CarCardProps {
  car: Car;
  onSelect: (car: Car) => void;
  index: number;
}

export function CarCard({ car, onSelect, index }: CarCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const categoryLabels = {
    economy: 'Econômico',
    compact: 'Compacto',
    sedan: 'Sedan',
    suv: 'SUV',
    luxury: 'Luxo',
    sports: 'Esportivo',
  };

  const transmissionLabels = {
    automatic: 'Automático',
    manual: 'Manual',
  };

  const fuelLabels = {
    gasoline: 'Gasolina',
    diesel: 'Diesel',
    electric: 'Elétrico',
    hybrid: 'Híbrido',
  };

  const categoryColors = {
    economy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    compact: 'bg-blue-100 text-blue-700 border-blue-200',
    sedan: 'bg-purple-100 text-purple-700 border-purple-200',
    suv: 'bg-orange-100 text-orange-700 border-orange-200',
    luxury: 'bg-amber-100 text-amber-700 border-amber-200',
    sports: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300"
    >
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <CarIcon className="h-16 w-16 text-gray-300" aria-hidden="true" />
          </div>
        )}

        <img
          src={car.image}
          alt={`${car.brand} ${car.model} ${car.year}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={cn(
            'w-full h-full object-cover transition-all duration-700',
            imageLoaded ? 'opacity-100' : 'opacity-0',
            isHovered && 'scale-105'
          )}
        />

        <div className="absolute top-3 left-3">
          <span
            className={cn(
              'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
              categoryColors[car.category]
            )}
          >
            {categoryLabels[car.category]}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium">
            <StarIcon className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span>{car.rating.toFixed(1)}</span>
            <span className="text-gray-500 font-normal">({car.reviewCount})</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {car.brand} {car.model}
          </h3>
          <p className="text-sm text-gray-500">{car.year}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <SettingsIcon className="h-4 w-4" />
            <span>{transmissionLabels[car.transmission]}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FuelIcon className="h-4 w-4" />
            <span>{fuelLabels[car.fuelType]}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MapPinIcon className="h-4 w-4" />
          <span>{car.location.city}, {car.location.state}</span>
        </div>

        {car.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {car.features.slice(0, 3).map((feature: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                {feature}
              </span>
            ))}
            {car.features.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                +{car.features.length - 3} mais
              </span>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Diária</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {car.pricePerDay.toLocaleString('pt-BR')}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => onSelect(car)}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
            >
              Ver detalhes
            </Button>
          </div>
        </div>
      </div>

      {!car.availability && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="text-white text-center">
            <p className="font-medium text-lg">Indisponível</p>
            <p className="text-sm opacity-75">Para as datas selecionadas</p>
          </div>
        </div>
      )}
    </motion.article>
  );
}
