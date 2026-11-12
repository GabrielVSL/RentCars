import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from './authSchema';

describe('authSchema - loginSchema', () => {
  it('deve validar login com credenciais corretas', () => {
    const validData = {
      email: 'usuario@rentcars.com',
      password: 'senhaSegura123',
    };
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('deve reprovar login com e-mail inválido', () => {
    const invalidData = {
      email: 'email-invalido',
      password: 'senhaSegura123',
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues?.[0];
      expect(issue?.message).toBe('E-mail inválido');
    }
  });

  it('deve reprovar login com senha menor que 6 caracteres', () => {
    const invalidData = {
      email: 'usuario@rentcars.com',
      password: '123',
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('authSchema - registerSchema', () => {
  it('deve aprovar registro de cliente com CPF e RG válidos', () => {
    const validClient = {
      role: 'CLIENTE',
      nome: 'Carlos Silva',
      email: 'carlos@gmail.com',
      password: 'senhaForte123',
      confirmPassword: 'senhaForte123',
      endereco: 'Rua Principal, 100',
      cpf: '123.456.789-00',
      rg: 'MG-12.345.678',
    };
    const result = registerSchema.safeParse(validClient);
    expect(result.success).toBe(true);
  });

  it('deve reprovar registro quando confirmação de senha não coincide', () => {
    const invalidData = {
      role: 'CLIENTE',
      nome: 'Carlos Silva',
      email: 'carlos@gmail.com',
      password: 'senhaForte123',
      confirmPassword: 'senhaDiferente456',
      endereco: 'Rua Principal, 100',
      cpf: '123.456.789-00',
      rg: 'MG-12.345.678',
    };
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const match = result.error.issues?.find(e => e.path.includes('confirmPassword'));
      expect(match?.message).toBe('As senhas não coincidem');
    }
  });

  it('deve reprovar registro de cliente sem CPF ou com CPF incompleto', () => {
    const invalidData = {
      role: 'CLIENTE',
      nome: 'Carlos Silva',
      email: 'carlos@gmail.com',
      password: 'senhaForte123',
      confirmPassword: 'senhaForte123',
      endereco: 'Rua Principal, 100',
      cpf: '123',
      rg: 'MG-12.345.678',
    };
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('deve reprovar tentativa de registro com perfil diferente de CLIENTE', () => {
    const empresaAttempt = {
      role: 'EMPRESA',
      nome: 'Locadora Premium Ltda',
      email: 'contato@locadorapremium.com',
      password: 'senhaForte123',
      confirmPassword: 'senhaForte123',
      endereco: 'Av. Paulista, 1000',
      cpf: '123.456.789-00',
      rg: 'MG-12.345.678',
    };
    const result = registerSchema.safeParse(empresaAttempt);
    expect(result.success).toBe(false);
  });

  it('deve reprovar registro sem RG válido', () => {
    const missingRg = {
      role: 'CLIENTE',
      nome: 'Carlos Silva',
      email: 'carlos@gmail.com',
      password: 'senhaForte123',
      confirmPassword: 'senhaForte123',
      endereco: 'Rua Principal, 100',
      cpf: '123.456.789-00',
      rg: '12',
    };
    const result = registerSchema.safeParse(missingRg);
    expect(result.success).toBe(false);
  });
});
