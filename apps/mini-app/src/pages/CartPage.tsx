import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/app-store';
import { useTelegram } from '../hooks/useTelegram';
import { formatPrice, pluralize } from '../lib/format';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { EmptyState } from '../components/ui/EmptyState';

export function CartPage() {
  const navigate = useNavigate();
  const { backButton, hapticFeedback } = useTelegram();
  const { cart, cartLoading, fetchCart, updateQuantity, removeFromCart, clearCart } = useAppStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (backButton) {
      backButton.show();
      const handler = () => navigate(-1);
      backButton.onClick(handler);
      return () => {
        backButton.offClick(handler);
        backButton.hide();
      };
    }
  }, [backButton, navigate]);

  const handleRemoveItem = (itemId: string) => {
    hapticFeedback('impact', 'light');
    removeFromCart(itemId);
  };

  const handleClearCart = () => {
    hapticFeedback('notification', 'warning');
    clearCart();
  };

  if (cartLoading && !cart) {
    return <Loader fullScreen text="Загружаем корзину..." />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-tg-bg">
        <div className="px-4 pt-4 pb-3 border-b border-black/5">
          <h1 className="text-xl font-bold text-tg-text">Корзина</h1>
        </div>
        <EmptyState
          title="Корзина пуста"
          description="Добавьте товары из каталога"
          icon={
            <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.337-1.872l1.695-7.534c.09-.396-.222-.768-.63-.768H5.25M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          }
          action={
            <Button variant="primary" onClick={() => navigate('/')}>
              Перейти в каталог
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tg-secondary-bg">
      {/* Header */}
      <div className="bg-tg-bg px-4 pt-4 pb-3 border-b border-black/5 flex items-center justify-between">
        <h1 className="text-xl font-bold text-tg-text">Корзина</h1>
        <button onClick={handleClearCart} className="text-sm text-red-500">
          Очистить
        </button>
      </div>

      {/* Cart Items */}
      <div className="p-4 space-y-3">
        {cart.items.map((item) => (
          <div key={item.id} className="bg-tg-bg rounded-2xl p-3 flex gap-3 shadow-sm border border-black/5">
            {/* Product Image */}
            <div
              className="w-20 h-20 rounded-xl bg-tg-secondary-bg flex-shrink-0 overflow-hidden cursor-pointer"
              onClick={() => navigate(`/product/${item.productId}`)}
            >
              {item.product.imageUrl ? (
                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-tg-hint/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Item Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className="text-sm font-medium text-tg-text line-clamp-2 cursor-pointer"
                  onClick={() => navigate(`/product/${item.productId}`)}
                >
                  {item.product.name}
                </h3>
                <button onClick={() => handleRemoveItem(item.id)} className="text-tg-hint p-0.5 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-sm font-bold text-tg-text mt-1">{formatPrice(item.product.price * item.quantity)}</p>

              {/* Quantity controls */}
              <div className="flex items-center mt-2">
                <div className="flex items-center bg-tg-secondary-bg rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      if (item.quantity <= 1) {
                        handleRemoveItem(item.id);
                      } else {
                        updateQuantity(item.id, item.quantity - 1);
                      }
                    }}
                    className="px-3 py-1 text-tg-button font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-semibold text-tg-text">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 text-tg-button font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="ml-2 text-xs text-tg-hint">
                  x {formatPrice(item.product.price)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary & Checkout */}
      <div className="sticky bottom-20 bg-tg-bg border-t border-black/5 p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-tg-hint text-sm">
            {pluralize(cart.itemsCount, 'товар', 'товара', 'товаров')}
          </span>
          <span className="text-xl font-bold text-tg-text">{formatPrice(cart.total)}</span>
        </div>
        <Button variant="primary" fullWidth size="lg" onClick={() => navigate('/checkout')}>
          Оформить заказ
        </Button>
      </div>
    </div>
  );
}
