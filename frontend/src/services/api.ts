import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Cria a instância base apontando para o seu Micronaut
export const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// Interceptor: Antes de qualquer requisição sair, ele faz isso:
api.interceptors.request.use((config) => {
  // Puxa o token direto do Zustand (sem precisar de hooks do React!)
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});