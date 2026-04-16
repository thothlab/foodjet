import { useCallback, useEffect, useState } from 'react';
import { fetchOrders, Order } from '../api/client';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';
import { EmptyState } from '../components/ui/EmptyState';
import { formatPrice, formatTime, formatDateTime, shortAddress } from '../lib/format';

export default function DeliveredOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrders();
      const delivered = data
        .filter((o) => o.status === 'DELIVERED')
        .sort((a, b) => {
          const tA = a.deliveredAt ? new Date(a.deliveredAt).getTime() : 0;
          const tB = b.deliveredAt ? new Date(b.deliveredAt).getTime() : 0;
          return tB - tA; // newest first
        });
      setOrders(delivered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Group orders by date
  function groupByDate(items: Order[]): Map<string, Order[]> {
    const groups = new Map<string, Order[]>();
    const today = new Date().toLocaleDateString('ru-RU');

    for (const order of items) {
      const dateStr = order.deliveredAt
        ? new Date(order.deliveredAt).toLocaleDateString('ru-RU')
        : 'Неизвестно';

      const label = dateStr === today ? 'Сегодня' : dateStr;

      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(order);
    }
    return groups;
  }

  if (loading) {
    return <Loader text="Загрузка доставленных заказов..." />;
  }

  const grouped = groupByDate(orders);

  return (
    <div className="pb-4">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-xl font-bold text-slate-900">Доставленные</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {orders.length > 0
            ? `${orders.length} ${orders.length === 1 ? 'заказ' : 'заказов'}`
            : 'Пока нет доставленных заказов'}
        </p>
      </div>

      {error && (
        <div className="mx-4 mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={loadOrders}
            className="mt-1 text-sm text-red-600 font-medium underline"
          >
            Повторить
          </button>
        </div>
      )}

      {orders.length === 0 && !error ? (
        <EmptyState
          icon="✅"
          title="Нет доставленных заказов"
          description="Доставленные заказы будут отображаться здесь"
        />
      ) : (
        <div className="px-4 space-y-5">
          {Array.from(grouped.entries()).map(([dateLabel, dateOrders]) => (
            <div key={dateLabel}>
              <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                {dateLabel}
              </h3>
              <div className="space-y-3">
                {dateOrders.map((order) => (
                  <Card key={order.id}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-base font-bold text-slate-900">
                        #{order.orderNumber}
                      </span>
                      <Badge status={order.status} />
                    </div>

                    <div className="flex items-center text-sm text-slate-600 mb-2">
                      <svg className="w-4 h-4 mr-1.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">
                        {shortAddress(order.deliveryAddress)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900">
                        {formatPrice(order.total)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {order.deliveredAt
                          ? dateLabel === 'Сегодня'
                            ? formatTime(order.deliveredAt)
                            : formatDateTime(order.deliveredAt)
                          : ''}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
