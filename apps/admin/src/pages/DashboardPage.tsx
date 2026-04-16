import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '@/store/admin-store';
import { api } from '@/api/client';
import { Loader } from '@/components/ui/Loader';

interface StoreListResponse {
  data: Array<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
    status: string;
    createdAt: string;
  }>;
  pagination: { total: number };
}

export function DashboardPage() {
  const { currentStore, setStores, setCurrentStore, stores, user } = useAdminStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const result = await api.get<StoreListResponse>('/stores?pageSize=100');
      const storeList = result.data.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        description: s.description,
        status: s.status,
        createdAt: s.createdAt,
      }));
      setStores(storeList);

      // Auto-select first store if none selected
      if (!currentStore && storeList.length > 0) {
        setCurrentStore(storeList[0]);
      }
    } catch {
      // User might not have access to list stores
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const shortcuts = [
    { to: '/orders', label: 'Orders', description: 'View and manage orders', color: 'bg-blue-500' },
    { to: '/products', label: 'Products', description: 'Manage product catalog', color: 'bg-green-500' },
    { to: '/categories', label: 'Categories', description: 'Organize product categories', color: 'bg-purple-500' },
    { to: '/couriers', label: 'Couriers', description: 'Manage delivery couriers', color: 'bg-orange-500' },
    { to: '/staff', label: 'Staff', description: 'Manage staff assignments', color: 'bg-indigo-500' },
    { to: '/settings/working-hours', label: 'Working Hours', description: 'Set store schedule', color: 'bg-teal-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {currentStore && (
          <p className="text-sm text-gray-500 mt-1">
            Current store: <span className="font-medium text-gray-700">{currentStore.name}</span>
          </p>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Total Stores</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stores.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Active Stores</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stores.filter((s) => s.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Your Role</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{user?.role || '-'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Store Status</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{currentStore?.status || '-'}</p>
        </div>
      </div>

      {/* Quick shortcuts */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shortcuts.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                <span className="text-white text-lg font-bold">{item.label[0]}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
