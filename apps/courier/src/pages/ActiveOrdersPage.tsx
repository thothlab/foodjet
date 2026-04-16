import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOrders, Order } from '../api/client';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';
import { EmptyState } from '../components/ui/EmptyState';
import { formatPrice, timeAgo, shortAddress } from '../lib/format';

const ACTIVE_STATUSES = ['ASSIGNED_TO_COURIER', 'IN_DELIVERY'];

export default function ActiveOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pull-to-refresh state
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  const PULL_THRESHOLD = 80;

  const loadOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await fetchOrders();
      const active = data.filter((o) => ACTIVE_STATUSES.includes(o.status));
      // Sort: IN_DELIVERY first, then ASSIGNED, and by assignedAt asc
      active.sort((a, b) => {
        if (a.status === 'IN_DELIVERY' && b.status !== 'IN_DELIVERY') return -1;
        if (b.status === 'IN_DELIVERY' && a.status !== 'IN_DELIVERY') return 1;
        return new Date(a.assignedAt).getTime() - new Date(b.assignedAt).getTime();
      });
      setOrders(active);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => loadOrders(true), 30_000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // Pull-to-refresh handlers
  function handleTouchStart(e: React.TouchEvent) {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!touchStartY.current) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, 120));
    }
  }

  function handleTouchEnd() {
    if (pullDistance >= PULL_THRESHOLD && !refreshing) {
      loadOrders(true);
    }
    setPullDistance(0);
    touchStartY.current = 0;
  }

  if (loading) {
    return <Loader text="Загрузка заказов..." />;
  }

  return (
    <div
      ref={containerRef}
      className="touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center transition-all"
          style={{ height: `${pullDistance}px` }}
        >
          <svg
            className={`w-6 h-6 text-slate-400 transition-transform ${
              pullDistance >= PULL_THRESHOLD ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      )}

      {/* Refreshing bar */}
      {refreshing && (
        <div className="flex items-center justify-center py-2">
          <div className="h-1 w-24 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full w-1/2 bg-slate-500 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      <div className="px-4 pt-4 pb-2">
        <h2 className="text-xl font-bold text-slate-900">Активные заказы</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {orders.length > 0
            ? `${orders.length} ${orders.length === 1 ? 'заказ' : 'заказов'}`
            : 'Нет активных заказов'}
        </p>
      </div>

      {error && (
        <div className="mx-4 mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => loadOrders()}
            className="mt-1 text-sm text-red-600 font-medium underline"
          >
            Повторить
          </button>
        </div>
      )}

      {orders.length === 0 && !error ? (
        <EmptyState
          icon="📦"
          title="Нет активных заказов"
          description="Новые заказы появятся здесь автоматически"
        />
      ) : (
        <div className="px-4 space-y-3 pb-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              onClick={() => navigate(`/order/${order.id}`)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-base font-bold text-slate-900">
                    #{order.orderNumber}
                  </span>
                  <span className="ml-2 text-sm text-slate-500">
                    {order.customerName}
                  </span>
                </div>
                <Badge status={order.status} />
              </div>

              <div className="flex items-center text-sm text-slate-600 mb-2">
                <svg className="w-4 h-4 mr-1.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{shortAddress(order.deliveryAddress)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">
                  {formatPrice(order.total)}
                </span>
                <span className="text-xs text-slate-400">
                  {timeAgo(order.assignedAt)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
