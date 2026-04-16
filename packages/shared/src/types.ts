/**
 * Standard API error response envelope.
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    validationErrors?: Array<{
      field: string;
      message: string;
    }>;
  };
  correlationId?: string;
}

/**
 * Standard paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Store bootstrap response for Mini App.
 */
export interface StoreBootstrap {
  store: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    status: string;
    isOpen: boolean;
    closeMessage?: string;
  };
  settings: {
    deliveryText: string | null;
    cashPaymentMessage: string | null;
    supportPhone: string | null;
    supportTelegram: string | null;
    noticeText: string | null;
    minOrderAmount: number | null;
  };
}

/**
 * Substitution policy options for checkout.
 */
export type SubstitutionPolicy = 'ALLOW' | 'CONTACT_ME' | 'DO_NOT_SUBSTITUTE';

/**
 * Checkout placement request.
 */
export interface PlaceOrderRequest {
  addressId?: string;
  inlineAddress?: {
    street: string;
    entrance?: string;
    floor?: string;
    apartment?: string;
    comment?: string;
  };
  contactPhone: string;
  contactName: string;
  orderComment?: string;
  substitutionPolicy: SubstitutionPolicy;
}
