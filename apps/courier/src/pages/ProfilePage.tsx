import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Профиль</h2>

      {/* Courier info */}
      <Card>
        <div className="flex items-center gap-4">
          {/* Avatar placeholder */}
          <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 truncate">
              {profile?.name ?? 'Курьер'}
            </h3>
            <p className="text-sm text-slate-500 truncate">
              {profile?.phone ?? ''}
            </p>
          </div>
        </div>
      </Card>

      {/* Status */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Статус
            </h4>
            <p className="text-base font-medium text-slate-900 mt-1">
              {profile?.isActive ? 'На линии' : 'Не на линии'}
            </p>
          </div>
          <div
            className={`w-4 h-4 rounded-full ${
              profile?.isActive ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
        </div>
      </Card>

      {/* Store */}
      <Card>
        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Ресторан
        </h4>
        <p className="text-base font-medium text-slate-900 mt-1">
          {profile?.storeName ?? 'Не назначен'}
        </p>
      </Card>

      {/* Support */}
      <Card>
        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Поддержка
        </h4>
        <div className="mt-2 space-y-2">
          <a
            href="tel:+78001234567"
            className="flex items-center gap-2 text-sm text-blue-600 font-medium min-h-[44px]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Позвонить в поддержку
          </a>
          <a
            href="https://t.me/foodjet_support"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 font-medium min-h-[44px]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Написать в Telegram
          </a>
        </div>
      </Card>

      {/* Logout */}
      <div className="pt-4">
        <Button
          variant="danger"
          fullWidth
          onClick={handleLogout}
        >
          Выйти
        </Button>
      </div>

      {/* Version */}
      <p className="text-center text-xs text-slate-400 pt-2">
        FoodJet Courier v0.1.0
      </p>
    </div>
  );
}
