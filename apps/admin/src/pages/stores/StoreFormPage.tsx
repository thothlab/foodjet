import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Loader } from '@/components/ui/Loader';

interface StoreData {
  slug: string;
  name: string;
  description: string;
}

interface StoreResponse {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: string;
}

export function StoreFormPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const isEdit = !!storeId;

  const [form, setForm] = useState<StoreData>({ slug: '', name: '', description: '' });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      loadStore();
    }
  }, [storeId]);

  const loadStore = async () => {
    try {
      // Fetch store data via resolve endpoint or direct access
      const stores = await api.get<{ data: StoreResponse[] }>(`/stores?pageSize=100`);
      const store = stores.data.find((s) => s.id === storeId);
      if (store) {
        setForm({
          slug: store.slug,
          name: store.name,
          description: store.description || '',
        });
      }
    } catch (err) {
      console.error('Failed to load store:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.slug.trim() || !form.name.trim()) {
      setError('Slug and name are required');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/stores/${storeId}`, {
          name: form.name,
          description: form.description || null,
        });
      } else {
        await api.post('/stores', {
          slug: form.slug,
          name: form.name,
          description: form.description || null,
        });
      }
      navigate('/stores');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save store');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Store' : 'Create Store'}
        </h1>
      </div>

      <div className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="e.g. my-store"
            disabled={isEdit}
          />

          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Store display name"
          />

          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional store description"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={saving}>
              {isEdit ? 'Save Changes' : 'Create Store'}
            </Button>
            <Button variant="secondary" type="button" onClick={() => navigate('/stores')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
