import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore, Product } from '../store/app-store';
import { useTelegram } from '../hooks/useTelegram';
import { formatPrice } from '../lib/format';
import { Loader } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/ErrorState';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { backButton, hapticFeedback } = useTelegram();
  const { fetchProduct, cart, addToCart, updateQuantity, removeFromCart } = useAppStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!productId) return;
      setLoading(true);
      try {
        const p = await fetchProduct(productId);
        setProduct(p);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId, fetchProduct]);

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

  const cartItem = useMemo(() => {
    if (!cart?.items || !productId) return null;
    return cart.items.find((item) => item.productId === productId) || null;
  }, [cart, productId]);

  const handleAddToCart = async () => {
    if (!productId) return;
    hapticFeedback('impact', 'medium');
    await addToCart(productId);
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!product) return <ErrorState message="Товар не найден" />;

  return (
    <div className="min-h-screen bg-tg-bg">
      {/* Back button */}
      <div className="sticky top-0 z-10 bg-tg-bg/80 backdrop-blur-sm px-4 py-3 border-b border-black/5">
        <button onClick={() => navigate(-1)} className="text-tg-button flex items-center gap-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="text-sm">Назад</span>
        </button>
      </div>

      {/* Product Image */}
      <div className="w-full aspect-square bg-tg-secondary-bg">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-20 h-20 text-tg-hint/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-4 py-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-tg-text">{product.name}</h1>
          <Badge variant={product.inStock ? 'success' : 'error'} size="md">
            {product.inStock ? 'В наличии' : 'Нет в наличии'}
          </Badge>
        </div>

        {product.description && (
          <p className="text-sm text-tg-hint mt-3 leading-relaxed">{product.description}</p>
        )}

        {product.unit && (
          <p className="text-sm text-tg-hint mt-2">{product.unit}</p>
        )}

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-tg-text">{formatPrice(product.price)}</span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-lg text-tg-hint line-through">{formatPrice(product.oldPrice)}</span>
          )}
          {product.oldPrice && product.oldPrice > product.price && (
            <Badge variant="error" size="md">
              -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
            </Badge>
          )}
        </div>

        {/* Add to Cart */}
        <div className="mt-6">
          {!product.inStock ? (
            <Button variant="secondary" fullWidth disabled>
              Нет в наличии
            </Button>
          ) : cartItem ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-tg-secondary-bg rounded-xl overflow-hidden flex-1">
                <button
                  onClick={() => {
                    if (cartItem.quantity <= 1) {
                      removeFromCart(cartItem.id);
                    } else {
                      updateQuantity(cartItem.id, cartItem.quantity - 1);
                    }
                    hapticFeedback('selection');
                  }}
                  className="px-5 py-3 text-tg-button font-bold text-xl"
                >
                  -
                </button>
                <span className="flex-1 text-center text-lg font-semibold text-tg-text">{cartItem.quantity}</span>
                <button
                  onClick={() => {
                    updateQuantity(cartItem.id, cartItem.quantity + 1);
                    hapticFeedback('selection');
                  }}
                  className="px-5 py-3 text-tg-button font-bold text-xl"
                >
                  +
                </button>
              </div>
              <Button variant="primary" onClick={() => navigate('/cart')}>
                В корзину
              </Button>
            </div>
          ) : (
            <Button variant="primary" fullWidth size="lg" onClick={handleAddToCart}>
              Добавить в корзину - {formatPrice(product.price)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
