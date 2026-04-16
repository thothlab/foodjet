import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/admin-store';
import { api } from '@/api/client';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Loader } from '@/components/ui/Loader';
import { statusLabel } from '@/lib/format';

interface StaffAssignment {
  id: string;
  userId: string;
  storeId: string;
  role: string;
  status: string;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    username: string | null;
  };
}

interface StaffListResponse {
  data: StaffAssignment[];
}

const roleOptions = [
  { value: 'STORE_MANAGER', label: 'Store Manager' },
  { value: 'STORE_OPERATOR', label: 'Store Operator' },
  { value: 'CATALOG_MANAGER', label: 'Catalog Manager' },
];

export function StaffListPage() {
  const { currentStore } = useAdminStore();
  const [staff, setStaff] = useState<StaffAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<StaffAssignment | null>(null);
  const [revoking, setRevoking] = useState(false);

  // Add modal state
  const [addUserId, setAddUserId] = useState('');
  const [addRole, setAddRole] = useState('STORE_OPERATOR');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (currentStore) {
      loadStaff();
    }
  }, [currentStore]);

  const loadStaff = async () => {
    if (!currentStore) return;
    setLoading(true);
    try {
      const result = await api.get<StaffListResponse>(`/stores/${currentStore.id}/staff`);
      setStaff(result.data);
    } catch (err) {
      console.error('Failed to load staff:', err);
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
      await api.post(`/stores/${currentStore.id}/staff`, {
        userId: addUserId.trim(),
        role: addRole,
      });
      setShowAddModal(false);
      setAddUserId('');
      setAddRole('STORE_OPERATOR');
      loadStaff();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add staff');
    } finally {
      setAdding(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await api.delete(`/staff-assignments/${revokeTarget.id}`);
      setRevokeTarget(null);
      loadStaff();
    } catch (err) {
      console.error('Failed to revoke assignment:', err);
    } finally {
      setRevoking(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (item: StaffAssignment) =>
        `${item.user.firstName} ${item.user.lastName || ''}`.trim(),
    },
    {
      key: 'username',
      header: 'Telegram Username',
      render: (item: StaffAssignment) =>
        item.user.username ? `@${item.user.username}` : '-',
    },
    {
      key: 'role',
      header: 'Role',
      render: (item: StaffAssignment) => (
        <Badge status={item.role} label={statusLabel(item.role)} />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: StaffAssignment) => (
        <Badge status={item.status} label={statusLabel(item.status)} />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: StaffAssignment) => (
        <Button
          variant="danger"
          size="sm"
          onClick={() => setRevokeTarget(item)}
        >
          Revoke
        </Button>
      ),
    },
  ];

  if (!currentStore) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Staff</h1>
        <p className="text-gray-500">Please select a store first.</p>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
        <Button onClick={() => setShowAddModal(true)}>Add Staff</Button>
      </div>

      <Table columns={columns} data={staff as unknown as Record<string, unknown>[]} />

      {/* Add Staff Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Staff Member">
        <div className="space-y-4">
          <Input
            label="User ID"
            value={addUserId}
            onChange={(e) => setAddUserId(e.target.value)}
            placeholder="Enter user UUID"
            error={addError || undefined}
          />
          <Select
            label="Role"
            value={addRole}
            onChange={(e) => setAddRole(e.target.value)}
            options={roleOptions}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} loading={adding}>
              Add Staff
            </Button>
          </div>
        </div>
      </Modal>

      {/* Revoke Confirmation */}
      <ConfirmDialog
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title="Revoke Staff Assignment"
        message={`Are you sure you want to revoke the assignment for "${revokeTarget?.user.firstName || ''}"?`}
        confirmLabel="Revoke"
        loading={revoking}
      />
    </div>
  );
}
