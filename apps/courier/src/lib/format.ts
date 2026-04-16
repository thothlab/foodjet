/**
 * Format price in rubles.
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format relative time since a given ISO date string.
 * Returns strings like "5 мин назад", "1 ч назад", etc.
 */
export function timeAgo(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'только что';
  if (diffMin < 60) return `${diffMin} мин назад`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} ч назад`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} дн назад`;
}

/**
 * Format an ISO date string as HH:MM.
 */
export function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format an ISO date string as DD.MM.YYYY HH:MM.
 */
export function formatDateTime(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate address to the first line (up to the first comma or 40 chars).
 */
export function shortAddress(address: string): string {
  const comma = address.indexOf(',');
  if (comma > 0 && comma <= 50) return address.slice(0, comma);
  if (address.length > 50) return address.slice(0, 47) + '...';
  return address;
}
