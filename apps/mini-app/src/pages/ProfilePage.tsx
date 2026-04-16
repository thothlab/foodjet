import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, del, put } from '../api/client';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';

interface Address {
  id: string;
  title?: string;
  street: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
  comment?: string;
  isDefault: boolean;
}

interface Profile {
  id: string;
  userId: string;
  phone?: string;
  addresses: Address[];
}

export function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const p = await get<Profile>('/profile');
      setProfile(p);
      const res = await get<{ data: Address[] }>('/addresses');
      setAddresses(res.data ?? []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить адрес?')) return;
    await del(`/addresses/${id}`);
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  const handleSetDefault = async (id: string) => {
    await put(`/addresses/${id}`, { isDefault: true });
    setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Профиль</h1>

      {profile && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="font-medium">Телефон: {profile.phone || 'Не указан'}</p>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Адреса доставки</h2>
          <Button size="sm" onClick={() => navigate('/address/new')}>+ Добавить</Button>
        </div>

        {addresses.length === 0 ? (
          <p className="text-gray-500 text-sm">Адресов пока нет</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between">
                  <div>
                    {addr.title && <p className="font-medium text-sm">{addr.title}</p>}
                    <p className="text-sm">{addr.street}</p>
                    {(addr.entrance || addr.floor || addr.apartment) && (
                      <p className="text-xs text-gray-500">
                        {[addr.entrance && `подъезд ${addr.entrance}`, addr.floor && `этаж ${addr.floor}`, addr.apartment && `кв. ${addr.apartment}`].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {addr.isDefault && (
                      <span className="text-xs text-blue-600 font-medium">По умолчанию</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {!addr.isDefault && (
                      <button className="text-xs text-blue-500" onClick={() => handleSetDefault(addr.id)}>
                        По умолчанию
                      </button>
                    )}
                    <button className="text-xs text-blue-500" onClick={() => navigate(`/address/${addr.id}/edit`)}>
                      Изменить
                    </button>
                    <button className="text-xs text-red-500" onClick={() => handleDelete(addr.id)}>
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
