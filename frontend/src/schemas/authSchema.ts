import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export type LoginFormInputs = z.infer<typeof loginSchema>;

const rendimentoSchema = z.object({
  empregadora: z.string().min(2, 'Obrigatório'),
  valor: z.number().min(0.01, 'Inválido'),
});

export const registerSchema = z.object({
  role: z.enum(['CLIENTE', 'EMPRESA', 'BANCO']),
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
  confirmPassword: z.string().min(6, 'Obrigatório'),
  endereco: z.string().min(5, 'Endereço obrigatório'),
  
  // Campos opcionais na base, validados condicionalmente abaixo
  cpf: z.string().optional(),
  rg: z.string().optional(),
  profissao: z.string().optional(),
  rendimentos: z.array(rendimentoSchema).optional(),
  cnpj: z.string().optional(),
})
// Validação 1: Senhas iguais
.refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})
// Validação 2: Se for CLIENTE, exige CPF e RG
.refine((data) => {
  if (data.role === 'CLIENTE') return !!data.cpf && data.cpf.length >= 14;
  return true;
}, { message: "CPF inválido", path: ["cpf"] })
.refine((data) => {
  if (data.role === 'CLIENTE') return !!data.rg && data.rg.length >= 5;
  return true;
}, { message: "RG obrigatório", path: ["rg"] })
// Validação 3: Se for EMPRESA ou BANCO, exige CNPJ
.refine((data) => {
  if (data.role !== 'CLIENTE') return !!data.cnpj && data.cnpj.length >= 18;
  return true;
}, { message: "CNPJ inválido", path: ["cnpj"] });

export type RegisterFormInputs = z.infer<typeof registerSchema>;