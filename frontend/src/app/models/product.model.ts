/**
 * Category of a pantry product.
 * Mirrors the backend enum com.homemanager.pantry.model.Category.
 */
export type Category = 'FRESH' | 'PANTRY' | 'FROZEN' | 'BEVERAGES' | 'OTHER';

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'FRESH', label: 'Fresh' },
  { value: 'PANTRY', label: 'Pantry' },
  { value: 'FROZEN', label: 'Frozen' },
  { value: 'BEVERAGES', label: 'Beverages' },
  { value: 'OTHER', label: 'Other' },
];

/**
 * A product stored in the pantry/fridge.
 * Mirrors the backend Product entity (Module 1 — Shopping & Pantry).
 */
export interface Product {
  id?: number;
  name: string;
  quantity?: number | null;
  /** Unit of measure: "pcs", "L", "kg"... */
  unit?: string | null;
  category: Category;
  /** Expiry date in ISO format (yyyy-MM-dd), optional. */
  expiryDate?: string | null;
  createdAt?: string;
}
