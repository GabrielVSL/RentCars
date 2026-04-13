import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Definimos o que tem no nosso cofre
interface AuthState {
  token: string | null;
  user: { email: string; role: string } | null;
  login: (token: string, email: string, role: string) => void;
  logout: () => void;
}

// 2. Criamos o cofre com a mágica do 'persist' (salva no localStorage)
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      
      // Ação de Logar
      login: (token, email, role) => set({ token, user: { email, role } }),
      
      // Ação de Deslogar
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'rentcars-auth', // Nome da chave que vai ficar no F12 -> Application -> LocalStorage
    }
  )
);