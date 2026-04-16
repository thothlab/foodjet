import { create } from 'zustand';

export interface Store {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
}

export interface User {
  id: string;
  telegramId: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  role: string;
}

interface AdminState {
  token: string | null;
  user: User | null;
  currentStore: Store | null;
  stores: Store[];

  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setCurrentStore: (store: Store | null) => void;
  setStores: (stores: Store[]) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  token: localStorage.getItem('admin_token'),
  user: null,
  currentStore: (() => {
    try {
      const stored = localStorage.getItem('admin_current_store');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  stores: [],

  setToken: (token) => {
    if (token) {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.removeItem('admin_token');
    }
    set({ token });
  },

  setUser: (user) => set({ user }),

  setCurrentStore: (store) => {
    if (store) {
      localStorage.setItem('admin_current_store', JSON.stringify(store));
    } else {
      localStorage.removeItem('admin_current_store');
    }
    set({ currentStore: store });
  },

  setStores: (stores) => set({ stores }),

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_current_store');
    set({ token: null, user: null, currentStore: null, stores: [] });
  },
}));
