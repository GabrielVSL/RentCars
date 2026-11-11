import { describe, it, expect } from 'vitest';
import { useToastStore, toast } from './useToastStore';

describe('useToastStore', () => {
  it('deve adicionar mensagens de toast com sucesso', () => {
    toast.success('Sucesso no teste');
    const toasts = useToastStore.getState().toasts;
    expect(toasts.length).toBeGreaterThan(0);
    const lastToast = toasts[toasts.length - 1];
    expect(lastToast.message).toBe('Sucesso no teste');
    expect(lastToast.type).toBe('success');
  });

  it('deve remover toast por id', () => {
    toast.error('Erro de teste');
    const toasts = useToastStore.getState().toasts;
    const target = toasts[toasts.length - 1];
    
    useToastStore.getState().removeToast(target.id);
    const updated = useToastStore.getState().toasts;
    expect(updated.find(t => t.id === target.id)).toBeUndefined();
  });
});
