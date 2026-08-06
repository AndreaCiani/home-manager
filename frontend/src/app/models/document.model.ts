export type DocumentCategory =
  | 'IDENTITY'
  | 'INSURANCE'
  | 'WARRANTY'
  | 'CONTRACT'
  | 'MANUAL'
  | 'MEDICAL'
  | 'OTHER';

export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string; icon: string }[] = [
  { value: 'IDENTITY', label: 'Identity', icon: '🪪' },
  { value: 'INSURANCE', label: 'Insurance', icon: '🛡️' },
  { value: 'WARRANTY', label: 'Warranty', icon: '🧾' },
  { value: 'CONTRACT', label: 'Contract', icon: '📃' },
  { value: 'MANUAL', label: 'Manual', icon: '📖' },
  { value: 'MEDICAL', label: 'Medical', icon: '🏥' },
  { value: 'OTHER', label: 'Other', icon: '📄' },
];

/** Allowed upload types (kept in sync with the backend). */
export const ALLOWED_UPLOAD_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

/**
 * A stored household document (metadata only; the file is downloaded separately).
 * Mirrors the backend Document entity (Module 6 — Documents & Maintenance).
 */
export interface HmDocument {
  id?: number;
  name: string;
  category: DocumentCategory;
  /** Optional renewal / maintenance date (ISO yyyy-MM-dd). */
  expiryDate?: string | null;
  notes?: string | null;
  originalFilename?: string;
  contentType?: string;
  sizeBytes?: number;
  createdAt?: string;
}
