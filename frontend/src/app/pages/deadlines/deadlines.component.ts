import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  DEADLINE_CATEGORIES,
  Deadline,
  DeadlineCategory,
  RECURRENCES,
  Recurrence,
  daysUntilDue,
  dueColorClass,
  dueLabel,
} from '../../models/deadline.model';
import { DeadlineService } from '../../services/deadline.service';

interface DeadlineForm {
  title: string;
  amount: number | null;
  dueDate: string;
  category: DeadlineCategory;
  recurrence: Recurrence;
  notes: string;
}

function emptyForm(): DeadlineForm {
  return { title: '', amount: null, dueDate: '', category: 'BILL', recurrence: 'NONE', notes: '' };
}

/** Deadlines due within this many days (incl. overdue) count as "due soon". */
const DUE_SOON_DAYS = 30;

/**
 * 📅 Deadlines & Bills: reminders for car tax, insurance, bills, inspections…
 * Overdue and soon-due items are highlighted; recurring ones roll forward
 * to their next occurrence when marked paid.
 */
@Component({
  selector: 'app-deadlines',
  imports: [FormsModule, NgTemplateOutlet],
  template: `
    <section>
      <h2 class="mb-4 text-xl font-bold">📅 Deadlines &amp; Bills</h2>

      <!-- Add / edit form -->
      <form (ngSubmit)="submit()" class="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        @if (editingId() !== null) {
          <p class="text-sm font-semibold text-emerald-700">✏️ Editing deadline</p>
        }
        <input
          type="text"
          name="title"
          [(ngModel)]="form.title"
          placeholder="Title (e.g. Car insurance)"
          autocomplete="off"
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <div class="flex gap-2">
          <input
            type="number"
            name="amount"
            [(ngModel)]="form.amount"
            placeholder="Amount (€, optional)"
            min="0"
            step="any"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <input
            type="date"
            name="dueDate"
            [(ngModel)]="form.dueDate"
            aria-label="Due date"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div class="flex gap-2">
          <select
            name="category"
            [(ngModel)]="form.category"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            @for (cat of categories; track cat.value) {
              <option [value]="cat.value">{{ cat.icon }} {{ cat.label }}</option>
            }
          </select>
          <select
            name="recurrence"
            [(ngModel)]="form.recurrence"
            aria-label="Recurrence"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            @for (rec of recurrences; track rec.value) {
              <option [value]="rec.value">{{ rec.label }}</option>
            }
          </select>
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
            [disabled]="!form.title.trim() || !form.dueDate"
            class="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
          >
            {{ editingId() === null ? 'Add deadline' : 'Save changes' }}
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
      } @else {
        @if (dueSoon().length) {
          <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-600">
            ⏰ Due soon ({{ dueSoon().length }})
          </h3>
          <ul class="mb-6 space-y-2">
            @for (d of dueSoon(); track d.id) {
              <ng-container [ngTemplateOutlet]="row" [ngTemplateOutletContext]="{ $implicit: d }" />
            }
          </ul>
        }

        @if (deadlines().length) {
          <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            All deadlines ({{ deadlines().length }})
          </h3>
          <ul class="space-y-2">
            @for (d of deadlines(); track d.id) {
              <ng-container [ngTemplateOutlet]="row" [ngTemplateOutletContext]="{ $implicit: d }" />
            }
          </ul>
        } @else {
          <p class="py-8 text-center text-slate-400">No deadlines yet. Add your first one! 📅</p>
        }
      }

      <!-- Row template -->
      <ng-template #row let-d>
        <li class="flex items-start gap-3 rounded-xl border bg-white p-3" [class]="border(d)">
          <span class="text-2xl" aria-hidden="true">{{ icon(d) }}</span>
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium" [class.line-through]="d.paid" [class.opacity-50]="d.paid">
              {{ d.title }}
            </p>
            <p class="text-xs text-slate-500">
              {{ categoryLabel(d) }}
              @if (d.amount) { · € {{ d.amount }} }
              @if (d.recurrence !== 'NONE') { · {{ d.recurrence === 'MONTHLY' ? 'monthly' : 'yearly' }} }
            </p>
            @if (d.paid) {
              <p class="mt-1 text-xs font-medium text-emerald-600">✓ Paid</p>
            } @else {
              <p class="mt-1 text-xs font-medium" [class]="dueColor(d)">📅 {{ dueText(d) }}</p>
            }
          </div>
          <div class="flex shrink-0 flex-col items-end gap-1">
            @if (!d.paid) {
              <button
                type="button"
                class="rounded-lg border border-emerald-300 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
                (click)="pay(d)"
              >
                Mark paid
              </button>
            }
            <div class="flex gap-1">
              <button
                type="button"
                class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                (click)="startEdit(d)"
                [attr.aria-label]="'Edit ' + d.title"
              >
                ✏️
              </button>
              <button
                type="button"
                class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                (click)="remove(d)"
                [attr.aria-label]="'Remove ' + d.title"
              >
                🗑️
              </button>
            </div>
          </div>
        </li>
      </ng-template>
    </section>
  `,
})
export class DeadlinesComponent implements OnInit {
  private readonly service = inject(DeadlineService);

  protected readonly categories = DEADLINE_CATEGORIES;
  protected readonly recurrences = RECURRENCES;
  protected form: DeadlineForm = emptyForm();
  protected readonly editingId = signal<number | null>(null);

  protected readonly deadlines = signal<Deadline[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  /** Unpaid deadlines due within the window (including overdue), soonest first. */
  protected readonly dueSoon = computed(() =>
    this.deadlines().filter((d) => {
      if (d.paid) return false;
      const days = daysUntilDue(d.dueDate);
      return days !== null && days <= DUE_SOON_DAYS;
    }),
  );

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (list) => {
        this.deadlines.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load deadlines. Is the backend running?');
        this.loading.set(false);
      },
    });
  }

  protected icon(d: Deadline): string {
    return DEADLINE_CATEGORIES.find((c) => c.value === d.category)?.icon ?? '📌';
  }

  protected categoryLabel(d: Deadline): string {
    return DEADLINE_CATEGORIES.find((c) => c.value === d.category)?.label ?? 'Other';
  }

  protected dueText(d: Deadline): string {
    return dueLabel(daysUntilDue(d.dueDate)) ?? '';
  }

  protected dueColor(d: Deadline): string {
    return dueColorClass(daysUntilDue(d.dueDate));
  }

  protected border(d: Deadline): string {
    if (d.paid) return 'border-slate-200';
    const days = daysUntilDue(d.dueDate);
    if (days === null) return 'border-slate-200';
    if (days < 0) return 'border-red-300';
    if (days <= 7) return 'border-amber-300';
    return 'border-slate-200';
  }

  protected startEdit(d: Deadline): void {
    this.editingId.set(d.id ?? null);
    this.form = {
      title: d.title,
      amount: d.amount ?? null,
      dueDate: d.dueDate,
      category: d.category,
      recurrence: d.recurrence,
      notes: d.notes ?? '',
    };
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.form = emptyForm();
  }

  protected submit(): void {
    const title = this.form.title.trim();
    if (!title || !this.form.dueDate) return;
    this.error.set(null);
    const payload: Deadline = {
      title,
      amount: this.form.amount ?? null,
      dueDate: this.form.dueDate,
      category: this.form.category,
      recurrence: this.form.recurrence,
      paid: false,
      notes: this.form.notes.trim() || null,
    };
    const id = this.editingId();
    if (id !== null) {
      // Preserve the current paid state when editing.
      const existing = this.deadlines().find((d) => d.id === id);
      payload.paid = existing?.paid ?? false;
      this.service.update(id, payload).subscribe({
        next: (saved) => {
          this.deadlines.update((list) => list.map((d) => (d.id === saved.id ? saved : d)));
          this.cancelEdit();
        },
        error: () => this.error.set('Could not save changes. Please try again.'),
      });
    } else {
      this.service.add(payload).subscribe({
        next: (saved) => {
          this.deadlines.update((list) => this.sorted([...list, saved]));
          this.form = emptyForm();
        },
        error: () => this.error.set('Could not add the deadline. Please try again.'),
      });
    }
  }

  protected pay(d: Deadline): void {
    if (d.id == null) return;
    this.service.pay(d.id).subscribe({
      next: (saved) => this.deadlines.update((list) => this.sorted(list.map((x) => (x.id === saved.id ? saved : x)))),
      error: () => this.error.set('Could not update the deadline. Please try again.'),
    });
  }

  protected remove(d: Deadline): void {
    if (d.id == null) return;
    if (this.editingId() === d.id) this.cancelEdit();
    this.service.remove(d.id).subscribe({
      next: () => this.deadlines.update((list) => list.filter((x) => x.id !== d.id)),
      error: () => this.error.set('Could not remove the deadline. Please try again.'),
    });
  }

  private sorted(list: Deadline[]): Deadline[] {
    return [...list].sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));
  }
}
