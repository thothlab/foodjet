import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, post, put } from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';

export function AddressFormPage() {
  const { addressId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!addressId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    street: '',
    entrance: '',
    floor: '',
    apartment: '',
    comment: '',
    isDefault: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const res = await get<{ data: typeof form & { id: string } }>(`/addresses`);
          const addresses = (res.data ?? res) as unknown as (typeof form & { id: string })[];
          const addr = Array.isArray(addresses) ? addresses.find((a) => a.id === addressId) : null;
          if (addr) setForm({ title: addr.title || '', street: addr.street, entrance: addr.entrance || '', floor: addr.floor || '', apartment: addr.apartment || '', comment: addr.comment || '', isDefault: addr.isDefault });
        } catch { /* empty */ }
        setLoading(false);
      })();
    }
  }, [addressId, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.street.trim()) { setError('Укажите улицу и номер дома'); return; }
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await put(`/addresses/${addressId}`, form);
      } else {
        await post('/addresses', form);
      }
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    }
    setSaving(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">{isEdit ? 'Редактировать адрес' : 'Новый адрес'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Название (для себя)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Дом, работа..." />
        <Input label="Улица и дом *" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder="ул. Ленина, д. 10" required />
        <div className="grid grid-cols-3 gap-3">
          <Input label="Подъезд" value={form.entrance} onChange={(e) => setForm({ ...form, entrance: e.target.value })} />
          <Input label="Этаж" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
          <Input label="Квартира" value={form.apartment} onChange={(e) => setForm({ ...form, apartment: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий для курьера</label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            className="w-full border rounded-lg p-3 text-sm"
            rows={2}
            placeholder="Код домофона, ориентиры..."
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="rounded" />
          Адрес по умолчанию
        </label>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </form>
    </div>
  );
}
