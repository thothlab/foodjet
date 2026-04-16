import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/app-store';
import { useTelegram } from '../hooks/useTelegram';
import { Card } from '../components/ui/Card';
import { Loader } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/ErrorState';
import { CartBadge } from '../components/cart/CartBadge';

export function HomePage() {
  const navigate = useNavigate();
  const { startParam, ready } = useTelegram();
  const { storeInfo, storeLoading, storeError, fetchBootstrap, fetchCart, storeSlug } = useAppStore();

  useEffect(() => {
    ready();
    const slug = startParam || storeSlug || localStorage.getItem('store_slug') || 'default';
    localStorage.setItem('store_slug', slug);
    useAppStore.getState().setStoreSlug(slug);
    fetchBootstrap(slug);
    fetchCart();
  }, [startParam, ready, fetchBootstrap, fetchCart, storeSlug]);

  if (storeLoading) {
    return <Loader fullScreen text="Загружаем магазин..." />;
  }

  if (storeError) {
    return (
      <ErrorState
        message={storeError}
        onRetry={() => {
          const slug = storeSlug || localStorage.getItem('store_slug') || 'default';
          fetchBootstrap(slug);
        }}
      />
    );
  }

  if (!storeInfo) {
    return <Loader fullScreen />;
  }

  if (!storeInfo.isActive) {
    navigate('/closed', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Store Header */}
      <div className="bg-tg-bg px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-tg-text">{storeInfo.name}</h1>
        {storeInfo.description && (
          <p className="text-sm text-tg-hint mt-1">{storeInfo.description}</p>
        )}
      </div>

      {/* Notice Banner */}
      {storeInfo.noticeBanner && (
        <div className="mx-4 mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">{storeInfo.noticeBanner}</p>
        </div>
      )}

      {/* Delivery Info */}
      {storeInfo.deliveryText && (
        <div className="mx-4 mb-3 p-3 bg-tg-bg rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-tg-button flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.109-.498 1.09-1.118a24.457 24.457 0 00-.38-4.034M15 4.75a3 3 0 00-3 3v5.25m3-8.25h1.745c.437 0 .85.193 1.13.53l3.005 3.656c.212.258.341.578.341.912v1.977c0 .623-.504 1.125-1.125 1.125H18.75M15 4.75l-.75 12.25" />
          </svg>
          <p className="text-sm text-tg-text">{storeInfo.deliveryText}</p>
        </div>
      )}

      {/* Cash Payment Notice */}
      <div className="mx-4 mb-4 p-3 bg-tg-bg rounded-xl flex items-start gap-3">
        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
        <p className="text-sm text-tg-text">Оплата наличными при получении</p>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <button
          onClick={() => navigate('/search')}
          className="w-full flex items-center gap-3 px-4 py-3 bg-tg-bg rounded-xl text-tg-hint border border-black/5"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <span className="text-sm">Найти товар...</span>
        </button>
      </div>

      {/* Categories */}
      <div className="px-4 mb-4">
        <h2 className="text-lg font-semibold text-tg-text mb-3">Категории</h2>
        <div className="grid grid-cols-2 gap-3">
          {storeInfo.categories.map((category) => (
            <Card
              key={category.id}
              onClick={() => navigate(`/category/${category.id}`)}
              className="overflow-hidden"
              padding={false}
            >
              {category.imageUrl ? (
                <div className="w-full h-24 bg-tg-secondary-bg">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-full h-24 bg-gradient-to-br from-tg-button/10 to-tg-button/5 flex items-center justify-center">
                  <svg className="w-10 h-10 text-tg-button/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
              )}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-tg-text truncate">{category.name}</h3>
                <p className="text-xs text-tg-hint mt-0.5">
                  {category.productCount} {category.productCount === 1 ? 'товар' : 'товаров'}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Support Footer */}
      {(storeInfo.supportPhone || storeInfo.supportTelegram) && (
        <div className="px-4 pb-6 mt-4">
          <div className="p-4 bg-tg-bg rounded-xl">
            <h3 className="text-sm font-semibold text-tg-text mb-2">Поддержка</h3>
            {storeInfo.supportPhone && (
              <a
                href={`tel:${storeInfo.supportPhone}`}
                className="flex items-center gap-2 text-sm text-tg-link mb-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                {storeInfo.supportPhone}
              </a>
            )}
            {storeInfo.supportTelegram && (
              <a
                href={`https://t.me/${storeInfo.supportTelegram.replace('@', '')}`}
                className="flex items-center gap-2 text-sm text-tg-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
                {storeInfo.supportTelegram}
              </a>
            )}
          </div>
        </div>
      )}

      <CartBadge />
    </div>
  );
}
