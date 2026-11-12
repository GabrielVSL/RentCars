import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './AuthPage';
import { useAuthStore } from '@/store/useAuthStore';

describe('AuthPage Component', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('deve iniciar na aba Login selecionada com vídeo noturno embutido no palco', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<AuthPage initialMode="login" />} />
        </Routes>
      </MemoryRouter>
    );

    const loginTab = screen.getByRole('tab', { name: /login/i });
    const cadastroTab = screen.getByRole('tab', { name: /cadastro/i });

    expect(loginTab.getAttribute('aria-selected')).toBe('true');
    expect(cadastroTab.getAttribute('aria-selected')).toBe('false');
    expect(screen.getByText('LOGIN')).toBeDefined();
    expect(container.querySelector('video')?.getAttribute('src')).toBe('/auth-night-race.mp4');
  });

  it('deve alternar para Cadastro na Etapa 1 de 3 e avançar etapas mediante validação', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<AuthPage initialMode="login" />} />
        </Routes>
      </MemoryRouter>
    );

    const cadastroTab = screen.getByRole('tab', { name: /cadastro/i });
    fireEvent.click(cadastroTab);

    expect(cadastroTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('CADASTRO')).toBeDefined();
    expect(screen.getByText(/Etapa 1 de 3/)).toBeDefined();
    expect(screen.queryByText('EMPRESA')).toBeNull();

    // Tenta avançar sem preencher campos obrigatórios da Etapa 1
    const nextBtn = await screen.findByRole('button', { name: /próxima etapa/i });
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(screen.getByText('O nome deve ter no mínimo 3 caracteres')).toBeDefined();
    });
    expect(screen.getByText(/Etapa 1 de 3/)).toBeDefined();

    // Preenche Etapa 1 corretamente e avança para Etapa 2
    fireEvent.change(screen.getByPlaceholderText('Seu nome completo'), {
      target: { value: 'Piloto Gabriel' },
    });
    fireEvent.change(screen.getByPlaceholderText('piloto@email.com'), {
      target: { value: 'gabriel@apex.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Rua, número, cidade e estado'), {
      target: { value: 'Av. Interlagos, 1000' },
    });

    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(screen.getByText(/Etapa 2 de 3/)).toBeDefined();
    });
    expect(await screen.findByPlaceholderText('000.000.000-00')).toBeDefined();
  });

  it('deve abrir diretamente na Etapa 1 do Cadastro na rota /cadastro', () => {
    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <Routes>
          <Route path="/cadastro" element={<AuthPage initialMode="register" />} />
        </Routes>
      </MemoryRouter>
    );

    const cadastroTab = screen.getByRole('tab', { name: /cadastro/i });
    expect(cadastroTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText(/Etapa 1 de 3/)).toBeDefined();
  });
});
