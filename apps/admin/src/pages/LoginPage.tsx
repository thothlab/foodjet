import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/store/admin-store';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AuthMeResponse {
  id: string;
  telegramId: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  role: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAdminStore();
  const [token, setTokenInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter a token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Set token first so the API client picks it up
      localStorage.setItem('admin_token', token.trim());
      const profile = await api.get<AuthMeResponse>('/auth/me');

      // Verify the user has an admin role
      const adminRoles = ['SUPER_ADMIN', 'STORE_MANAGER', 'STORE_OPERATOR', 'CATALOG_MANAGER'];
      if (!adminRoles.includes(profile.role)) {
        localStorage.removeItem('admin_token');
        setError('Access denied. You do not have admin privileges.');
        return;
      }

      setToken(token.trim());
      setUser(profile);
      navigate('/');
    } catch (err) {
      localStorage.removeItem('admin_token');
      setError(err instanceof Error ? err.message : 'Invalid token or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">FoodJet Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Input
                label="Auth Token"
                type="password"
                value={token}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste your JWT token here"
                error={error || undefined}
              />
              <p className="mt-2 text-xs text-gray-400">
                For development: paste a valid JWT token. In production, use Telegram auth.
              </p>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
