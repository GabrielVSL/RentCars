export interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  airportCode?: string;
}

export interface DateRange {
  pickupDate: Date;
  returnDate: Date;
  pickupTime: string;
  returnTime: string;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: 'economy' | 'compact' | 'sedan' | 'suv' | 'luxury' | 'sports';
  transmission: 'automatic' | 'manual';
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  pricePerDay: number;
  image: string;
  features: string[];
  rating: number;
  reviewCount: number;
  location: Location;
  availability: boolean;
}

export interface SearchParams {
  location: Location | null;
  dateRange: DateRange;
  passengers: number;
}

export interface SearchFormData {
  pickupLocation: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
}

export const AIRPORTS: Location[] = [
  { id: '1', name: 'Aeroporto de Confins (CNF)', city: 'Belo Horizonte', state: 'MG', country: 'Brasil', airportCode: 'CNF' },
  { id: '2', name: 'Aeroporto de Guarulhos (GRU)', city: 'São Paulo', state: 'SP', country: 'Brasil', airportCode: 'GRU' },
  { id: '3', name: 'Aeroporto do Galeão (GIG)', city: 'Rio de Janeiro', state: 'RJ', country: 'Brasil', airportCode: 'GIG' },
  { id: '4', name: 'Aeroporto Internacional de Brasília (BSB)', city: 'Brasília', state: 'DF', country: 'Brasil', airportCode: 'BSB' },
];

export const POPULAR_CITIES: Location[] = [
  { id: '5', name: 'Belo Horizonte - Centro', city: 'Belo Horizonte', state: 'MG', country: 'Brasil' },
  { id: '6', name: 'São Paulo - Pinheiros', city: 'São Paulo', state: 'SP', country: 'Brasil' },
  { id: '7', name: 'Rio de Janeiro - Copacabana', city: 'Rio de Janeiro', state: 'RJ', country: 'Brasil' },
  { id: '8', name: 'Salvador - Centro', city: 'Salvador', state: 'BA', country: 'Brasil' },
];

export const DEFAULT_SEARCH: SearchParams = {
  location: POPULAR_CITIES[0],
  dateRange: {
    pickupDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    returnDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    pickupTime: '10:00',
    returnTime: '10:00',
  },
  passengers: 1,
};
