/**
 * Shared helpers for product expiry, used by the pantry card and the dashboard.
 */

/** Days left until expiry (negative = already expired), null if no date is set. */
export function daysToExpiry(date: string | null | undefined): number | null {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(date + 'T00:00:00');
  return Math.round((expiry.getTime() - today.getTime()) / 86_400_000);
}

/** Human-readable label such as "Expires in 3 days", or null if no date. */
export function expiryLabel(days: number | null): string | null {
  if (days === null) return null;
  if (days < 0) return `Expired ${-days} ${-days === 1 ? 'day' : 'days'} ago`;
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  return `Expires in ${days} days`;
}

/** Tailwind text-color class reflecting urgency. */
export function expiryColorClass(days: number | null): string {
  if (days === null) return '';
  if (days < 0) return 'text-red-600';
  if (days <= 3) return 'text-amber-600';
  return 'text-slate-500';
}
