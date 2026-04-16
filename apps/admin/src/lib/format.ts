/**
 * Format price from cents to rubles string.
 */
export function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace(/\.?0+$/, '') + ' \u20BD';
}

/**
 * Parse price string in rubles to cents.
 */
export function priceToCents(rubles: string | number): number {
  const num = typeof rubles === 'string' ? parseFloat(rubles) : rubles;
  return Math.round(num * 100);
}

/**
 * Format date string to locale string.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format short date (no time).
 */
export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Get status badge color classes.
 */
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    ARCHIVED: 'bg-gray-100 text-gray-500',
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    ASSEMBLING: 'bg-blue-100 text-blue-800',
    READY_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
    IN_DELIVERY: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    AVAILABLE: 'bg-green-100 text-green-800',
    UNAVAILABLE: 'bg-red-100 text-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Human-readable status labels.
 */
export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    ARCHIVED: 'Archived',
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    ASSEMBLING: 'Assembling',
    READY_FOR_DELIVERY: 'Ready for Delivery',
    IN_DELIVERY: 'In Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    SUPER_ADMIN: 'Super Admin',
    STORE_MANAGER: 'Store Manager',
    STORE_OPERATOR: 'Store Operator',
    CATALOG_MANAGER: 'Catalog Manager',
  };
  return map[status] || status;
}

/**
 * Day names for working hours.
 */
export const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;
