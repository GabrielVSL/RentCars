import { z } from 'zod';

export const carSchema = z.object({
  matricula: z.string().min(3, 'Matrícula obrigatória'),
  marca: z.string().min(2, 'Marca obrigatória'),
  modelo: z.string().min(2, 'Modelo obrigatório'),
  ano: z.number().min(1900, 'Ano inválido').max(new Date().getFullYear() + 1, 'Ano inválido'),
  placa: z.string().min(7, 'Placa inválida').max(8, 'Placa inválida'),
});

export type CarFormInputs = z.infer<typeof carSchema>;