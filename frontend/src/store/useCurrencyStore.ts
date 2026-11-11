import { create } from 'zustand';
import { getEurToBrlRate } from '@/services/telemetryService';

export type Currency = 'BRL' | 'EUR';

interface CurrencyStore {
  currency: Currency;
  eurRate: number; // 1 EUR = X BRL
  setCurrency: (currency: Currency) => void;
  formatPrice: (valBrl: number | undefined | null) => string;
  initRate: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyStore>((set, get) => ({
  currency: 'EUR', // Padrão europeu de Motorsport
  eurRate: 6.15,
  setCurrency: (currency) => set({ currency }),
  initRate: async () => {
    try {
      const rate = await getEurToBrlRate();
      set({ eurRate: rate });
    } catch {
      // mantém padrão
    }
  },
  formatPrice: (valBrl) => {
    if (valBrl === undefined || valBrl === null || isNaN(valBrl)) return '—';
    const { currency, eurRate } = get();
    if (currency === 'EUR') {
      const eurVal = valBrl / (eurRate || 6.15);
      return `€ ${eurVal.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `R$ ${valBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },
}));
