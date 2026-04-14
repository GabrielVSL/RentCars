import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

// Cria a instância base apontando para o seu Micronaut
export const api = axios.create({
  baseURL: 'http://localhost:8080',
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
      
      // Abre o modal de login para ele entrar de novo
      useUIStore.getState().setAuthView('login');
      
      alert("Sua sessão expirou. Por favor, faça login novamente.");
    }
    
    return Promise.reject(error);
  }
);