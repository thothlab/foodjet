import { useState, useEffect, useCallback } from 'react';
import { post } from '../api/client';
import { useTelegram } from './useTelegram';

interface AuthUser {
  id: string;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  phone?: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface UseAuthReturn {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const { initData } = useTelegram();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function authenticate() {
      // If we already have a token, try to validate it
      const existingToken = localStorage.getItem('auth_token');
      const existingUser = localStorage.getItem('auth_user');

      if (existingToken && existingUser) {
        try {
          setUser(JSON.parse(existingUser));
          setToken(existingToken);
          setIsLoading(false);
          return;
        } catch {
          // Invalid stored data, re-authenticate
        }
      }

      // If no initData (not in Telegram), skip auth
      if (!initData) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await post<AuthResponse>('/auth/telegram', { initData });
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed';
        setError(message);
        console.error('Auth error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    authenticate();
  }, [initData]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }, []);

  return {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    error,
    logout,
  };
}
