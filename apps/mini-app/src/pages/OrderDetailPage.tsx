import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore, Order } from '../store/app-store';
import { useTelegram } from '../hooks/useTelegram';
import { formatPrice, formatDateTime, formatDate, getStatusLabel, getStatusColor } from '../lib/format';
import { Loader } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/ErrorState';
import { Badge } from '../components/ui/Badge';

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { backButton } = useTelegram();
  const { fetchOrder, storeInfo } = useAppStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!orderId) return;
      try {
        const o = await fetchOrder(orderId);
        setOrder(o);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId, fetchOrder]);

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

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!order) return <ErrorState message="Заказ не найден" />;

  const statusColors: Record<string, string> = {
    NEW: 'bg-blue-500',
    CONFIRMED: 'bg-indigo-500',
    PICKING: 'bg-yellow-500',
    PICKED: 'bg-orange-500',
    DELIVERING: 'bg-purple-500',
    DELIVERED: 'bg-green-500',
    CANCELLED: 'bg-red-500',
  };

  return (
    <div className="min-h-screen bg-tg-secondary-bg">
      {/* Header */}
      <div className="bg-tg-bg px-4 pt-4 pb-3 border-b border-black/5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-tg-button p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-tg-text">Заказ #{order.orderNumber}</h1>
            <p className="text-xs text-tg-hint">{formatDate(order.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status */}
        <div className="bg-tg-bg rounded-2xl p-4 shadow-sm border border-black/5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-tg-text">Статус</h2>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        {/* Timeline */}
        {order.history && order.history.length > 0 && (
          <div className="bg-tg-bg rounded-2xl p-4 shadow-sm border border-black/5">
            <h2 className="text-base font-semibold text-tg-text mb-4">История</h2>
            <div className="relative">
              {order.history.map((entry, index) => (
                <div key={index} className="flex gap-4 pb-4 last:pb-0">
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${statusColors[entry.status] || 'bg-gray-400'}`} />
                    {index < order.history.length - 1 && (
                      <div className="w-0.5 flex-1 bg-black/10 mt-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 -mt-0.5">
                    <p className="text-sm font-medium text-tg-text">{getStatusLabel(entry.status)}</p>
                    <p className="text-xs text-tg-hint mt-0.5">{formatDateTime(entry.timestamp)}</p>
                    {entry.comment && (
                      <p className="text-xs text-tg-hint mt-1 italic">{entry.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-tg-bg rounded-2xl p-4 shadow-sm border border-black/5">
          <h2 className="text-base font-semibold text-tg-text mb-3">
            Товары ({order.itemsCount})
          </h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-14 h-14 rounded-lg bg-tg-secondary-bg flex-shrink-0 overflow-hidden">
                  {item.productImageUrl ? (
                    <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-tg-hint/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-tg-text truncate">{item.productName}</p>
                  <p className="text-xs text-tg-hint mt-0.5">
                    {item.quantity} x {formatPrice(item.price)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-tg-text flex-shrink-0">
                  {formatPrice(item.total)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-black/5 mt-3 pt-3 flex justify-between items-center">
            <span className="text-base font-semibold text-tg-text">Итого</span>
            <span className="text-lg font-bold text-tg-text">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-tg-bg rounded-2xl p-4 shadow-sm border border-black/5">
          <h2 className="text-base font-semibold text-tg-text mb-3">Доставка</h2>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-tg-hint">Адрес</p>
              <p className="text-sm text-tg-text">{order.address.street}</p>
              {(order.address.entrance || order.address.floor || order.address.apartment) && (
                <p className="text-xs text-tg-hint">
                  {[
                    order.address.entrance && `подъезд ${order.address.entrance}`,
                    order.address.floor && `этаж ${order.address.floor}`,
                    order.address.apartment && `кв. ${order.address.apartment}`,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-tg-hint">Получатель</p>
              <p className="text-sm text-tg-text">{order.contactName}</p>
              <p className="text-sm text-tg-text">{order.contactPhone}</p>
            </div>
            {order.comment && (
              <div>
                <p className="text-xs text-tg-hint">Комментарий</p>
                <p className="text-sm text-tg-text">{order.comment}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-tg-hint">Замена товаров</p>
              <p className="text-sm text-tg-text">
                {order.substitutionPolicy === 'ALLOW' && 'Заменить на аналогичный'}
                {order.substitutionPolicy === 'CONTACT' && 'Связаться со мной'}
                {order.substitutionPolicy === 'DENY' && 'Не заменять'}
              </p>
            </div>
            <div>
              <p className="text-xs text-tg-hint">Оплата</p>
              <p className="text-sm text-tg-text">Наличными при получении</p>
            </div>
          </div>
        </div>

        {/* Support */}
        {(storeInfo?.supportPhone || storeInfo?.supportTelegram) && (
          <div className="bg-tg-bg rounded-2xl p-4 shadow-sm border border-black/5">
            <h2 className="text-base font-semibold text-tg-text mb-2">Нужна помощь?</h2>
            <p className="text-sm text-tg-hint mb-3">Свяжитесь с поддержкой по вопросам заказа</p>
            <div className="space-y-2">
              {storeInfo?.supportPhone && (
                <a href={`tel:${storeInfo.supportPhone}`} className="flex items-center gap-2 text-sm text-tg-link">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {storeInfo.supportPhone}
                </a>
              )}
              {storeInfo?.supportTelegram && (
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

        <div className="h-4" />
      </div>
    </div>
  );
}
