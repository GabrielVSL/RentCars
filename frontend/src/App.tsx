import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout.tsx';
import HomeLayout from '@/components/layout/HomeLayout.tsx';
import PageTransition from '@/components/PageTransition.tsx';
import PedidosPage from '@/features/booking/pages/PedidosPage';
import MeusAlugueisPage from '@/features/booking/pages/MeusAlugueisPage';
import AnalisesPage from '@/features/bank/pages/AnalisesPage';

// O SEGREDO: Importar o AuthModule aqui no arquivo raiz!
import AuthModule from '@/components/auth/AuthModule';

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
      {/* O AuthModule agora é global! Funciona na Home e em qualquer outra rota. */}
      <AuthModule />
      
      <Routes>
        <Route path="/" element={<HomeLayout />}>
          <Route index element={<PageTransition><SearchHero /></PageTransition>} />
        </Route>

        <Route element={<Layout />}>
          <Route path="/cars" element={<PageTransition><CarsPage /></PageTransition>} />
          <Route path="/frota" element={<PageTransition><FrotaPage /></PageTransition>} />
          <Route path="/pedidos" element={<PageTransition><PedidosPage /></PageTransition>} />
          <Route path="/meus-alugueis" element={<PageTransition><MeusAlugueisPage /></PageTransition>} />
          <Route path="/analises" element={<PageTransition><AnalisesPage /></PageTransition>} />
        </Route>

        <Route path="/*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </Router>
  );
}