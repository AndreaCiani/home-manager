import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { EXPENSE_CATEGORIES, Expense, ExpenseCategory, ExpenseSummary } from '../../models/expense.model';
import { FamilyMember } from '../../models/user.model';
import { ExpenseService } from '../../services/expense.service';
import { FamilyService } from '../../services/family.service';

interface ExpenseForm {
  description: string;
  amount: number | null;
  category: ExpenseCategory;
  date: string;
  paidByUserId: number | null;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm(): ExpenseForm {
  return { description: '', amount: null, category: 'GROCERIES', date: today(), paidByUserId: null };
}

/**
 * 💰 Household Budget: log expenses and see this month's total with a
 * per-category breakdown.
 */
@Component({
  selector: 'app-budget',
  imports: [FormsModule, CurrencyPipe],
  template: `
    <section>
      <h2 class="mb-4 text-xl font-bold">💰 Budget</h2>

      @if (error()) {
        <p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error() }}</p>
      }

      <!-- This month summary -->
      @if (summary(); as s) {
        <div class="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
          <p class="text-xs uppercase tracking-wide text-slate-400">This month ({{ s.month }})</p>
          <p class="text-2xl font-bold text-slate-800">{{ s.total | currency: 'EUR' }}</p>
          @if (s.byCategory.length) {
            <ul class="mt-3 space-y-2">
              @for (c of s.byCategory; track c.category) {
                <li>
                  <div class="mb-1 flex items-center justify-between text-xs text-slate-600">
                    <span>{{ icon(c.category) }} {{ label(c.category) }}</span>
                    <span class="font-medium">{{ c.total | currency: 'EUR' }}</span>
                  </div>
                  <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div class="h-2 rounded-full bg-emerald-500" [style.width.%]="barWidth(c.total)"></div>
                  </div>
                </li>
              }
            </ul>
          } @else {
            <p class="mt-2 text-sm text-slate-400">No expenses this month yet.</p>
          }
        </div>
      }

      <!-- Add / edit form -->
      <form (ngSubmit)="submit()" class="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        @if (editingId() !== null) {
          <p class="text-sm font-semibold text-emerald-700">✏️ Editing expense</p>
        }
        <input
          type="text"
          name="description"
          [(ngModel)]="form.description"
          placeholder="Description (e.g. Groceries)"
          autocomplete="off"
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <div class="flex gap-2">
          <input
            type="number"
            name="amount"
            [(ngModel)]="form.amount"
            placeholder="Amount (€)"
            min="0"
            step="any"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <input
            type="date"
            name="date"
            [(ngModel)]="form.date"
            aria-label="Date"
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
              <option [ngValue]="cat.value">{{ cat.icon }} {{ cat.label }}</option>
            }
          </select>
          <select
            name="paidBy"
            [(ngModel)]="form.paidByUserId"
            aria-label="Paid by"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option [ngValue]="null">Paid by…</option>
            @for (m of members(); track m.id) {
              <option [ngValue]="m.id">{{ m.displayName }}</option>
            }
          </select>
        </div>
        <div class="flex gap-2">
          <button
            type="submit"
            [disabled]="!form.description.trim() || !form.amount || !form.date"
            class="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
          >
            {{ editingId() === null ? 'Add expense' : 'Save changes' }}
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

      @if (loading()) {
        <p class="py-8 text-center text-slate-400">Loading…</p>
      } @else if (expenses().length) {
        <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Recent expenses ({{ expenses().length }})
        </h3>
        <ul class="space-y-2">
          @for (e of expenses(); track e.id) {
            <li class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <span class="text-2xl" aria-hidden="true">{{ icon(e.category) }}</span>
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium">{{ e.description }}</p>
                <p class="text-xs text-slate-500">
                  {{ e.date }}
                  @if (e.paidByName) { · 👤 {{ e.paidByName }} }
                </p>
              </div>
              <span class="shrink-0 font-semibold text-slate-800">{{ e.amount | currency: 'EUR' }}</span>
              <div class="flex shrink-0 gap-1">
                <button type="button" class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" (click)="startEdit(e)" [attr.aria-label]="'Edit ' + e.description">✏️</button>
                <button type="button" class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600" (click)="remove(e)" [attr.aria-label]="'Remove ' + e.description">🗑️</button>
              </div>
            </li>
          }
        </ul>
      } @else {
        <p class="py-8 text-center text-slate-400">No expenses yet. Add your first one! 💶</p>
      }
    </section>
  `,
})
export class BudgetComponent implements OnInit {
  private readonly service = inject(ExpenseService);
  private readonly familyService = inject(FamilyService);

  protected readonly categories = EXPENSE_CATEGORIES;
  protected form: ExpenseForm = emptyForm();
  protected readonly editingId = signal<number | null>(null);

  protected readonly expenses = signal<Expense[]>([]);
  protected readonly summary = signal<ExpenseSummary | null>(null);
  protected readonly members = signal<FamilyMember[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly maxCategoryTotal = computed(() =>
    Math.max(1, ...(this.summary()?.byCategory.map((c) => c.total) ?? [1])),
  );

  ngOnInit(): void {
    this.familyService.get().subscribe({
      next: (family) => this.members.set(family.members),
      error: () => {},
    });
    this.refresh();
  }

  private refresh(): void {
    this.loading.set(true);
    forkJoin({ expenses: this.service.list(), summary: this.service.summary() }).subscribe({
      next: ({ expenses, summary }) => {
        this.expenses.set(expenses);
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load the budget. Is the backend running?');
        this.loading.set(false);
      },
    });
  }

  protected icon(c: ExpenseCategory): string {
    return EXPENSE_CATEGORIES.find((x) => x.value === c)?.icon ?? '💶';
  }

  protected label(c: ExpenseCategory): string {
    return EXPENSE_CATEGORIES.find((x) => x.value === c)?.label ?? 'Other';
  }

  protected barWidth(total: number): number {
    return Math.round((total / this.maxCategoryTotal()) * 100);
  }

  protected startEdit(e: Expense): void {
    this.editingId.set(e.id ?? null);
    this.form = {
      description: e.description,
      amount: e.amount,
      category: e.category,
      date: e.date,
      paidByUserId: e.paidByUserId ?? null,
    };
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.form = emptyForm();
  }

  protected submit(): void {
    const description = this.form.description.trim();
    if (!description || !this.form.amount || !this.form.date) return;
    this.error.set(null);
    const payload: Expense = {
      description,
      amount: this.form.amount,
      category: this.form.category,
      date: this.form.date,
      paidByUserId: this.form.paidByUserId ?? null,
    };
    const id = this.editingId();
    const call = id !== null ? this.service.update(id, payload) : this.service.add(payload);
    call.subscribe({
      next: () => {
        this.cancelEdit();
        this.refresh();
      },
      error: () => this.error.set('Could not save the expense. Please try again.'),
    });
  }

  protected remove(e: Expense): void {
    if (e.id == null) return;
    if (this.editingId() === e.id) this.cancelEdit();
    this.service.remove(e.id).subscribe({
      next: () => this.refresh(),
      error: () => this.error.set('Could not remove the expense. Please try again.'),
    });
  }
}
