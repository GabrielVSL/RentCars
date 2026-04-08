import { useMemo } from 'react';
import { Car } from '@/types';
import { POPULAR_CITIES } from '@/types';

export const MOCK_CARS: Car[] = [
  {
    id: '1',
    brand: 'Fiat',
    model: 'Mobi Like',
    year: 2023,
    category: 'economy',
    transmission: 'manual',
    fuelType: 'gasoline',
    pricePerDay: 89,
    image: '/placeholder-car.jpg',
    features: ['Ar condicionado', 'Direção elétrica', 'Vidros elétricos'],
    rating: 4.8,
    reviewCount: 124,
    location: POPULAR_CITIES[0],
    availability: true,
  },
  {
    id: '2',
    brand: 'Volkswagen',
    model: 'Gol Trend',
    year: 2024,
    category: 'compact',
    transmission: 'manual',
    fuelType: 'gasoline',
    pricePerDay: 109,
    image: '/placeholder-car.jpg',
    features: ['Ar condicionado', 'Som Bluetooth', 'Airbag'],
    rating: 4.7,
    reviewCount: 89,
    location: POPULAR_CITIES[0],
    availability: true,
  },
  {
    id: '3',
    brand: 'Chevrolet',
    model: 'Onix Plus',
    year: 2024,
    category: 'sedan',
    transmission: 'automatic',
    fuelType: 'gasoline',
    pricePerDay: 149,
    image: '/placeholder-car.jpg',
    features: ['Ar condicionado digital', 'Multimídia', 'Câmera de ré'],
    rating: 4.9,
    reviewCount: 203,
    location: POPULAR_CITIES[0],
    availability: true,
  },
  {
    id: '4',
    brand: 'Toyota',
    model: 'Corolla Cross',
    year: 2024,
    category: 'suv',
    transmission: 'automatic',
    fuelType: 'hybrid',
    pricePerDay: 229,
    image: '/placeholder-car.jpg',
    features: ['Hybrid Flex', 'Tet Solar', 'Assistente de faixa'],
    rating: 4.9,
    reviewCount: 167,
    location: POPULAR_CITIES[0],
    availability: true,
  },
  {
    id: '5',
    brand: 'Honda',
    model: 'HR-V',
    year: 2024,
    category: 'suv',
    transmission: 'automatic',
    fuelType: 'gasoline',
    pricePerDay: 199,
    image: '/placeholder-car.jpg',
    features: ['Teto solar', 'Bancos de couro', 'GPS'],
    rating: 4.8,
    reviewCount: 145,
    location: POPULAR_CITIES[1],
    availability: true,
  },
  {
    id: '6',
    brand: 'Jeep',
    model: 'Compass',
    year: 2024,
    category: 'suv',
    transmission: 'automatic',
    fuelType: 'diesel',
    pricePerDay: 289,
    image: '/placeholder-car.jpg',
    features: ['Tração 4x4', 'Bancos de couro', 'DVD'],
    rating: 4.7,
    reviewCount: 98,
    location: POPULAR_CITIES[2],
    availability: false,
  },
];

export const useCarFilter = (cars: Car[], searchParams: any) => {
  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      if (searchParams.location && car.location.id !== searchParams.location.id) {
        return false;
      }
      if (!car.availability) {
        return false;
      }
      return true;
    });
  }, [cars, searchParams]);

  const sortedCars = useMemo(() => {
    return [...filteredCars].sort((a, b) => {
      if (a.availability !== b.availability) {
        return a.availability ? -1 : 1;
      }
      return b.rating - a.rating;
    });
  }, [filteredCars]);

  return sortedCars;
};
