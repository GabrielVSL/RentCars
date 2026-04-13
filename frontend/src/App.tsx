import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout.tsx';
import HomeLayout from '@/components/layout/HomeLayout.tsx';
import PageTransition from '@/components/PageTransition.tsx';

// Importações das Páginas (Centralizadas)
import { SearchHero } from '@/features/booking';
import CarsPage from '@/features/cars/pages/CarsPage.tsx';
import FrotaPage from '@/features/cars/pages/FrotaPage.tsx';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div><h1 className="text-4xl font-bold mb-4">404</h1><p>Página não encontrada</p></div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomeLayout />}>
          <Route index element={<PageTransition><SearchHero /></PageTransition>} />
        </Route>

        {/* Rotas com Header Branco */}
        <Route element={<Layout />}>
          <Route path="/cars" element={<PageTransition><CarsPage /></PageTransition>} />
          <Route path="/frota" element={<PageTransition><FrotaPage /></PageTransition>} />
          {/* Próximas rotas aqui: /meus-alugueis, /analises */}
        </Route>

        <Route path="/*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </Router>
  );
}