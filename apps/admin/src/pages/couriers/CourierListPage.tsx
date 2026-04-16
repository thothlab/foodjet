import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/admin-store';
import { api } from '@/api/client';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Loader } from '@/components/ui/Loader';
import { statusLabel } from '@/lib/format';

interface Courier {
  id: string;
  userId: string;
  storeId: string;
  status: string;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    username: string | null;
  };
}

interface CouriersResponse {
  data: Courier[];
}

export function CourierListPage() {
  const { currentStore } = useAdminStore();
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addUserId, setAddUserId] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  // Toggle status
  const [toggleTarget, setToggleTarget] = useState<Courier | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (currentStore) {
      loadCouriers();
    }
  }, [currentStore]);

  const loadCouriers = async () => {
    if (!currentStore) return;
    setLoading(true);
    try {
      const result = await api.get<CouriersResponse>(`/stores/${currentStore.id}/couriers`);
      setCouriers(result.data);
    } catch (err) {
      console.error('Failed to load couriers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!currentStore || !addUserId.trim()) {
      setAddError('User ID is required');
      return;
    }

    setAdding(true);
    setAddError('');
    try {
      await api.post(`/stores/${currentStore.id}/couriers`, { userId: addUserId.trim() });
      setShowAddModal(false);
      setAddUserId('');
      loadCouriers();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add courier');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleTarget) return;
    setToggling(true);
    try {
      const newStatus = toggleTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.put(`/couriers/${toggleTarget.id}/status`, { status: newStatus });
      setToggleTarget(null);
      loadCouriers();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setToggling(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (courier: Courier) =>
        `${courier.user.firstName} ${courier.user.lastName || ''}`.trim(),
    },
    {
      key: 'username',
      header: 'Telegram',
      render: (courier: Courier) =>
        courier.user.username ? `@${courier.user.username}` : '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (courier: Courier) => (
        <Badge status={courier.status} label={statusLabel(courier.status)} />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (courier: Courier) => (
        <Button
          variant={courier.status === 'ACTIVE' ? 'danger' : 'primary'}
          size="sm"
          onClick={() => setToggleTarget(courier)}
        >
          {courier.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  if (!currentStore) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Couriers</h1>
        <p className="text-gray-500">Please select a store first.</p>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Couriers</h1>
        <Button onClick={() => setShowAddModal(true)}>Add Courier</Button>
      </div>

      <Table columns={columns} data={couriers as unknown as Record<string, unknown>[]} />

      {/* Add Courier Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Courier">
        <div className="space-y-4">
          <Input
            label="User ID"
            value={addUserId}
            onChange={(e) => setAddUserId(e.target.value)}
            placeholder="Enter user UUID"
            error={addError || undefined}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} loading={adding}>
              Add Courier
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toggle Status Confirmation */}
      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggleStatus}
        title={toggleTarget?.status === 'ACTIVE' ? 'Deactivate Courier' : 'Activate Courier'}
        message={`Are you sure you want to ${toggleTarget?.status === 'ACTIVE' ? 'deactivate' : 'activate'} this courier?`}
        confirmLabel={toggleTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        confirmVariant={toggleTarget?.status === 'ACTIVE' ? 'danger' : 'primary'}
        loading={toggling}
      />
    </div>
  );
}
