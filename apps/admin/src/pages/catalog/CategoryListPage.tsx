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

interface Category {
  id: string;
  name: string;
  sortOrder: number;
  status: string;
  productsCount?: number;
}

interface CategoriesResponse {
  data: Category[];
}

export function CategoryListPage() {
  const { currentStore } = useAdminStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Archive state
  const [archiveTarget, setArchiveTarget] = useState<Category | null>(null);
  const [archiving, setArchiving] = useState(false);

  // Inline sort order editing
  const [editingSortId, setEditingSortId] = useState<string | null>(null);
  const [editingSortValue, setEditingSortValue] = useState(0);

  useEffect(() => {
    if (currentStore) {
      loadCategories();
    }
  }, [currentStore]);

  const loadCategories = async () => {
    if (!currentStore) return;
    setLoading(true);
    try {
      const result = await api.get<CategoriesResponse>(`/stores/${currentStore.id}/categories`);
      setCategories(result.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditCategory(null);
    setFormName('');
    setFormSortOrder(categories.length);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditCategory(cat);
    setFormName(cat.name);
    setFormSortOrder(cat.sortOrder);
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!currentStore || !formName.trim()) {
      setFormError('Name is required');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      if (editCategory) {
        await api.put(`/categories/${editCategory.id}`, {
          name: formName,
          sortOrder: formSortOrder,
        });
      } else {
        await api.post(`/stores/${currentStore.id}/categories`, {
          name: formName,
          sortOrder: formSortOrder,
        });
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      await api.delete(`/categories/${archiveTarget.id}`);
      setArchiveTarget(null);
      loadCategories();
    } catch (err) {
      console.error('Failed to archive category:', err);
    } finally {
      setArchiving(false);
    }
  };

  const handleSortOrderSave = async (categoryId: string) => {
    try {
      await api.put(`/categories/${categoryId}`, { sortOrder: editingSortValue });
      setEditingSortId(null);
      loadCategories();
    } catch (err) {
      console.error('Failed to update sort order:', err);
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    {
      key: 'sortOrder',
      header: 'Sort Order',
      render: (cat: Category) => {
        if (editingSortId === cat.id) {
          return (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editingSortValue}
                onChange={(e) => setEditingSortValue(parseInt(e.target.value) || 0)}
                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSortOrderSave(cat.id);
                  if (e.key === 'Escape') setEditingSortId(null);
                }}
              />
              <Button size="sm" onClick={() => handleSortOrderSave(cat.id)}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingSortId(null)}>Cancel</Button>
            </div>
          );
        }
        return (
          <span
            className="cursor-pointer hover:text-blue-600"
            onClick={() => {
              setEditingSortId(cat.id);
              setEditingSortValue(cat.sortOrder);
            }}
          >
            {cat.sortOrder}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (cat: Category) => (
        <Badge status={cat.status} label={statusLabel(cat.status)} />
      ),
    },
    {
      key: 'productsCount',
      header: 'Products',
      render: (cat: Category) => cat.productsCount ?? '-',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (cat: Category) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(cat)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setArchiveTarget(cat)}>
            Archive
          </Button>
        </div>
      ),
    },
  ];

  if (!currentStore) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Categories</h1>
        <p className="text-gray-500">Please select a store first.</p>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Button onClick={openCreateModal}>Create Category</Button>
      </div>

      <Table columns={columns} data={categories as unknown as Record<string, unknown>[]} />

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editCategory ? 'Edit Category' : 'Create Category'}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Category name"
            error={formError || undefined}
          />
          <Input
            label="Sort Order"
            type="number"
            value={String(formSortOrder)}
            onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editCategory ? 'Save' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Archive Confirmation */}
      <ConfirmDialog
        open={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
        title="Archive Category"
        message={`Are you sure you want to archive "${archiveTarget?.name}"? This will hide it from the catalog.`}
        confirmLabel="Archive"
        loading={archiving}
      />
    </div>
  );
}
