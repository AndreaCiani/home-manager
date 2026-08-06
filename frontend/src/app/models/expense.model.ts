export type ExpenseCategory =
  | 'GROCERIES'
  | 'UTILITIES'
  | 'RENT'
  | 'TRANSPORT'
  | 'HEALTH'
  | 'LEISURE'
  | 'OTHER';

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'GROCERIES', label: 'Groceries', icon: '🛒' },
  { value: 'UTILITIES', label: 'Utilities', icon: '💡' },
  { value: 'RENT', label: 'Rent', icon: '🏠' },
  { value: 'TRANSPORT', label: 'Transport', icon: '🚗' },
  { value: 'HEALTH', label: 'Health', icon: '🏥' },
  { value: 'LEISURE', label: 'Leisure', icon: '🎉' },
  { value: 'OTHER', label: 'Other', icon: '💶' },
];

/**
 * A household expense.
 * Mirrors the backend Expense entity (Module 5 — Household Budget).
 */
export interface Expense {
  id?: number;
  description: string;
  amount: number;
  category: ExpenseCategory;
  /** ISO date (yyyy-MM-dd). */
  date: string;
  paidByUserId?: number | null;
  paidByName?: string | null;
  createdAt?: string;
}

export interface CategoryTotal {
  category: ExpenseCategory;
  total: number;
}

export interface ExpenseSummary {
  month: string;
  total: number;
  byCategory: CategoryTotal[];
}
