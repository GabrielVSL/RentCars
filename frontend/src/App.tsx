import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Layout from '@/components/layout/Layout.tsx';
import { SearchHero } from '@/features/booking';
import { CarCard, MOCK_CARS } from '@/features/cars';

function HomePage() {
  return <SearchHero />;
}

function CarsPage() {
  const location = useLocation();
  const searchParams = location.state?.searchParams || null;

  const handleCarSelect = (car: any) => {
    console.log('Car selected:', car);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {searchParams && (
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {searchParams.location?.city || 'Local indefinido'}
              </span>
              <span className="flex items-center gap-2 text-gray-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(searchParams.dateRange?.pickupDate || '').toLocaleDateString('pt-BR')} → {new Date(searchParams.dateRange?.returnDate || '').toLocaleDateString('pt-BR')}
              </span>
              <span className="flex items-center gap-2 text-blue-600 font-medium">
                {searchParams.rentalDays || 1} {searchParams.rentalDays === 1 ? 'dia' : 'dias'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Carros disponíveis</h1>
          <p className="text-sm text-gray-500">{MOCK_CARS.length} veículos encontrados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_CARS.map((car, index) => (
            <CarCard
              key={car.id}
              car={car}
              index={index}
             
              onSelect={handleCarSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600">Página não encontrada</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/cars" element={<CarsPage />} />
        </Route>
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
