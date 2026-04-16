import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/admin-store';
import { api } from '@/api/client';

interface AuthProfile {
  id: string;
  telegramId: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  role: string;
}

export function useAuth() {
  const { token, user, setUser, setToken, logout } = useAdminStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get<AuthProfile>('/auth/me')
      .then((profile) => {
        setUser(profile);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  return {
    isAuthenticated: !!token,
    user,
    loading,
    login,
    logout,
  };
}
