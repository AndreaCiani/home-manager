import { daysToExpiry } from './expiry.util';

export type DeadlineCategory = 'BILL' | 'TAX' | 'INSURANCE' | 'SUBSCRIPTION' | 'INSPECTION' | 'OTHER';
export type Recurrence = 'NONE' | 'MONTHLY' | 'YEARLY';

export const DEADLINE_CATEGORIES: { value: DeadlineCategory; label: string; icon: string }[] = [
  { value: 'BILL', label: 'Bill', icon: '🧾' },
  { value: 'TAX', label: 'Tax', icon: '🏛️' },
  { value: 'INSURANCE', label: 'Insurance', icon: '🛡️' },
  { value: 'SUBSCRIPTION', label: 'Subscription', icon: '🔁' },
  { value: 'INSPECTION', label: 'Inspection', icon: '🔧' },
  { value: 'OTHER', label: 'Other', icon: '📌' },
];

export const RECURRENCES: { value: Recurrence; label: string }[] = [
  { value: 'NONE', label: 'One-off' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
];

/**
 * A household deadline or bill.
 * Mirrors the backend Deadline entity (Module 3 — Deadlines & Bills).
 */
export interface Deadline {
  id?: number;
  title: string;
  amount?: number | null;
  /** Due date in ISO format (yyyy-MM-dd). */
  dueDate: string;
  category: DeadlineCategory;
  recurrence: Recurrence;
  paid: boolean;
  notes?: string | null;
  createdAt?: string;
}

/** Days until the due date (negative = overdue), or null if unset. */
export function daysUntilDue(dueDate: string | null | undefined): number | null {
  return daysToExpiry(dueDate);
}

/** Human-readable label such as "Due in 3 days" / "Overdue by 2 days". */
export function dueLabel(days: number | null): string | null {
  if (days === null) return null;
  if (days < 0) return `Overdue by ${-days} ${-days === 1 ? 'day' : 'days'}`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
}

/** Tailwind text-color class reflecting urgency. */
export function dueColorClass(days: number | null): string {
  if (days === null) return '';
  if (days < 0) return 'text-red-600';
  if (days <= 7) return 'text-amber-600';
  return 'text-slate-500';
}
