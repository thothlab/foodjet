import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, Address, CreateOrderData } from '../store/app-store';
import { useTelegram } from '../hooks/useTelegram';
import { formatPrice, pluralize } from '../lib/format';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';

type SubstitutionPolicy = 'ALLOW' | 'CONTACT' | 'DENY';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { backButton, hapticFeedback, showAlert } = useTelegram();
  const { cart, fetchCart, profile, fetchProfile, fetchAddresses, createOrder } = useAppStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newEntrance, setNewEntrance] = useState('');
  const [newFloor, setNewFloor] = useState('');
  const [newApartment, setNewApartment] = useState('');
  const [newAddressComment, setNewAddressComment] = useState('');

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [comment, setComment] = useState('');
  const [substitutionPolicy, setSubstitutionPolicy] = useState<SubstitutionPolicy>('CONTACT');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await fetchCart();
      await fetchProfile();
      try {
        const addrs = await fetchAddresses();
        setAddresses(addrs);
        const defaultAddr = addrs.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (addrs.length > 0) {
          setSelectedAddressId(addrs[0].id);
        } else {
          setUseNewAddress(true);
        }
      } catch {
        setUseNewAddress(true);
      }
      setLoading(false);
    }
    init();
  }, [fetchCart, fetchProfile, fetchAddresses]);

  // Pre-fill contact from profile
  useEffect(() => {
    if (profile) {
      if (!contactName) {
        setContactName([profile.firstName, profile.lastName].filter(Boolean).join(' '));
      }
      if (!contactPhone && profile.phone) {
        setContactPhone(profile.phone);
      }
    }
  }, [profile, contactName, contactPhone]);

  useEffect(() => {
    if (backButton) {
      backButton.show();
      const handler = () => navigate(-1);
      backButton.onClick(handler);
      return () => {
        backButton.offClick(handler);
        backButton.hide();
      };
    }
  }, [backButton, navigate]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!useNewAddress && !selectedAddressId) {
      newErrors.address = 'Выберите адрес доставки';
    }
    if (useNewAddress && !newStreet.trim()) {
      newErrors.street = 'Введите улицу и дом';
    }
    if (!contactName.trim()) {
      newErrors.contactName = 'Введите имя';
    }
    if (!contactPhone.trim()) {
      newErrors.contactPhone = 'Введите номер телефона';
    } else if (contactPhone.replace(/\D/g, '').length < 10) {
      newErrors.contactPhone = 'Некорректный номер телефона';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      hapticFeedback('notification', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const data: CreateOrderData = {
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        comment: comment.trim() || undefined,
        substitutionPolicy,
      };

      if (useNewAddress) {
        data.address = {
          street: newStreet.trim(),
          entrance: newEntrance.trim() || undefined,
          floor: newFloor.trim() || undefined,
          apartment: newApartment.trim() || undefined,
          comment: newAddressComment.trim() || undefined,
        };
      } else {
        data.addressId = selectedAddressId!;
      }

      const order = await createOrder(data);
      hapticFeedback('notification', 'success');
      navigate(`/order-success/${order.id}`, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка оформления заказа';
      showAlert(message);
      hapticFeedback('notification', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen text="Загрузка..." />;

  if (!cart || cart.items.length === 0) {
    navigate('/cart', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-tg-secondary-bg">
      {/* Header */}
      <div className="bg-tg-bg px-4 pt-4 pb-3 border-b border-black/5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-tg-button p-1 -ml-1">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-tg-text">Оформление заказа</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Address Section */}
        <div className="bg-tg-bg rounded-2xl p-4 shadow-sm border border-black/5">
          <h2 className="text-base font-semibold text-tg-text mb-3">Адрес доставки</h2>

          {addresses.length > 0 && (
            <div className="space-y-2 mb-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    !useNewAddress && selectedAddressId === addr.id
                      ? 'border-tg-button bg-tg-button/5'
                      : 'border-transparent bg-tg-secondary-bg'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={!useNewAddress && selectedAddressId === addr.id}
                    onChange={() => {
                      setSelectedAddressId(addr.id);
                      setUseNewAddress(false);
                      setErrors((prev) => ({ ...prev, address: '' }));
                    }}
                    className="mt-1 accent-[var(--tg-theme-button-color)]"
                  />
                  <div>
                    <p className="text-sm font-medium text-tg-text">{addr.title}</p>
                    <p className="text-xs text-tg-hint mt-0.5">{addr.street}</p>
                    {(addr.entrance || addr.floor || addr.apartment) && (
                      <p className="text-xs text-tg-hint">
                        {[
                          addr.entrance && `подъезд ${addr.entrance}`,
                          addr.floor && `этаж ${addr.floor}`,
                          addr.apartment && `кв. ${addr.apartment}`,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </label>
              ))}

              {/* New address option */}
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                  useNewAddress ? 'border-tg-button bg-tg-button/5' : 'border-transparent bg-tg-secondary-bg'
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={useNewAddress}
                  onChange={() => setUseNewAddress(true)}
                  className="accent-[var(--tg-theme-button-color)]"
                />
                <span className="text-sm font-medium text-tg-button">+ Новый адрес</span>
              </label>
            </div>
          )}

          {useNewAddress && (
            <div className="space-y-3 mt-3">
              <Input
                label="Улица и дом"
                placeholder="ул. Ленина, д. 10"
                value={newStreet}
                onChange={(e) => {
                  setNewStreet(e.target.value);
                  setErrors((prev) => ({ ...prev, street: '' }));
                }}
                error={errors.street}
              />
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Подъезд"
                  placeholder="1"
                  value={newEntrance}
                  onChange={(e) => setNewEntrance(e.target.value)}
                />
                <Input
                  label="Этаж"
                  placeholder="5"
                  value={newFloor}
                  onChange={(e) => setNewFloor(e.target.value)}
                />
                <Input
                  label="Квартира"
                  placeholder="42"
                  value={newApartment}
                  onChange={(e) => setNewApartment(e.target.value)}
                />
              </div>
              <Input
                label="Комментарий к адресу"
                placeholder="Код домофона, ориентиры..."
                value={newAddressComment}
                onChange={(e) => setNewAddressComment(e.target.value)}
              />
            </div>
          )}

          {errors.address && <p className="text-sm text-red-500 mt-2">{errors.address}</p>}
        </div>

        {/* Contact Info */}
        <div className="bg-tg-bg rounded-2xl p-4 shadow-sm border border-black/5">
          <h2 className="text-base font-semibold text-tg-text mb-3">Контактные данные</h2>
          <div className="space-y-3">
            <Input
              label="Имя"
              placeholder="Иван"
              value={contactName}
              onChange={(e) => {
                setContactName(e.target.value);
                setErrors((prev) => ({ ...prev, contactName: '' }));
              }}
              error={errors.contactName}
            />
            <Input
              label="Телефон"
              placeholder="+7 (999) 123-45-67"
              type="tel"
              value={contactPhone}
              onChange={(e) => {
                setContactPhone(e.target.value);
                setErrors((prev) => ({ ...prev, contactPhone: '' }));
              }}
              error={errors.contactPhone}
            />
          </div>
        </div>

        {/* Comment */}
        <div className="bg-tg-bg rounded-2xl p-4 shadow-sm border border-black/5">
          <h2 className="text-base font-semibold text-tg-text mb-3">Комментарий к заказу</h2>
          <Textarea
            placeholder="Особые пожелания к заказу..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {/* Substitution Policy */}
        <div className="bg-tg-bg rounded-2xl p-4 shadow-sm border border-black/5">
          <h2 className="text-base font-semibold text-tg-text mb-3">Замена товаров</h2>
          <p className="text-xs text-tg-hint mb-3">Если товара нет в наличии:</p>
          <div className="space-y-2">
            {[
              { value: 'ALLOW' as SubstitutionPolicy, label: 'Заменить на аналогичный' },
              { value: 'CONTACT' as SubstitutionPolicy, label: 'Связаться со мной' },
              { value: 'DENY' as SubstitutionPolicy, label: 'Не заменять, удалить из заказа' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  substitutionPolicy === option.value ? 'bg-tg-button/5' : 'bg-tg-secondary-bg'
                }`}
              >
                <input
                  type="radio"
                  name="substitution"
                  value={option.value}
                  checked={substitutionPolicy === option.value}
                  onChange={() => setSubstitutionPolicy(option.value)}
                  className="accent-[var(--tg-theme-button-color)]"
                />
                <span className="text-sm text-tg-text">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="bg-tg-bg rounded-2xl p-4 shadow-sm border border-black/5">
          <h2 className="text-base font-semibold text-tg-text mb-2">Оплата</h2>
          <div className="flex items-center gap-3 p-3 bg-tg-secondary-bg rounded-xl">
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            <span className="text-sm text-tg-text font-medium">Оплата наличными при получении</span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-tg-bg rounded-2xl p-4 shadow-sm border border-black/5">
          <h2 className="text-base font-semibold text-tg-text mb-3">Ваш заказ</h2>
          <div className="space-y-2">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-tg-text truncate flex-1 mr-2">
                  {item.product.name} x{item.quantity}
                </span>
                <span className="text-tg-text font-medium flex-shrink-0">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="border-t border-black/5 pt-2 mt-2 flex justify-between items-center">
              <span className="text-base font-semibold text-tg-text">
                Итого ({pluralize(cart.itemsCount, 'товар', 'товара', 'товаров')})
              </span>
              <span className="text-xl font-bold text-tg-text">{formatPrice(cart.total)}</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button variant="primary" fullWidth size="lg" loading={submitting} onClick={handleSubmit}>
          Оформить заказ - {formatPrice(cart.total)}
        </Button>

        <div className="h-4" />
      </div>
    </div>
  );
}
