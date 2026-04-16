import { create } from 'zustand';
import {
  CourierProfile,
  fetchProfile,
  clearToken,
  hasToken,
  loginWithToken,
} from '../api/client';

interface AuthState {
  profile: CourierProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  /** Try to load profile using stored token. */
  checkAuth: () => Promise<void>;

  /** Login with a dev/api token. */
  login: (token: string) => Promise<void>;

  /** Sign out, clearing token and profile. */
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    if (!hasToken()) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const profile = await fetchProfile();
      set({ profile, isAuthenticated: true, isLoading: false, error: null });
    } catch {
      clearToken();
      set({ profile: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await loginWithToken(token);
      set({ profile, isAuthenticated: true, isLoading: false, error: null });
    } catch (err) {
      clearToken();
      const message =
        err instanceof Error ? err.message : 'Login failed';
      set({
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });
      throw err;
    }
  },

  logout: () => {
    clearToken();
    set({ profile: null, isAuthenticated: false, error: null });
  },
}));
