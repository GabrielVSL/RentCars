import { describe, it, expect } from 'vitest';
import { carSchema } from './carSchema';

describe('carSchema', () => {
  it('deve aprovar veículo com dados completos e válidos', () => {
    const validCar = {
      matricula: 'MAT-1234',
      marca: 'Toyota',
      modelo: 'Corolla Altis',
      ano: 2024,
      placa: 'BRA2E19',
      precoPorDia: 250,
    };
    const result = carSchema.safeParse(validCar);
    expect(result.success).toBe(true);
  });

  it('deve reprovar veículo com preço por dia zerado ou negativo', () => {
    const invalidCar = {
      matricula: 'MAT-1234',
      marca: 'Toyota',
      modelo: 'Corolla Altis',
      ano: 2024,
      placa: 'BRA2E19',
      precoPorDia: 0,
    };
    const result = carSchema.safeParse(invalidCar);
    expect(result.success).toBe(false);
  });

  it('deve reprovar veículo com ano muito antigo', () => {
    const invalidCar = {
      matricula: 'MAT-1234',
      marca: 'Ford',
      modelo: 'T',
      ano: 1850,
      placa: 'ABC1234',
      precoPorDia: 100,
    };
    const result = carSchema.safeParse(invalidCar);
    expect(result.success).toBe(false);
  });

  it('deve reprovar placa com tamanho inválido', () => {
    const invalidCar = {
      matricula: 'MAT-1234',
      marca: 'Fiat',
      modelo: 'Pulse',
      ano: 2023,
      placa: 'ABC',
      precoPorDia: 180,
    };
    const result = carSchema.safeParse(invalidCar);
    expect(result.success).toBe(false);
  });
});
