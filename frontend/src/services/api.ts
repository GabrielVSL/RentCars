import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Cria a instância base apontando para o seu Micronaut
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

// Interceptor de REQUISIÇÃO: Injeta o token antes de ir pro Java
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor de RESPOSTA: Ouve o que o Java respondeu
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // CORREÇÃO: Só desloga se for 401 E a rota NÃO for a de login!
    const isLoginRoute = error.config?.url?.includes('/login');
    
    if (error.response && error.response.status === 401 && !isLoginRoute) {
      console.warn("Sessão expirada. Deslogando usuário...");
      
      // Limpa os dados do usuário do Zustand
      useAuthStore.getState().logout();
      
      // Redireciona para a página dedicada de login se ainda não estiver nela
      if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/cadastro') {
        window.location.assign('/login');
      }
      

    }
    
    return Promise.reject(error);
  }
);