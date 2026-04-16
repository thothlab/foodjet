import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/store/admin-store';
import { api } from '@/api/client';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Loader } from '@/components/ui/Loader';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate, formatPrice, statusLabel } from '@/lib/format';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  customer?: {
    firstName: string;
    lastName: string | null;
    phone: string | null;
  };
}

interface OrderListResponse {
  data: Order[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'ASSEMBLING', label: 'Assembling' },
  { value: 'READY_FOR_DELIVERY', label: 'Ready' },
  { value: 'IN_DELIVERY', label: 'In Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function OrderListPage() {
  const navigate = useNavigate();
  const { currentStore } = useAdminStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (currentStore) {
      loadOrders();
    }
  }, [currentStore, page, statusFilter]);

  const loadOrders = async () => {
    if (!currentStore) return;
    setLoading(true);
    try {
      let url = `/stores/${currentStore.id}/orders?page=${page}&pageSize=20`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      const result = await api.get<OrderListResponse>(url);
      setOrders(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'orderNumber',
      header: 'Order #',
      render: (order: Order) => (
        <span className="font-medium text-blue-600">
          #{order.orderNumber || order.id.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (order: Order) => {
        if (order.customer) {
          return `${order.customer.firstName} ${order.customer.lastName || ''}`.trim();
        }
        return order.customerName || '-';
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: Order) => (
        <Badge status={order.status} label={statusLabel(order.status)} />
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total',
      render: (order: Order) => formatPrice(order.totalAmount),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (order: Order) => formatDate(order.createdAt),
    },
  ];

  if (!currentStore) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Orders</h1>
        <p className="text-gray-500">Please select a store first.</p>
      </div>
    );
  }

  if (loading && orders.length === 0) return <Loader />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Table
        columns={columns}
        data={orders as unknown as Record<string, unknown>[]}
        onRowClick={(order) => navigate(`/orders/${(order as unknown as Order).id}`)}
        emptyMessage="No orders found"
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
