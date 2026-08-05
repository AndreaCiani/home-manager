/**
 * An item on the shared shopping list.
 * Mirrors the backend ShoppingItem entity (Module 1 — Shopping & Pantry).
 */
export interface ShoppingItem {
  id?: number;
  name: string;
  quantity?: number | null;
  /** true = already bought/picked up. */
  purchased: boolean;
  /** Who added it (temporary, pending the Users & Family module). */
  addedBy?: string | null;
  createdAt?: string;
}
