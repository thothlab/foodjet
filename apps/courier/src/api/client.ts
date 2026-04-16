const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

function getToken(): string | null {
  return localStorage.getItem('courier_token');
}

export function setToken(token: string) {
  localStorage.setItem('courier_token', token);
}

export function clearToken() {
  localStorage.removeItem('courier_token');
}

export function hasToken(): boolean {
  return !!getToken();
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

/* ---------- Types ---------- */

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
  deliveryComment?: string;
  items: OrderItem[];
  total: number;
  assignedAt: string;
  deliveredAt?: string;
}

export interface CourierProfile {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
  storeName: string;
}

/* ---------- Endpoints ---------- */

export function fetchOrders(): Promise<Order[]> {
  return request<Order[]>('/courier/orders');
}

export function fetchOrder(orderId: string): Promise<Order> {
  return request<Order>(`/courier/orders/${orderId}`);
}

export function transitionOrder(
  orderId: string,
  transition: string,
): Promise<Order> {
  return request<Order>(`/courier/orders/${orderId}/transition`, {
    method: 'POST',
    body: JSON.stringify({ transition }),
  });
}

export function fetchProfile(): Promise<CourierProfile> {
  return request<CourierProfile>('/courier/profile');
}

export function loginWithToken(token: string): Promise<CourierProfile> {
  setToken(token);
  return fetchProfile();
}
