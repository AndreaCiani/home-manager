export type ChoreRecurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export const CHORE_RECURRENCES: { value: ChoreRecurrence; label: string }[] = [
  { value: 'NONE', label: 'One-off' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

/**
 * A household chore, optionally assigned and recurring.
 * Mirrors the backend Chore entity (Module 4 — Household Chores).
 */
export interface Chore {
  id?: number;
  title: string;
  assigneeUserId?: number | null;
  assigneeName?: string | null;
  dueDate?: string | null;
  recurrence: ChoreRecurrence;
  done: boolean;
  createdAt?: string;
}
