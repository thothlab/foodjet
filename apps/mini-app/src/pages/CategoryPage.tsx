import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/app-store';
import { useTelegram } from '../hooks/useTelegram';
import { formatPrice } from '../lib/format';
import { Loader } from '../components/ui/Loader';
import { EmptyState } from '../components/ui/EmptyState';
import { CartBadge } from '../components/cart/CartBadge';
import { Button } from '../components/ui/Button';

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { backButton } = useTelegram();
  const { storeInfo, products, productsLoading, fetchProducts, cart, addToCart, updateQuantity, removeFromCart } =
    useAppStore();

  const category = storeInfo?.categories.find((c) => c.id === categoryId);
  const categoryProducts = categoryId ? products[categoryId] : undefined;

  useEffect(() => {
    if (categoryId) {
      fetchProducts(categoryId);
    }
  }, [categoryId, fetchProducts]);

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

  // Build a map of productId -> cart item for quick lookup
  const cartItemMap = useMemo(() => {
    const map: Record<string, { id: string; quantity: number }> = {};
    if (cart?.items) {
      cart.items.forEach((item) => {
        map[item.productId] = { id: item.id, quantity: item.quantity };
      });
    }
    return map;
  }, [cart]);

  if (productsLoading && !categoryProducts) {
    return <Loader fullScreen text="Загружаем товары..." />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-tg-bg px-4 pt-4 pb-3 sticky top-0 z-10 border-b border-black/5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-tg-button p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-tg-text">{category?.name || 'Категория'}</h1>
        </div>
      </div>

      {/* Products */}
      {!categoryProducts || categoryProducts.length === 0 ? (
        <EmptyState
          title="Товаров пока нет"
          description="В этой категории пока нет доступных товаров"
          icon={
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          }
          action={
            <Button variant="secondary" onClick={() => navigate('/')}>
              Назад в магазин
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4">
          {categoryProducts.map((product) => {
            const cartItem = cartItemMap[product.id];
            const inCart = !!cartItem;

            return (
              <div
                key={product.id}
                className="bg-tg-bg rounded-2xl overflow-hidden shadow-sm border border-black/5"
              >
                {/* Product Image */}
                <div
                  className="w-full h-32 bg-tg-secondary-bg cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-tg-hint/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3
                    className="text-sm font-medium text-tg-text line-clamp-2 min-h-[2.5rem] cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-base font-bold text-tg-text">
                      {formatPrice(product.price)}
                    </span>
                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className="text-xs text-tg-hint line-through">
                        {formatPrice(product.oldPrice)}
                      </span>
                    )}
                  </div>

                  {product.unit && (
                    <p className="text-xs text-tg-hint mt-0.5">{product.unit}</p>
                  )}

                  {/* Add to cart / quantity controls */}
                  <div className="mt-3">
                    {!product.inStock ? (
                      <span className="text-xs text-tg-hint">Нет в наличии</span>
                    ) : inCart ? (
                      <div className="flex items-center justify-between bg-tg-secondary-bg rounded-xl overflow-hidden">
                        <button
                          onClick={() => {
                            if (cartItem.quantity <= 1) {
                              removeFromCart(cartItem.id);
                            } else {
                              updateQuantity(cartItem.id, cartItem.quantity - 1);
                            }
                          }}
                          className="px-3 py-2 text-tg-button font-bold text-lg"
                        >
                          -
                        </button>
                        <span className="text-sm font-semibold text-tg-text">{cartItem.quantity}</span>
                        <button
                          onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                          className="px-3 py-2 text-tg-button font-bold text-lg"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product.id)}
                        className="w-full py-2 bg-tg-button text-tg-button-text rounded-xl text-sm font-medium active:scale-[0.97] transition-transform"
                      >
                        В корзину
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CartBadge />
    </div>
  );
}
