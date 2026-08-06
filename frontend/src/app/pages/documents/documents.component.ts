import { Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ALLOWED_UPLOAD_TYPES,
  DOCUMENT_CATEGORIES,
  DocumentCategory,
  HmDocument,
} from '../../models/document.model';
import { daysUntilDue, dueColorClass } from '../../models/deadline.model';
import { DocumentService } from '../../services/document.service';

interface DocForm {
  name: string;
  category: DocumentCategory;
  expiryDate: string;
  notes: string;
}

function emptyForm(): DocForm {
  return { name: '', category: 'OTHER', expiryDate: '', notes: '' };
}

/**
 * 📄 Documents & Maintenance: upload household documents (PDF/images), keep
 * an optional renewal date, download and manage them.
 */
@Component({
  selector: 'app-documents',
  imports: [FormsModule],
  template: `
    <section>
      <h2 class="mb-4 text-xl font-bold">📄 Documents</h2>

      <!-- Upload / edit form -->
      <form (ngSubmit)="submit()" class="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        @if (editingId() !== null) {
          <p class="text-sm font-semibold text-emerald-700">✏️ Editing details</p>
        }
        @if (editingId() === null) {
          <input
            #fileInput
            type="file"
            name="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
            (change)="onFileSelected($event)"
            aria-label="File"
            class="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-white"
          />
        }
        <input
          type="text"
          name="name"
          [(ngModel)]="form.name"
          placeholder="Name (e.g. Car insurance policy)"
          autocomplete="off"
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <div class="flex gap-2">
          <select
            name="category"
            [(ngModel)]="form.category"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            @for (cat of categories; track cat.value) {
              <option [ngValue]="cat.value">{{ cat.icon }} {{ cat.label }}</option>
            }
          </select>
          <input
            type="date"
            name="expiryDate"
            [(ngModel)]="form.expiryDate"
            aria-label="Renewal date"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <input
          type="text"
          name="notes"
          [(ngModel)]="form.notes"
          placeholder="Notes (optional)"
          autocomplete="off"
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <div class="flex gap-2">
          <button
            type="submit"
            [disabled]="uploading() || !canSubmit()"
            class="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
          >
            {{ editingId() === null ? (uploading() ? 'Uploading…' : 'Upload document') : 'Save changes' }}
          </button>
          @if (editingId() !== null) {
            <button
              type="button"
              class="shrink-0 rounded-xl border border-slate-300 px-4 py-2.5 font-medium text-slate-600 transition-colors hover:bg-slate-100"
              (click)="cancelEdit()"
            >
              Cancel
            </button>
          }
        </div>
      </form>

      @if (error()) {
        <p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error() }}</p>
      }

      @if (loading()) {
        <p class="py-8 text-center text-slate-400">Loading…</p>
      } @else if (documents().length) {
        <ul class="space-y-2">
          @for (d of documents(); track d.id) {
            <li class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <span class="text-2xl" aria-hidden="true">{{ icon(d.category) }}</span>
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium">{{ d.name }}</p>
                <p class="truncate text-xs text-slate-500">
                  {{ label(d.category) }} · {{ formatSize(d.sizeBytes) }}
                </p>
                @if (d.expiryDate) {
                  <p class="mt-0.5 text-xs font-medium" [class]="renewalColor(d)">🔁 Renewal: {{ d.expiryDate }}</p>
                }
              </div>
              <div class="flex shrink-0 items-center gap-1">
                <a
                  [href]="fileUrl(d)"
                  target="_blank"
                  rel="noopener"
                  class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                  [attr.aria-label]="'Download ' + d.name"
                  title="Download"
                >
                  ⬇️
                </a>
                <button type="button" class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" (click)="startEdit(d)" [attr.aria-label]="'Edit ' + d.name">✏️</button>
                <button type="button" class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600" (click)="remove(d)" [attr.aria-label]="'Remove ' + d.name">🗑️</button>
              </div>
            </li>
          }
        </ul>
      } @else {
        <p class="py-8 text-center text-slate-400">No documents yet. Upload your first one! 📄</p>
      }
    </section>
  `,
})
export class DocumentsComponent implements OnInit {
  private readonly service = inject(DocumentService);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly categories = DOCUMENT_CATEGORIES;
  protected form: DocForm = emptyForm();
  protected readonly editingId = signal<number | null>(null);
  private selectedFile: File | null = null;

  protected readonly documents = signal<HmDocument[]>([]);
  protected readonly loading = signal(true);
  protected readonly uploading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (docs) => {
        this.documents.set(docs);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load documents. Is the backend running?');
        this.loading.set(false);
      },
    });
  }

  protected icon(c: DocumentCategory): string {
    return DOCUMENT_CATEGORIES.find((x) => x.value === c)?.icon ?? '📄';
  }

  protected label(c: DocumentCategory): string {
    return DOCUMENT_CATEGORIES.find((x) => x.value === c)?.label ?? 'Other';
  }

  protected fileUrl(d: HmDocument): string {
    return d.id != null ? this.service.fileUrl(d.id) : '';
  }

  protected renewalColor(d: HmDocument): string {
    return dueColorClass(daysUntilDue(d.expiryDate));
  }

  protected formatSize(bytes: number | undefined): string {
    const b = bytes ?? 0;
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.error.set(null);
    if (file && !ALLOWED_UPLOAD_TYPES.includes(file.type)) {
      this.error.set('Unsupported file type (allowed: PDF, PNG, JPEG, WEBP).');
      this.selectedFile = null;
      input.value = '';
      return;
    }
    this.selectedFile = file;
    // Prefill the name from the filename if empty
    if (file && !this.form.name.trim()) {
      this.form.name = file.name.replace(/\.[^.]+$/, '');
    }
  }

  protected canSubmit(): boolean {
    if (!this.form.name.trim()) return false;
    return this.editingId() !== null || this.selectedFile !== null;
  }

  protected startEdit(d: HmDocument): void {
    this.editingId.set(d.id ?? null);
    this.form = {
      name: d.name,
      category: d.category,
      expiryDate: d.expiryDate ?? '',
      notes: d.notes ?? '',
    };
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.form = emptyForm();
    this.selectedFile = null;
  }

  protected submit(): void {
    if (!this.canSubmit()) return;
    this.error.set(null);
    const id = this.editingId();

    if (id !== null) {
      const payload: HmDocument = {
        name: this.form.name.trim(),
        category: this.form.category,
        expiryDate: this.form.expiryDate || null,
        notes: this.form.notes.trim() || null,
      };
      this.service.updateMetadata(id, payload).subscribe({
        next: (saved) => {
          this.documents.update((list) => list.map((d) => (d.id === saved.id ? saved : d)));
          this.cancelEdit();
        },
        error: () => this.error.set('Could not save changes. Please try again.'),
      });
      return;
    }

    const file = this.selectedFile;
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('name', this.form.name.trim());
    fd.append('category', this.form.category);
    if (this.form.expiryDate) fd.append('expiryDate', this.form.expiryDate);
    if (this.form.notes.trim()) fd.append('notes', this.form.notes.trim());

    this.uploading.set(true);
    this.service.upload(fd).subscribe({
      next: (saved) => {
        this.documents.update((list) => [saved, ...list]);
        this.form = emptyForm();
        this.selectedFile = null;
        const input = this.fileInput()?.nativeElement;
        if (input) input.value = '';
        this.uploading.set(false);
      },
      error: () => {
        this.uploading.set(false);
        this.error.set('Could not upload the document. Please try again.');
      },
    });
  }

  protected remove(d: HmDocument): void {
    if (d.id == null) return;
    if (this.editingId() === d.id) this.cancelEdit();
    this.service.remove(d.id).subscribe({
      next: () => this.documents.update((list) => list.filter((x) => x.id !== d.id)),
      error: () => this.error.set('Could not remove the document. Please try again.'),
    });
  }
}
