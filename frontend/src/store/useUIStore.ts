import { create } from 'zustand';

type AuthView = 'login' | 'register' | null;

interface UIState {
  authView: AuthView;
  setAuthView: (view: AuthView) => void;
  closeAuth: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  authView: null,
  setAuthView: (view) => set({ authView: view }),
  closeAuth: () => set({ authView: null }),
}));