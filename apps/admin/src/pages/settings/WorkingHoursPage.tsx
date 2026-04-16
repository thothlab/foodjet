import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/admin-store';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { DAY_NAMES } from '@/lib/format';

interface DayHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

interface WorkingHoursResponse {
  data: DayHours[];
}

function defaultHours(): DayHours[] {
  return DAY_NAMES.map((_, idx) => ({
    dayOfWeek: idx + 1,
    openTime: '09:00',
    closeTime: '21:00',
  }));
}

export function WorkingHoursPage() {
  const { currentStore } = useAdminStore();
  const [hours, setHours] = useState<DayHours[]>(defaultHours());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentStore) {
      loadHours();
    }
  }, [currentStore]);

  const loadHours = async () => {
    if (!currentStore) return;
    setLoading(true);
    try {
      const result = await api.get<WorkingHoursResponse>(
        `/stores/${currentStore.id}/working-hours`,
      );
      if (result.data && result.data.length > 0) {
        // Merge with defaults to ensure all 7 days
        const merged = defaultHours().map((def) => {
          const found = result.data.find((h) => h.dayOfWeek === def.dayOfWeek);
          return found || def;
        });
        setHours(merged);
      }
    } catch (err) {
      console.error('Failed to load working hours:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateDay = (dayOfWeek: number, field: 'openTime' | 'closeTime', value: string) => {
    setHours(
      hours.map((h) =>
        h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h,
      ),
    );
  };

  const handleSave = async () => {
    if (!currentStore) return;
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await api.put(`/stores/${currentStore.id}/working-hours`, hours);
      setSuccess('Working hours saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save working hours');
    } finally {
      setSaving(false);
    }
  };

  if (!currentStore) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Working Hours</h1>
        <p className="text-gray-500">Please select a store first.</p>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Working Hours</h1>
        <p className="text-sm text-gray-500 mt-1">{currentStore.name}</p>
      </div>

      <div className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-4">
          {hours.map((day) => (
            <div
              key={day.dayOfWeek}
              className="flex items-center gap-4"
            >
              <span className="w-28 text-sm font-medium text-gray-700">
                {DAY_NAMES[day.dayOfWeek - 1]}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={day.openTime}
                  onChange={(e) => updateDay(day.dayOfWeek, 'openTime', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="time"
                  value={day.closeTime}
                  onChange={(e) => updateDay(day.dayOfWeek, 'closeTime', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        {success && <p className="text-sm text-green-600 mt-4">{success}</p>}

        <div className="mt-6">
          <Button onClick={handleSave} loading={saving}>
            Save Working Hours
          </Button>
        </div>
      </div>
    </div>
  );
}
