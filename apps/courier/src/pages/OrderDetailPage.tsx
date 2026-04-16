import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchOrder, transitionOrder, Order } from '../api/client';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { formatPrice } from '../lib/format';

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transition state
  const [confirmAction, setConfirmAction] = useState<{
    transition: string;
    title: string;
    message: string;
  } | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  async function handleTransition() {
    if (!order || !confirmAction) return;
    setTransitioning(true);
    try {
      const updated = await transitionOrder(order.id, confirmAction.transition);
      setOrder(updated);
      setConfirmAction(null);

      // If delivered, go back to list
      if (confirmAction.transition === 'DELIVERED') {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении');
    } finally {
      setTransitioning(false);
    }
  }

  if (loading) {
    return <Loader text="Загрузка заказа..." />;
  }

  if (error && !order) {
    return (
      <div className="px-4 pt-8">
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={loadOrder}
            className="mt-2 text-sm text-red-600 font-medium underline"
          >
            Повторить
          </button>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-slate-600 font-medium"
        >
          &larr; Назад
        </button>
      </div>
    );
  }

  if (!order) return null;

  const isAssigned = order.status === 'ASSIGNED_TO_COURIER';
  const isInDelivery = order.status === 'IN_DELIVERY';

  // Build full address with details
  const addressParts = [order.deliveryAddress];
  if (order.entrance) addressParts.push(`подъезд ${order.entrance}`);
  if (order.floor) addressParts.push(`этаж ${order.floor}`);
  if (order.apartment) addressParts.push(`кв. ${order.apartment}`);
  const fullAddress = addressParts.join(', ');

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-sm font-medium text-slate-600 min-h-[44px]"
      >
        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Назад
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">
          #{order.orderNumber}
        </h2>
        <Badge status={order.status} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Customer info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Клиент
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-slate-900">
            {order.customerName}
          </span>
          <a
            href={`tel:${order.customerPhone}`}
            className="
              inline-flex items-center justify-center
              min-w-[48px] min-h-[48px] rounded-xl
              bg-green-50 text-green-700
              active:bg-green-100 transition-colors
            "
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
        </div>
        <p className="text-sm text-slate-500">{order.customerPhone}</p>
      </div>

      {/* Delivery address */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Адрес доставки
        </h3>
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-base text-slate-900">{fullAddress}</p>
        </div>

        {order.deliveryComment && (
          <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
            <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <p className="text-sm text-slate-600 italic">{order.deliveryComment}</p>
          </div>
        )}
      </div>

      {/* Order items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Состав заказа
        </h3>
        <ul className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <div className="flex-1 min-w-0">
                <span className="text-sm text-slate-900">{item.name}</span>
              </div>
              <div className="flex items-center gap-3 ml-3">
                <span className="text-sm text-slate-500">x{item.quantity}</span>
                <span className="text-sm font-medium text-slate-700 tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Cash collection reminder */}
      <div className="rounded-2xl bg-orange-100 border-2 border-orange-300 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">💰</span>
          <div>
            <p className="text-base font-bold text-orange-900">
              Получить от клиента:
            </p>
            <p className="text-2xl font-extrabold text-orange-900 mt-1">
              {formatPrice(order.total)} наличными
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {isAssigned && (
        <Button
          variant="primary"
          fullWidth
          className="!py-4 text-lg"
          onClick={() =>
            setConfirmAction({
              transition: 'IN_DELIVERY',
              title: 'Начать доставку?',
              message: `Подтвердите, что вы выехали для доставки заказа #${order.orderNumber}.`,
            })
          }
        >
          🚗 Выехал
        </Button>
      )}

      {isInDelivery && (
        <Button
          variant="success"
          fullWidth
          className="!py-4 text-lg"
          onClick={() =>
            setConfirmAction({
              transition: 'DELIVERED',
              title: 'Заказ доставлен?',
              message: `Подтвердите доставку заказа #${order.orderNumber}. Убедитесь, что получили ${formatPrice(order.total)} наличными от клиента.`,
            })
          }
        >
          ✅ Доставлено
        </Button>
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.title ?? ''}
        message={confirmAction?.message ?? ''}
        confirmLabel="Подтвердить"
        confirmVariant={confirmAction?.transition === 'DELIVERED' ? 'success' : 'primary'}
        loading={transitioning}
        onConfirm={handleTransition}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
