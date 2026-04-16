/**
 * Format price in rubles with currency symbol.
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Format date to human-readable Russian format.
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/**
 * Format date and time.
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format relative time (e.g., "5 минут назад").
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'только что';
  if (diffMinutes < 60) return `${diffMinutes} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return formatDate(d);
}

/**
 * Format phone number for display.
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  }
  return phone;
}

/**
 * Pluralize Russian words.
 */
export function pluralize(count: number, one: string, few: string, many: string): string {
  const abs = Math.abs(count);
  const lastTwo = abs % 100;
  const lastOne = abs % 10;

  if (lastTwo >= 11 && lastTwo <= 19) return `${count} ${many}`;
  if (lastOne === 1) return `${count} ${one}`;
  if (lastOne >= 2 && lastOne <= 4) return `${count} ${few}`;
  return `${count} ${many}`;
}

/**
 * Get order status label in Russian.
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NEW: 'Новый',
    CONFIRMED: 'Подтверждён',
    ASSEMBLING: 'Собирается',
    AWAITING_SUBSTITUTION_DECISION: 'Ожидание замены',
    READY_FOR_DELIVERY: 'Готов к доставке',
    ASSIGNED_TO_COURIER: 'Назначен курьер',
    IN_DELIVERY: 'В доставке',
    DELIVERED: 'Доставлен',
    CANCELLED: 'Отменён',
  };
  return labels[status] || status;
}

/**
 * Get status color class.
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-800',
    CONFIRMED: 'bg-indigo-100 text-indigo-800',
    ASSEMBLING: 'bg-yellow-100 text-yellow-800',
    AWAITING_SUBSTITUTION_DECISION: 'bg-orange-100 text-orange-800',
    READY_FOR_DELIVERY: 'bg-teal-100 text-teal-800',
    ASSIGNED_TO_COURIER: 'bg-purple-100 text-purple-800',
    IN_DELIVERY: 'bg-violet-100 text-violet-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
