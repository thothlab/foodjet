import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/store/admin-store';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { formatDate, formatPrice, statusLabel } from '@/lib/format';

interface OrderItem {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  substitutionStatus: string | null;
  substitutionNote: string | null;
}

interface StatusTransition {
  fromStatus: string;
  toStatus: string;
  createdAt: string;
  actorType: string;
  note: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  deliveryAddress: string | null;
  courierId: string | null;
  items: OrderItem[];
  customer?: {
    firstName: string;
    lastName: string | null;
    phone: string | null;
  };
  statusHistory?: StatusTransition[];
}

interface Courier {
  id: string;
  userId: string;
  status: string;
  user: {
    firstName: string;
    lastName: string | null;
    username: string | null;
  };
}

interface OrderResponse {
  data: Order;
}

interface CouriersResponse {
  data: Courier[];
}

const STATUS_FLOW: Record<string, string[]> = {
  PENDING: ['CONFIRMED'],
  CONFIRMED: ['ASSEMBLING'],
  ASSEMBLING: ['READY_FOR_DELIVERY'],
  READY_FOR_DELIVERY: ['IN_DELIVERY'],
  IN_DELIVERY: ['DELIVERED'],
};

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { currentStore } = useAdminStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Courier assignment
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState('');
  const [couriersLoading, setCouriersLoading] = useState(false);

  // Substitution modal
  const [subItem, setSubItem] = useState<OrderItem | null>(null);
  const [subAction, setSubAction] = useState<'REMOVE' | 'SUBSTITUTE'>('REMOVE');
  const [subNote, setSubNote] = useState('');

  useEffect(() => {
    if (currentStore && orderId) {
      loadOrder();
    }
  }, [currentStore, orderId]);

  const loadOrder = async () => {
    if (!currentStore || !orderId) return;
    setLoading(true);
    try {
      const result = await api.get<OrderResponse>(`/stores/${currentStore.id}/orders/${orderId}`);
      setOrder(result.data);
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = async (toStatus: string) => {
    if (!currentStore || !orderId) return;
    setActionLoading(true);
    try {
      await api.post(`/stores/${currentStore.id}/orders/${orderId}/transition`, { toStatus });
      loadOrder();
    } catch (err) {
      console.error('Failed to transition:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!currentStore || !orderId) return;
    setActionLoading(true);
    try {
      await api.post(`/stores/${currentStore.id}/orders/${orderId}/transition`, {
        toStatus: 'CANCELLED',
        note: cancelReason,
      });
      setShowCancelModal(false);
      setCancelReason('');
      loadOrder();
    } catch (err) {
      console.error('Failed to cancel:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const openCourierModal = async () => {
    if (!currentStore) return;
    setCouriersLoading(true);
    setShowCourierModal(true);
    try {
      const result = await api.get<CouriersResponse>(`/stores/${currentStore.id}/couriers/active`);
      setCouriers(result.data);
    } catch (err) {
      console.error('Failed to load couriers:', err);
    } finally {
      setCouriersLoading(false);
    }
  };

  const handleAssignCourier = async () => {
    if (!currentStore || !orderId || !selectedCourierId) return;
    setActionLoading(true);
    try {
      await api.post(`/stores/${currentStore.id}/orders/${orderId}/assign-courier`, {
        courierId: selectedCourierId,
      });
      setShowCourierModal(false);
      setSelectedCourierId('');
      loadOrder();
    } catch (err) {
      console.error('Failed to assign courier:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubstitution = async () => {
    if (!currentStore || !orderId || !subItem) return;
    setActionLoading(true);
    try {
      await api.post(
        `/stores/${currentStore.id}/orders/${orderId}/items/${subItem.id}/substitution`,
        { action: subAction, note: subNote || null },
      );
      setSubItem(null);
      setSubNote('');
      loadOrder();
    } catch (err) {
      console.error('Failed to handle substitution:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (!currentStore) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Detail</h1>
        <p className="text-gray-500">Please select a store first.</p>
      </div>
    );
  }

  if (loading) return <Loader />;
  if (!order) return <p className="text-gray-500">Order not found.</p>;

  const nextStatuses = STATUS_FLOW[order.status] || [];
  const canCancel = !['DELIVERED', 'CANCELLED'].includes(order.status);
  const canAssignCourier = order.status === 'READY_FOR_DELIVERY' || order.status === 'ASSEMBLING';

  return (
    <div>
      {/* Back button + header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Orders
        </button>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order.orderNumber || order.id.slice(0, 8)}
          </h1>
          <Badge status={order.status} label={statusLabel(order.status)} />
        </div>
        <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Product</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3">Price</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3">Qty</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3">Total</th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase pb-3">Substitution</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 text-sm text-gray-900">{item.productName}</td>
                      <td className="py-3 text-sm text-gray-600 text-right">{formatPrice(item.price)}</td>
                      <td className="py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                      <td className="py-3 text-sm text-gray-900 font-medium text-right">
                        {formatPrice(item.totalPrice)}
                      </td>
                      <td className="py-3 text-center">
                        {item.substitutionStatus ? (
                          <Badge status={item.substitutionStatus} label={item.substitutionStatus} />
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {order.status === 'ASSEMBLING' && !item.substitutionStatus && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSubItem(item);
                              setSubAction('REMOVE');
                              setSubNote('');
                            }}
                          >
                            Substitute
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <td colSpan={3} className="py-3 text-sm font-semibold text-gray-900 text-right">
                      Total:
                    </td>
                    <td className="py-3 text-sm font-bold text-gray-900 text-right">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Status timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h2>
              <div className="space-y-3">
                {order.statusHistory.map((transition, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{statusLabel(transition.fromStatus)}</span>
                        {' -> '}
                        <span className="font-medium">{statusLabel(transition.toStatus)}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transition.createdAt)} by {transition.actorType}
                      </p>
                      {transition.note && (
                        <p className="text-xs text-gray-600 mt-0.5">Note: {transition.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer</h3>
            {order.customer ? (
              <div className="space-y-2 text-sm">
                <p className="text-gray-900">
                  {order.customer.firstName} {order.customer.lastName || ''}
                </p>
                {order.customer.phone && (
                  <p className="text-gray-600">{order.customer.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No customer info</p>
            )}
          </div>

          {/* Delivery address */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Delivery Address</h3>
            <p className="text-sm text-gray-600">
              {order.deliveryAddress || 'No address specified'}
            </p>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions</h3>
            <div className="space-y-2">
              {nextStatuses.map((toStatus) => (
                <Button
                  key={toStatus}
                  className="w-full"
                  onClick={() => handleTransition(toStatus)}
                  loading={actionLoading}
                >
                  {toStatus === 'CONFIRMED' && 'Confirm Order'}
                  {toStatus === 'ASSEMBLING' && 'Start Assembling'}
                  {toStatus === 'READY_FOR_DELIVERY' && 'Mark Ready for Delivery'}
                  {toStatus === 'IN_DELIVERY' && 'Mark In Delivery'}
                  {toStatus === 'DELIVERED' && 'Mark Delivered'}
                </Button>
              ))}

              {canAssignCourier && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={openCourierModal}
                >
                  {order.courierId ? 'Reassign Courier' : 'Assign Courier'}
                </Button>
              )}

              {canCancel && (
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal open={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Order">
        <div className="space-y-4">
          <Input
            label="Reason for cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter reason..."
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
              Back
            </Button>
            <Button variant="danger" onClick={handleCancel} loading={actionLoading}>
              Cancel Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Courier Modal */}
      <Modal
        open={showCourierModal}
        onClose={() => setShowCourierModal(false)}
        title="Assign Courier"
      >
        <div className="space-y-4">
          {couriersLoading ? (
            <Loader />
          ) : (
            <Select
              label="Select Courier"
              value={selectedCourierId}
              onChange={(e) => setSelectedCourierId(e.target.value)}
              options={couriers.map((c) => ({
                value: c.id,
                label: `${c.user.firstName} ${c.user.lastName || ''} ${c.user.username ? `(@${c.user.username})` : ''}`.trim(),
              }))}
              placeholder="Choose a courier..."
            />
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCourierModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignCourier}
              loading={actionLoading}
              disabled={!selectedCourierId}
            >
              Assign
            </Button>
          </div>
        </div>
      </Modal>

      {/* Substitution Modal */}
      <Modal
        open={!!subItem}
        onClose={() => setSubItem(null)}
        title={`Substitute: ${subItem?.productName || ''}`}
      >
        <div className="space-y-4">
          <Select
            label="Action"
            value={subAction}
            onChange={(e) => setSubAction(e.target.value as 'REMOVE' | 'SUBSTITUTE')}
            options={[
              { value: 'REMOVE', label: 'Remove item' },
              { value: 'SUBSTITUTE', label: 'Substitute with note' },
            ]}
          />
          <Input
            label="Note"
            value={subNote}
            onChange={(e) => setSubNote(e.target.value)}
            placeholder="e.g. Replaced with similar product"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSubItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubstitution} loading={actionLoading}>
              Apply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
