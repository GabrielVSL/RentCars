import { useState, useEffect } from 'react';
import { Automovel, automovelService } from '@/services/automovelService';

export function useAutomoveis() {
  const [automoveis, setAutomoveis] = useState<Automovel[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    try {
      setLoading(true);
      const data = await automovelService.listar();
      setAutomoveis(data);
    } catch (error) {
      console.error("Erro ao carregar veículos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  return { automoveis, loading, refetch: carregar };
}