/**
 * Categoria di un prodotto della dispensa.
 * Allineata all'enum backend com.homemanager.pantry.model.Categoria.
 */
export type Categoria = 'FRESCO' | 'DISPENSA' | 'SURGELATO' | 'BEVANDE' | 'ALTRO';

export const CATEGORIE: { valore: Categoria; etichetta: string }[] = [
  { valore: 'FRESCO', etichetta: 'Fresco' },
  { valore: 'DISPENSA', etichetta: 'Dispensa' },
  { valore: 'SURGELATO', etichetta: 'Surgelato' },
  { valore: 'BEVANDE', etichetta: 'Bevande' },
  { valore: 'ALTRO', etichetta: 'Altro' },
];

/**
 * Un prodotto presente in dispensa/frigo.
 * Rispecchia l'entità backend Prodotto (Modulo 1 — Spesa & Dispensa).
 */
export interface Prodotto {
  id?: number;
  nome: string;
  quantita?: number | null;
  /** Unità di misura: "pz", "L", "kg"... */
  unita?: string | null;
  categoria: Categoria;
  /** Data di scadenza in formato ISO (yyyy-MM-dd), opzionale. */
  dataScadenza?: string | null;
  createdAt?: string;
}
