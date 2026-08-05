/**
 * Una voce della lista della spesa condivisa.
 * Rispecchia l'entità backend VoceSpesa (Modulo 1 — Spesa & Dispensa).
 */
export interface VoceSpesa {
  id?: number;
  nome: string;
  quantita?: number | null;
  /** true = già presa/comprata. */
  presa: boolean;
  /** Chi l'ha aggiunta (provvisorio, in attesa del modulo Utenti & Famiglia). */
  aggiuntoDa?: string | null;
  createdAt?: string;
}
