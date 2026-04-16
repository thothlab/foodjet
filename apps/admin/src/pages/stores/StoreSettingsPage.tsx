import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Loader } from '@/components/ui/Loader';

interface StoreSettings {
  deliveryText: string;
  cashPaymentMessage: string;
  supportPhone: string;
  supportTelegram: string;
  noticeText: string;
  acceptingOrders: boolean;
  minOrderAmount: number;
}

interface StoreWithSettings {
  id: string;
  name: string;
  settings: StoreSettings | null;
}

export function StoreSettingsPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<StoreSettings>({
    deliveryText: '',
    cashPaymentMessage: '',
    supportPhone: '',
    supportTelegram: '',
    noticeText: '',
    acceptingOrders: true,
    minOrderAmount: 0,
  });
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, [storeId]);

  const loadSettings = async () => {
    try {
      // Fetch store data to get settings
      const stores = await api.get<{ data: StoreWithSettings[] }>(`/stores?pageSize=100`);
      const store = stores.data.find((s) => s.id === storeId);
      if (store) {
        setStoreName(store.name);
        if (store.settings) {
          setForm({
            deliveryText: store.settings.deliveryText || '',
            cashPaymentMessage: store.settings.cashPaymentMessage || '',
            supportPhone: store.settings.supportPhone || '',
            supportTelegram: store.settings.supportTelegram || '',
            noticeText: store.settings.noticeText || '',
            acceptingOrders: store.settings.acceptingOrders ?? true,
            minOrderAmount: store.settings.minOrderAmount || 0,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await api.put(`/stores/${storeId}/settings`, form);
      setSuccess('Settings saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        {storeName && (
          <p className="text-sm text-gray-500 mt-1">{storeName}</p>
        )}
      </div>

      <div className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Textarea
            label="Delivery Text"
            value={form.deliveryText}
            onChange={(e) => setForm({ ...form, deliveryText: e.target.value })}
            placeholder="Information about delivery shown to customers"
          />

          <Textarea
            label="Cash Payment Message"
            value={form.cashPaymentMessage}
            onChange={(e) => setForm({ ...form, cashPaymentMessage: e.target.value })}
            placeholder="Message shown when customer selects cash payment"
          />

          <Input
            label="Support Phone"
            value={form.supportPhone}
            onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
            placeholder="+7 (999) 123-45-67"
          />

          <Input
            label="Support Telegram"
            value={form.supportTelegram}
            onChange={(e) => setForm({ ...form, supportTelegram: e.target.value })}
            placeholder="@support_username"
          />

          <Textarea
            label="Notice Text"
            value={form.noticeText}
            onChange={(e) => setForm({ ...form, noticeText: e.target.value })}
            placeholder="Important notice displayed to customers"
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="acceptingOrders"
              checked={form.acceptingOrders}
              onChange={(e) => setForm({ ...form, acceptingOrders: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="acceptingOrders" className="text-sm font-medium text-gray-700">
              Accepting Orders
            </label>
          </div>

          <Input
            label="Minimum Order Amount (cents)"
            type="number"
            value={String(form.minOrderAmount)}
            onChange={(e) => setForm({ ...form, minOrderAmount: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={saving}>
              Save Settings
            </Button>
            <Button variant="secondary" type="button" onClick={() => navigate('/stores')}>
              Back to Stores
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
