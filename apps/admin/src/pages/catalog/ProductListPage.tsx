import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/store/admin-store';
import { api } from '@/api/client';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Loader } from '@/components/ui/Loader';
import { Pagination } from '@/components/ui/Pagination';
import { formatPrice, statusLabel } from '@/lib/format';

interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  oldPrice: number | null;
  imageUrl: string | null;
  isAvailable: boolean;
  status: string;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
}

interface ProductsResponse {
  data: {
    items: Product[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  };
}

interface CategoriesResponse {
  data: Category[];
}

export function ProductListPage() {
  const navigate = useNavigate();
  const { currentStore } = useAdminStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterCategory, setFilterCategory] = useState('');

  // Archive state
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    if (currentStore) {
      loadCategories();
    }
  }, [currentStore]);

  useEffect(() => {
    if (currentStore) {
      loadProducts();
    }
  }, [currentStore, page, filterCategory]);

  const loadCategories = async () => {
    if (!currentStore) return;
    try {
      const result = await api.get<CategoriesResponse>(`/stores/${currentStore.id}/categories`);
      setCategories(result.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadProducts = async () => {
    if (!currentStore) return;
    setLoading(true);
    try {
      let url = `/stores/${currentStore.id}/products?page=${page}&pageSize=20`;
      if (filterCategory) {
        url += `&categoryId=${filterCategory}`;
      }
      const result = await api.get<ProductsResponse>(url);
      // Map category names
      const items = (result.data.items || result.data as unknown as Product[]).map((p: Product) => ({
        ...p,
        categoryName: categories.find((c) => c.id === p.categoryId)?.name || '-',
      }));
      setProducts(items);
      if (result.data.pagination) {
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      await api.put(`/products/${product.id}/availability`, {
        isAvailable: !product.isAvailable,
      });
      loadProducts();
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      await api.delete(`/products/${archiveTarget.id}`);
      setArchiveTarget(null);
      loadProducts();
    } catch (err) {
      console.error('Failed to archive product:', err);
    } finally {
      setArchiving(false);
    }
  };

  const columns = [
    {
      key: 'image',
      header: '',
      className: 'w-12',
      render: (product: Product) => (
        product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-10 h-10 rounded-md object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )
      ),
    },
    { key: 'name', header: 'Name' },
    {
      key: 'categoryName',
      header: 'Category',
      render: (product: Product) => product.categoryName || '-',
    },
    {
      key: 'price',
      header: 'Price',
      render: (product: Product) => formatPrice(product.price),
    },
    {
      key: 'isAvailable',
      header: 'Available',
      render: (product: Product) => (
        <Badge
          status={product.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
          label={product.isAvailable ? 'Yes' : 'No'}
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (product: Product) => (
        <Badge status={product.status} label={statusLabel(product.status)} />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${product.id}/edit`);
            }}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleAvailability(product);
            }}
          >
            {product.isAvailable ? 'Disable' : 'Enable'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setArchiveTarget(product);
            }}
          >
            Archive
          </Button>
        </div>
      ),
    },
  ];

  if (!currentStore) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Products</h1>
        <p className="text-gray-500">Please select a store first.</p>
      </div>
    );
  }

  if (loading && products.length === 0) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button onClick={() => navigate('/products/new')}>Add Product</Button>
      </div>

      {/* Category filter */}
      <div className="mb-4 max-w-xs">
        <Select
          label="Filter by Category"
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setPage(1);
          }}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="All categories"
        />
      </div>

      <Table columns={columns} data={products as unknown as Record<string, unknown>[]} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
        title="Archive Product"
        message={`Are you sure you want to archive "${archiveTarget?.name}"?`}
        confirmLabel="Archive"
        loading={archiving}
      />
    </div>
  );
}
