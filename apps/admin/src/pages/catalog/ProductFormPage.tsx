import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminStore } from '@/store/admin-store';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Loader } from '@/components/ui/Loader';
import { priceToCents } from '@/lib/format';

interface Category {
  id: string;
  name: string;
}

interface CategoriesResponse {
  data: Category[];
}

interface ProductResponse {
  data: {
    id: string;
    categoryId: string;
    name: string;
    description: string | null;
    price: number;
    oldPrice: number | null;
    imageUrl: string | null;
    tags: string[];
    sortOrder: number;
  };
}

interface ProductForm {
  categoryId: string;
  name: string;
  description: string;
  price: string;
  oldPrice: string;
  tags: string;
  sortOrder: number;
  imageUrl: string | null;
}

export function ProductFormPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { currentStore } = useAdminStore();
  const isEdit = !!productId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductForm>({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    oldPrice: '',
    tags: '',
    sortOrder: 0,
    imageUrl: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    init();
  }, [currentStore, productId]);

  const init = async () => {
    if (!currentStore) {
      setLoading(false);
      return;
    }

    try {
      // Load categories
      const catResult = await api.get<CategoriesResponse>(`/stores/${currentStore.id}/categories`);
      setCategories(catResult.data);

      // Load product if editing
      if (isEdit) {
        const productResult = await api.get<ProductResponse>(`/products/${productId}`);
        const p = productResult.data;
        setForm({
          categoryId: p.categoryId,
          name: p.name,
          description: p.description || '',
          price: (p.price / 100).toFixed(2),
          oldPrice: p.oldPrice ? (p.oldPrice / 100).toFixed(2) : '',
          tags: (p.tags || []).join(', '),
          sortOrder: p.sortOrder,
          imageUrl: p.imageUrl,
        });
      }
    } catch (err) {
      console.error('Failed to init:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await api.upload<{ url: string }>('/upload/image', file);
      setForm({ ...form, imageUrl: result.url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentStore) {
      setError('Please select a store first');
      return;
    }

    if (!form.categoryId || !form.name.trim() || !form.price) {
      setError('Category, name, and price are required');
      return;
    }

    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be a positive number');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        categoryId: form.categoryId,
        name: form.name,
        description: form.description || null,
        price: priceToCents(form.price),
        oldPrice: form.oldPrice ? priceToCents(form.oldPrice) : null,
        imageUrl: form.imageUrl,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        sortOrder: form.sortOrder,
      };

      if (isEdit) {
        await api.put(`/products/${productId}`, payload);
      } else {
        await api.post(`/stores/${currentStore.id}/products`, payload);
      }
      navigate('/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (!currentStore) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {isEdit ? 'Edit Product' : 'New Product'}
        </h1>
        <p className="text-gray-500">Please select a store first.</p>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Product' : 'New Product'}
        </h1>
      </div>

      <div className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            label="Category"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Select category"
          />

          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Product name"
          />

          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Product description"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (rubles)"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0.00"
            />
            <Input
              label="Old Price (rubles, optional)"
              type="number"
              step="0.01"
              min="0"
              value={form.oldPrice}
              onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
              placeholder="0.00"
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            {form.imageUrl && (
              <div className="mb-2">
                <img
                  src={form.imageUrl}
                  alt="Product"
                  className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
          </div>

          <Input
            label="Tags (comma-separated)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="e.g. popular, new, vegan"
          />

          <Input
            label="Sort Order"
            type="number"
            value={String(form.sortOrder)}
            onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={saving}>
              {isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
            <Button variant="secondary" type="button" onClick={() => navigate('/products')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
