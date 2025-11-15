import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading until we verify auth

  setAuth: (user) => {
    set({ user, isAuthenticated: true, isLoading: false });
  },

  clearAuth: () => {
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  updateUser: (updatedFields) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedFields } : null,
    })),

  setLoading: (loading) => set({ isLoading: loading }),
}));