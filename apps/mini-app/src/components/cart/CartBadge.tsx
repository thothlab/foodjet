import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/app-store';
import { formatPrice } from '../../lib/format';

export function CartBadge() {
  const navigate = useNavigate();
  const cart = useAppStore((s) => s.cart);

  if (!cart || cart.itemsCount === 0) return null;

  return (
    <button
      onClick={() => navigate('/cart')}
      className="fixed bottom-20 left-4 right-4 bg-tg-button text-tg-button-text rounded-2xl p-4 flex items-center justify-between shadow-lg z-40 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-3">
        <span className="bg-white/20 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
          {cart.itemsCount}
        </span>
        <span className="font-semibold">Корзина</span>
      </div>
      <span className="font-bold">{formatPrice(cart.total)}</span>
    </button>
  );
}
