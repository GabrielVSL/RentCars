import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout.tsx';
import HomeLayout from '@/components/layout/HomeLayout.tsx';
import PageTransition from '@/components/PageTransition.tsx';
import PedidosPage from '@/features/booking/pages/PedidosPage';
import MeusAlugueisPage from '@/features/booking/pages/MeusAlugueisPage';
import AnalisesPage from '@/features/bank/pages/AnalisesPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ToastContainer from '@/components/ui/ToastContainer';

import AuthModule from '@/components/auth/AuthModule';
import CarsPage from '@/features/cars/pages/CarsPage.tsx';
import FrotaPage from '@/features/cars/pages/FrotaPage.tsx';
import PistasPage from '@/features/circuits/pages/PistasPage';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p>Página não encontrada</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthModule />
      <ToastContainer />
      
      <Routes>
        <Route path="/" element={<PageTransition><HomeLayout /></PageTransition>} />

        <Route element={<Layout />}>
          {/* Rota pública de pistas oficiais */}
          <Route path="/pistas" element={<PageTransition><PistasPage /></PageTransition>} />

          {/* Rota pública de catálogo */}
          <Route path="/cars" element={<PageTransition><CarsPage /></PageTransition>} />

          {/* Rota exclusiva para Locadoras/Empresas */}
          <Route
            path="/frota"
            element={
              <ProtectedRoute allowedRoles={['EMPRESA']}>
                <PageTransition><FrotaPage /></PageTransition>
              </ProtectedRoute>
            }
          />

          {/* Gestão de Pedidos para Empresas e Bancos */}
          <Route
            path="/pedidos"
            element={
              <ProtectedRoute allowedRoles={['EMPRESA', 'BANCO']}>
                <PageTransition><PedidosPage /></PageTransition>
              </ProtectedRoute>
            }
          />

          {/* Área exclusiva do Cliente */}
          <Route
            path="/meus-alugueis"
            element={
              <ProtectedRoute allowedRoles={['CLIENTE']}>
                <PageTransition><MeusAlugueisPage /></PageTransition>
              </ProtectedRoute>
            }
          />

          {/* Área de Análise e Auditoria de Crédito do Banco */}
          <Route
            path="/analises"
            element={
              <ProtectedRoute allowedRoles={['BANCO']}>
                <PageTransition><AnalisesPage /></PageTransition>
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </Router>
  );
}
