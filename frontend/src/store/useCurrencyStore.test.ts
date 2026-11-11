import { describe, it, expect, beforeEach } from 'vitest';
import { useCurrencyStore } from './useCurrencyStore';

describe('useCurrencyStore', () => {
  beforeEach(() => {
    useCurrencyStore.setState({ currency: 'EUR', eurRate: 6.0 });
  });

  it('formata valor em EUR por padrão sem casas decimais fracionadas', () => {
    const formatted = useCurrencyStore.getState().formatPrice(6000);
    expect(formatted).toBe('€ 1.000');
  });

  it('alterna para BRL e formata com R$ e duas casas decimais', () => {
    useCurrencyStore.getState().setCurrency('BRL');
    const formatted = useCurrencyStore.getState().formatPrice(6000);
    expect(formatted).toBe('R$ 6.000,00');
  });

  it('retorna traço para valores indefinidos ou nulos', () => {
    expect(useCurrencyStore.getState().formatPrice(undefined)).toBe('—');
    expect(useCurrencyStore.getState().formatPrice(null)).toBe('—');
  });
});
