import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../api/client';
import { Loader } from '../components/ui/Loader';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatPrice, formatDate, getStatusLabel, getStatusColor, pluralize } from '../lib/format';

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: { id: string }[];
  createdAt: string;
}

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await get<{ data: OrderSummary[] }>('/orders/my');
        setOrders(res.data ?? res as unknown as OrderSummary[]);
      } catch { /* empty */ }
      setLoading(false);
    })();
  }, []);

  const handleReorder = async (orderId: string) => {
    try {
      await post(`/orders/${orderId}/reorder`, {});
      navigate('/cart');
    } catch { /* empty */ }
  };

  if (loading) return <Loader />;

  if (!orders.length) {
    return <EmptyState title="Нет заказов" description="Вы пока не сделали ни одного заказа" />;
  }

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-bold mb-4">Мои заказы</h1>
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold">#{order.orderNumber}</p>
              <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
            </div>
            <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="text-sm text-gray-600">
              {pluralize(order.items.length, 'товар', 'товара', 'товаров')} · {formatPrice(order.total / 100)}
            </div>
            <div className="flex gap-2">
              {(order.status === 'DELIVERED' || order.status === 'CANCELLED') && (
                <Button size="sm" variant="outline" onClick={() => handleReorder(order.id)}>
                  Повторить
                </Button>
              )}
              <Button size="sm" onClick={() => navigate(`/order/${order.id}`)}>
                Подробнее
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
