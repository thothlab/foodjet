import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loader } from '@/components/ui/Loader';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDate, statusLabel } from '@/lib/format';

interface Store {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
}

interface StoreListResponse {
  data: Store[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export function StoreListPage() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toggleStore, setToggleStore] = useState<Store | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadStores();
  }, [page]);

  const loadStores = async () => {
    setLoading(true);
    try {
      const result = await api.get<StoreListResponse>(`/stores?page=${page}&pageSize=20`);
      setStores(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleStore) return;
    setToggling(true);
    try {
      const newStatus = toggleStore.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.put(`/stores/${toggleStore.id}/status`, { status: newStatus });
      setToggleStore(null);
      loadStores();
    } catch (err) {
      console.error('Failed to toggle store status:', err);
    } finally {
      setToggling(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'slug', header: 'Slug' },
    {
      key: 'status',
      header: 'Status',
      render: (store: Store) => (
        <Badge status={store.status} label={statusLabel(store.status)} />
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (store: Store) => formatDate(store.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (store: Store) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/stores/${store.id}/edit`);
            }}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/stores/${store.id}/settings`);
            }}
          >
            Settings
          </Button>
          <Button
            variant={store.status === 'ACTIVE' ? 'danger' : 'primary'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setToggleStore(store);
            }}
          >
            {store.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
        <Button onClick={() => navigate('/stores/new')}>Create Store</Button>
      </div>

      <Table columns={columns} data={stores as unknown as Record<string, unknown>[]} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!toggleStore}
        onClose={() => setToggleStore(null)}
        onConfirm={handleToggleStatus}
        title={toggleStore?.status === 'ACTIVE' ? 'Deactivate Store' : 'Activate Store'}
        message={`Are you sure you want to ${toggleStore?.status === 'ACTIVE' ? 'deactivate' : 'activate'} "${toggleStore?.name}"?`}
        confirmLabel={toggleStore?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        confirmVariant={toggleStore?.status === 'ACTIVE' ? 'danger' : 'primary'}
        loading={toggling}
      />
    </div>
  );
}
