import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore, Order } from '../store/app-store';
import { formatPrice, formatDateTime, getStatusLabel, getStatusColor } from '../lib/format';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';

export function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { fetchOrder } = useAppStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!orderId) return;
      try {
        const o = await fetchOrder(orderId);
        setOrder(o);
      } catch {
        // Order may not be found, show basic success
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId, fetchOrder]);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-tg-bg flex flex-col">
      {/* Success animation area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Checkmark */}
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <svg className="w-14 h-14 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-tg-text mb-2">Заказ оформлен!</h1>

        {order && (
          <>
            <p className="text-tg-hint text-center mb-4">
              Заказ #{order.orderNumber} успешно создан
            </p>

            {/* Order Summary Card */}
            <div className="w-full max-w-sm bg-tg-secondary-bg rounded-2xl p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-tg-hint">Статус</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-tg-hint">Товаров</span>
                <span className="text-sm font-medium text-tg-text">{order.itemsCount}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-tg-hint">Итого</span>
                <span className="text-base font-bold text-tg-text">{formatPrice(order.total)}</span>
              </div>
              {order.address && (
                <div className="flex justify-between items-start">
                  <span className="text-sm text-tg-hint">Адрес</span>
                  <span className="text-sm text-tg-text text-right max-w-[60%]">{order.address.street}</span>
                </div>
              )}
            </div>

            {/* Cash reminder */}
            <div className="w-full max-w-sm bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-yellow-800">Подготовьте наличные</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Оплата наличными при получении: {formatPrice(order.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {order.history && order.history.length > 0 && (
              <div className="w-full max-w-sm bg-tg-secondary-bg rounded-2xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-tg-text mb-3">Статус заказа</h3>
                <div className="space-y-3">
                  {order.history.map((entry, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${index === 0 ? 'bg-green-500' : 'bg-tg-hint/30'}`} />
                      <div>
                        <p className="text-sm font-medium text-tg-text">{getStatusLabel(entry.status)}</p>
                        <p className="text-xs text-tg-hint">{formatDateTime(entry.timestamp)}</p>
                        {entry.comment && <p className="text-xs text-tg-hint mt-0.5">{entry.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!order && (
          <p className="text-tg-hint text-center mb-6">Ваш заказ принят и будет обработан в ближайшее время</p>
        )}

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3">
          {order && (
            <Button variant="secondary" fullWidth onClick={() => navigate(`/order/${order.id}`)}>
              Подробности заказа
            </Button>
          )}
          <Button variant="primary" fullWidth onClick={() => navigate('/', { replace: true })}>
            Вернуться в магазин
          </Button>
        </div>
      </div>
    </div>
  );
}
