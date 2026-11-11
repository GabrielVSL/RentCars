import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '@/store/useAuthStore';

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('deve redirecionar para Home quando usuário não estiver autenticado', () => {
    render(
      <MemoryRouter initialEntries={['/privado']}>
        <Routes>
          <Route path="/" element={<div>Página Inicial Home</div>} />
          <Route
            path="/privado"
            element={
              <ProtectedRoute allowedRoles={['EMPRESA']}>
                <div>Área Exclusiva da Empresa</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Página Inicial Home')).toBeDefined();
    expect(screen.queryByText('Área Exclusiva da Empresa')).toBeNull();
  });

  it('deve redirecionar quando usuário tiver role diferente da permitida', () => {
    useAuthStore.getState().login('jwt-falso', 'cliente@rentcars.com', 'CLIENTE');

    render(
      <MemoryRouter initialEntries={['/frota']}>
        <Routes>
          <Route path="/" element={<div>Página Inicial Home</div>} />
          <Route
            path="/frota"
            element={
              <ProtectedRoute allowedRoles={['EMPRESA']}>
                <div>Painel da Frota</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Página Inicial Home')).toBeDefined();
    expect(screen.queryByText('Painel da Frota')).toBeNull();
  });

  it('deve permitir acesso quando usuário tem a role autorizada', () => {
    useAuthStore.getState().login('jwt-valido', 'locadora@rentcars.com', 'EMPRESA');

    render(
      <MemoryRouter initialEntries={['/frota']}>
        <Routes>
          <Route path="/" element={<div>Página Inicial Home</div>} />
          <Route
            path="/frota"
            element={
              <ProtectedRoute allowedRoles={['EMPRESA']}>
                <div>Painel da Frota Exclusivo</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Painel da Frota Exclusivo')).toBeDefined();
  });
});
