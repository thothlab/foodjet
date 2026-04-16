import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/app-store';
import { formatPrice } from '../lib/format';
import { Loader } from '../components/ui/Loader';
import { EmptyState } from '../components/ui/EmptyState';

export function SearchPage() {
  const navigate = useNavigate();
  const { searchResults, searchLoading, searchProducts, cart, addToCart, updateQuantity, removeFromCart } =
    useAppStore();
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const debouncedSearch = useCallback(
    (q: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        if (q.trim().length >= 2) {
          searchProducts(q.trim());
          setHasSearched(true);
        }
      }, 400);
    },
    [searchProducts],
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim().length >= 2) {
      debouncedSearch(value);
    } else {
      setHasSearched(false);
    }
  };

  const cartItemMap = useMemo(() => {
    const map: Record<string, { id: string; quantity: number }> = {};
    if (cart?.items) {
      cart.items.forEach((item) => {
        map[item.productId] = { id: item.id, quantity: item.quantity };
      });
    }
    return map;
  }, [cart]);

  return (
    <div className="min-h-screen bg-tg-secondary-bg">
      {/* Search Header */}
      <div className="bg-tg-bg px-4 pt-4 pb-3 sticky top-0 z-10 border-b border-black/5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-tg-button p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tg-hint"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Найти товар..."
              className="w-full pl-10 pr-4 py-2.5 bg-tg-secondary-bg text-tg-text placeholder-tg-hint rounded-xl outline-none text-sm"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setHasSearched(false);
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-tg-hint"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        {searchLoading && (
          <div className="flex justify-center py-8">
            <Loader size="md" />
          </div>
        )}

        {!searchLoading && !hasSearched && (
          <EmptyState
            title="Введите запрос"
            description="Начните вводить название товара для поиска"
            icon={
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            }
          />
        )}

        {!searchLoading && hasSearched && searchResults.length === 0 && (
          <EmptyState
            title="Ничего не найдено"
            description={`По запросу "${query}" товаров не найдено`}
            icon={
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            }
          />
        )}

        {!searchLoading && searchResults.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {searchResults.map((product) => {
              const cartItem = cartItemMap[product.id];
              const inCart = !!cartItem;

              return (
                <div
                  key={product.id}
                  className="bg-tg-bg rounded-2xl overflow-hidden shadow-sm border border-black/5"
                >
                  <div
                    className="w-full h-32 bg-tg-secondary-bg cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-tg-hint/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3
                      className="text-sm font-medium text-tg-text line-clamp-2 min-h-[2.5rem] cursor-pointer"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-base font-bold text-tg-text">{formatPrice(product.price)}</span>
                      {product.oldPrice && product.oldPrice > product.price && (
                        <span className="text-xs text-tg-hint line-through">{formatPrice(product.oldPrice)}</span>
                      )}
                    </div>
                    <div className="mt-3">
                      {!product.inStock ? (
                        <span className="text-xs text-tg-hint">Нет в наличии</span>
                      ) : inCart ? (
                        <div className="flex items-center justify-between bg-tg-secondary-bg rounded-xl overflow-hidden">
                          <button
                            onClick={() => {
                              if (cartItem.quantity <= 1) removeFromCart(cartItem.id);
                              else updateQuantity(cartItem.id, cartItem.quantity - 1);
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
      </div>
    </div>
  );
}
