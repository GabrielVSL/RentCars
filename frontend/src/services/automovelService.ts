import { api } from './api';

export interface Automovel {
  id: number;
  matricula: string;
  ano: number;
  marca: string;
  modelo: string;
  placa: string;
}

export const automovelService = {
  listar: async (): Promise<Automovel[]> => {
    const response = await api.get('/api/automoveis');
    return response.data;
  }
};