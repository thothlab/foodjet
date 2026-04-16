import { create } from 'zustand';
import { get, post, put, del } from '../api/client';

// ── Types ──────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  sortOrder: number;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
  categoryId: string;
  inStock: boolean;
  unit?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  itemsCount: number;
}

export interface Address {
  id: string;
  title: string;
  street: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
  comment?: string;
  isDefault: boolean;
}

export interface OrderHistoryEntry {
  status: string;
  timestamp: string;
  comment?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  total: number;
  itemsCount: number;
  address: Address;
  contactName: string;
  contactPhone: string;
  comment?: string;
  substitutionPolicy: string;
  history: OrderHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreInfo {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  deliveryText?: string;
  noticeBanner?: string;
  workingHours?: string;
  supportPhone?: string;
  supportTelegram?: string;
  categories: Category[];
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  addresses: Address[];
}

// ── Store State ────────────────────────────────────────────────────────

interface AppState {
  // Store info
  storeSlug: string | null;
  storeInfo: StoreInfo | null;
  storeLoading: boolean;
  storeError: string | null;

  // Cart
  cart: Cart | null;
  cartLoading: boolean;

  // Products
  products: Record<string, Product[]>; // categoryId -> products
  productsLoading: boolean;

  // Search
  searchResults: Product[];
  searchLoading: boolean;

  // Orders
  orders: Order[];
  ordersLoading: boolean;

  // Profile
  profile: UserProfile | null;
  profileLoading: boolean;

  // Actions
  setStoreSlug: (slug: string) => void;
  fetchBootstrap: (slug: string) => Promise<void>;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchProducts: (categoryId: string) => Promise<void>;
  fetchProduct: (productId: string) => Promise<Product>;
  searchProducts: (query: string) => Promise<void>;
  createOrder: (data: CreateOrderData) => Promise<Order>;
  fetchOrders: () => Promise<void>;
  fetchOrder: (orderId: string) => Promise<Order>;
  reorderFromOrder: (orderId: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { firstName: string; lastName?: string; phone?: string }) => Promise<void>;
  fetchAddresses: () => Promise<Address[]>;
  createAddress: (data: CreateAddressData) => Promise<Address>;
  updateAddress: (id: string, data: CreateAddressData) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
}

export interface CreateOrderData {
  addressId?: string;
  address?: {
    street: string;
    entrance?: string;
    floor?: string;
    apartment?: string;
    comment?: string;
  };
  contactName: string;
  contactPhone: string;
  comment?: string;
  substitutionPolicy: 'ALLOW' | 'CONTACT' | 'DENY';
}

export interface CreateAddressData {
  title: string;
  street: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
  comment?: string;
  isDefault?: boolean;
}

// ── Store Implementation ───────────────────────────────────────────────

export const useAppStore = create<AppState>((set, getState) => ({
  // Initial state
  storeSlug: null,
  storeInfo: null,
  storeLoading: false,
  storeError: null,
  cart: null,
  cartLoading: false,
  products: {},
  productsLoading: false,
  searchResults: [],
  searchLoading: false,
  orders: [],
  ordersLoading: false,
  profile: null,
  profileLoading: false,

  setStoreSlug: (slug: string) => set({ storeSlug: slug }),

  fetchBootstrap: async (slug: string) => {
    set({ storeLoading: true, storeError: null });
    try {
      const storeInfo = await get<StoreInfo>(`/stores/${slug}/bootstrap`);
      set({ storeInfo, storeSlug: slug, storeLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load store';
      set({ storeError: message, storeLoading: false });
    }
  },

  fetchCart: async () => {
    const { storeSlug } = getState();
    if (!storeSlug) return;
    set({ cartLoading: true });
    try {
      const cart = await get<Cart>(`/stores/${storeSlug}/cart`);
      set({ cart, cartLoading: false });
    } catch {
      set({ cartLoading: false });
    }
  },

  addToCart: async (productId: string, quantity = 1) => {
    const { storeSlug } = getState();
    if (!storeSlug) return;
    set({ cartLoading: true });
    try {
      const cart = await post<Cart>(`/stores/${storeSlug}/cart/items`, { productId, quantity });
      set({ cart, cartLoading: false });
    } catch {
      set({ cartLoading: false });
    }
  },

  removeFromCart: async (itemId: string) => {
    const { storeSlug } = getState();
    if (!storeSlug) return;
    set({ cartLoading: true });
    try {
      const cart = await del<Cart>(`/stores/${storeSlug}/cart/items/${itemId}`);
      set({ cart, cartLoading: false });
    } catch {
      set({ cartLoading: false });
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    const { storeSlug } = getState();
    if (!storeSlug) return;
    set({ cartLoading: true });
    try {
      const cart = await put<Cart>(`/stores/${storeSlug}/cart/items/${itemId}`, { quantity });
      set({ cart, cartLoading: false });
    } catch {
      set({ cartLoading: false });
    }
  },

  clearCart: async () => {
    const { storeSlug } = getState();
    if (!storeSlug) return;
    set({ cartLoading: true });
    try {
      await del(`/stores/${storeSlug}/cart`);
      set({ cart: null, cartLoading: false });
    } catch {
      set({ cartLoading: false });
    }
  },

  fetchProducts: async (categoryId: string) => {
    const { storeSlug } = getState();
    if (!storeSlug) return;
    set({ productsLoading: true });
    try {
      const products = await get<Product[]>(`/stores/${storeSlug}/categories/${categoryId}/products`);
      set((state) => ({
        products: { ...state.products, [categoryId]: products },
        productsLoading: false,
      }));
    } catch {
      set({ productsLoading: false });
    }
  },

  fetchProduct: async (productId: string) => {
    const { storeSlug } = getState();
    if (!storeSlug) throw new Error('No store');
    return get<Product>(`/stores/${storeSlug}/products/${productId}`);
  },

  searchProducts: async (query: string) => {
    const { storeSlug } = getState();
    if (!storeSlug) return;
    set({ searchLoading: true });
    try {
      const results = await get<Product[]>(`/stores/${storeSlug}/products/search`, { q: query });
      set({ searchResults: results, searchLoading: false });
    } catch {
      set({ searchResults: [], searchLoading: false });
    }
  },

  createOrder: async (data: CreateOrderData) => {
    const { storeSlug } = getState();
    if (!storeSlug) throw new Error('No store');
    const order = await post<Order>(`/stores/${storeSlug}/orders`, data);
    // Refresh cart after order
    set({ cart: null });
    return order;
  },

  fetchOrders: async () => {
    const { storeSlug } = getState();
    if (!storeSlug) return;
    set({ ordersLoading: true });
    try {
      const orders = await get<Order[]>(`/stores/${storeSlug}/orders`);
      set({ orders, ordersLoading: false });
    } catch {
      set({ ordersLoading: false });
    }
  },

  fetchOrder: async (orderId: string) => {
    const { storeSlug } = getState();
    if (!storeSlug) throw new Error('No store');
    return get<Order>(`/stores/${storeSlug}/orders/${orderId}`);
  },

  reorderFromOrder: async (orderId: string) => {
    const { storeSlug } = getState();
    if (!storeSlug) return;
    set({ cartLoading: true });
    try {
      const cart = await post<Cart>(`/stores/${storeSlug}/orders/${orderId}/reorder`);
      set({ cart, cartLoading: false });
    } catch {
      set({ cartLoading: false });
    }
  },

  fetchProfile: async () => {
    set({ profileLoading: true });
    try {
      const profile = await get<UserProfile>('/profile');
      set({ profile, profileLoading: false });
    } catch {
      set({ profileLoading: false });
    }
  },

  updateProfile: async (data) => {
    const profile = await put<UserProfile>('/profile', data);
    set({ profile });
  },

  fetchAddresses: async () => {
    const addresses = await get<Address[]>('/profile/addresses');
    set((state) => ({
      profile: state.profile ? { ...state.profile, addresses } : null,
    }));
    return addresses;
  },

  createAddress: async (data: CreateAddressData) => {
    const address = await post<Address>('/profile/addresses', data);
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, addresses: [...state.profile.addresses, address] }
        : null,
    }));
    return address;
  },

  updateAddress: async (id: string, data: CreateAddressData) => {
    const address = await put<Address>(`/profile/addresses/${id}`, data);
    set((state) => ({
      profile: state.profile
        ? {
            ...state.profile,
            addresses: state.profile.addresses.map((a) => (a.id === id ? address : a)),
          }
        : null,
    }));
    return address;
  },

  deleteAddress: async (id: string) => {
    await del(`/profile/addresses/${id}`);
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, addresses: state.profile.addresses.filter((a) => a.id !== id) }
        : null,
    }));
  },

  setDefaultAddress: async (id: string) => {
    await put(`/profile/addresses/${id}/default`);
    set((state) => ({
      profile: state.profile
        ? {
            ...state.profile,
            addresses: state.profile.addresses.map((a) => ({
              ...a,
              isDefault: a.id === id,
            })),
          }
        : null,
    }));
  },
}));
