// ===========================================
// NeatPC — Utility Functions
// ===========================================

/**
 * Format a number as USD currency
 * @example formatPrice(1499.99) → "$1,499.99"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Generate a URL-safe slug from a string
 * @example slugify("MacBook Air M3 2024") → "macbook-air-m3-2024"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Calculate discount percentage
 * @example getDiscount(1499, 999) → 33
 */
export function getDiscount(original: number, current: number): number {
  if (original <= 0 || current >= original) return 0;
  return Math.round(((original - current) / original) * 100);
}

/**
 * Get a human-readable deal score label
 */
export function getDealLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'Excellent Deal', color: '#22c55e' };
  if (score >= 70) return { label: 'Good Deal', color: '#3b82f6' };
  if (score >= 50) return { label: 'Fair Price', color: '#eab308' };
  return { label: 'Below Average', color: '#ef4444' };
}

/**
 * Truncate text to a max length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

/**
 * Generate a random ID (for client-side use, not crypto-secure)
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Delay execution (useful for debouncing, loading states)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Format a relative time string
 * @example timeAgo(new Date(Date.now() - 3600000)) → "1 hour ago"
 */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}
