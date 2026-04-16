import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    try {
      await login(trimmed);
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не удалось войти',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo / title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4">
            <span className="text-3xl">🚴</span>
          </div>
          <h1 className="text-2xl font-bold text-white">FoodJet Courier</h1>
          <p className="mt-2 text-sm text-slate-400">
            Войдите для работы с заказами
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Telegram auth placeholder */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-sm text-slate-300 mb-3">
              Авторизация через Telegram
            </p>
            <Button
              type="button"
              variant="primary"
              fullWidth
              className="bg-[#2AABEE] hover:bg-[#229ED9] active:bg-[#1E8FC5]"
              onClick={() => {
                // Telegram WebApp auth would go here
                // For now fall through to dev token
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Войти через Telegram
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500 uppercase">или</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Dev token input */}
          <div>
            <label
              htmlFor="token"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Токен доступа (dev)
            </label>
            <input
              id="token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Введите токен..."
              autoComplete="off"
              className="
                w-full rounded-xl border border-white/10 bg-white/5
                px-4 py-3 text-white placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                text-base
              "
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={!token.trim()}
          >
            Войти
          </Button>
        </form>
      </div>
    </div>
  );
}
