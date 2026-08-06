import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Product } from '../../models/product.model';
import { ShoppingItem } from '../../models/shopping-item.model';
import { Deadline, daysUntilDue, dueColorClass, dueLabel } from '../../models/deadline.model';
import { Chore } from '../../models/chore.model';
import { ProductService } from '../../services/product.service';
import { ShoppingItemService } from '../../services/shopping-item.service';
import { DeadlineService } from '../../services/deadline.service';
import { ChoreService } from '../../services/chore.service';
import { ExpenseService } from '../../services/expense.service';
import { DocumentService } from '../../services/document.service';
import { daysToExpiry, expiryColorClass, expiryLabel } from '../../models/expiry.util';

/** Threshold (days) within which a product is considered "expiring". */
const EXPIRY_THRESHOLD = 7;

/** How many items to preview in each dashboard section. */
const PREVIEW = 5;

/**
 * 🏠 Home hub: tiles for each module (the app is a container of modules) plus
 * an at-a-glance list of what needs attention.
 */
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <section>
      <h2 class="mb-4 text-xl font-bold">🏠 Home</h2>

      @if (error()) {
        <p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error() }}</p>
      }

      <!-- Module hub -->
      <div class="mb-6 grid grid-cols-2 gap-3">
        <a routerLink="/shopping" class="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300">
          <p class="text-2xl" aria-hidden="true">🛒</p>
          <p class="mt-1 font-semibold text-slate-800">Shopping</p>
          <p class="text-xs text-slate-500">{{ loading() ? '…' : toBuyCount() + ' to buy' }}</p>
        </a>
        <a routerLink="/pantry" class="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300">
          <p class="text-2xl" aria-hidden="true">📦</p>
          <p class="mt-1 font-semibold text-slate-800">Pantry</p>
          <p class="text-xs" [class]="expiringCount() ? 'text-amber-600' : 'text-slate-500'">
            {{ loading() ? '…' : expiringCount() ? expiringCount() + ' expiring' : products().length + ' items' }}
          </p>
        </a>
        <a routerLink="/deadlines" class="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300">
          <p class="text-2xl" aria-hidden="true">📅</p>
          <p class="mt-1 font-semibold text-slate-800">Bills</p>
          <p class="text-xs" [class]="dueSoon().length ? 'text-amber-600' : 'text-slate-500'">
            {{ loading() ? '…' : dueSoon().length + ' due soon' }}
          </p>
        </a>
        <a routerLink="/chores" class="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300">
          <p class="text-2xl" aria-hidden="true">🧹</p>
          <p class="mt-1 font-semibold text-slate-800">Chores</p>
          <p class="text-xs text-slate-500">{{ loading() ? '…' : choresToDo() + ' to do' }}</p>
        </a>
        <a routerLink="/budget" class="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300">
          <p class="text-2xl" aria-hidden="true">💰</p>
          <p class="mt-1 font-semibold text-slate-800">Budget</p>
          <p class="text-xs text-slate-500">{{ loading() ? '…' : (budgetTotal() | currency: 'EUR') + ' this month' }}</p>
        </a>
        <a routerLink="/documents" class="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300">
          <p class="text-2xl" aria-hidden="true">📄</p>
          <p class="mt-1 font-semibold text-slate-800">Documents</p>
          <p class="text-xs text-slate-500">{{ loading() ? '…' : documentCount() + ' stored' }}</p>
        </a>
      </div>

      @if (loading()) {
        <p class="py-8 text-center text-slate-400">Loading…</p>
      } @else {
        <!-- Expiring soon -->
        @if (expiring().length) {
          <div class="mb-6">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-sm font-semibold uppercase tracking-wide text-amber-600">⏰ Expiring soon</h3>
              <a routerLink="/pantry" class="text-xs font-medium text-emerald-600 hover:underline">View pantry →</a>
            </div>
            <ul class="space-y-2">
              @for (p of expiringPreview(); track p.id) {
                <li class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <span class="truncate font-medium">{{ p.name }}</span>
                  <span class="ml-3 shrink-0 text-xs font-medium" [class]="colorFor(p)">{{ labelFor(p) }}</span>
                </li>
              }
            </ul>
            @if (expiring().length > PREVIEW) {
              <p class="mt-2 text-xs text-slate-400">+ {{ expiring().length - PREVIEW }} more</p>
            }
          </div>
        }

        <!-- Upcoming bills -->
        @if (dueSoon().length) {
          <div class="mb-6">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-sm font-semibold uppercase tracking-wide text-amber-600">📅 Upcoming bills</h3>
              <a routerLink="/deadlines" class="text-xs font-medium text-emerald-600 hover:underline">View all →</a>
            </div>
            <ul class="space-y-2">
              @for (d of dueSoonPreview(); track d.id) {
                <li class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <span class="truncate font-medium">{{ d.title }}</span>
                  <span class="ml-3 shrink-0 text-xs font-medium" [class]="dueColorFor(d)">{{ dueLabelFor(d) }}</span>
                </li>
              }
            </ul>
            @if (dueSoon().length > PREVIEW) {
              <p class="mt-2 text-xs text-slate-400">+ {{ dueSoon().length - PREVIEW }} more</p>
            }
          </div>
        }

        <!-- To buy -->
        <div>
          <div class="mb-2 flex items-center justify-between">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-400">🛒 To buy</h3>
            <a routerLink="/shopping" class="text-xs font-medium text-emerald-600 hover:underline">View list →</a>
          </div>
          @if (toBuy().length) {
            <ul class="space-y-2">
              @for (item of toBuyPreview(); track item.id) {
                <li class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <span class="truncate font-medium">{{ item.name }}</span>
                  @if (item.quantity) {
                    <span class="ml-3 shrink-0 text-xs text-slate-500">×{{ item.quantity }}</span>
                  }
                </li>
              }
            </ul>
            @if (toBuy().length > PREVIEW) {
              <p class="mt-2 text-xs text-slate-400">+ {{ toBuy().length - PREVIEW }} more</p>
            }
          } @else {
            <p class="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
              Nothing to buy right now 🎉
            </p>
          }
        </div>
      }
    </section>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly shoppingService = inject(ShoppingItemService);
  private readonly deadlineService = inject(DeadlineService);
  private readonly choreService = inject(ChoreService);
  private readonly expenseService = inject(ExpenseService);
  private readonly documentService = inject(DocumentService);

  protected readonly PREVIEW = PREVIEW;

  protected readonly products = signal<Product[]>([]);
  protected readonly items = signal<ShoppingItem[]>([]);
  protected readonly dueSoon = signal<Deadline[]>([]);
  protected readonly chores = signal<Chore[]>([]);
  protected readonly budgetTotal = signal(0);
  protected readonly documentCount = signal(0);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly choresToDo = computed(() => this.chores().filter((c) => !c.done).length);

  protected readonly dueSoonPreview = computed(() => this.dueSoon().slice(0, PREVIEW));

  protected readonly toBuy = computed(() => this.items().filter((i) => !i.purchased));
  protected readonly toBuyCount = computed(() => this.toBuy().length);
  protected readonly toBuyPreview = computed(() => this.toBuy().slice(0, PREVIEW));

  protected readonly expiring = computed(() => {
    const limit = new Date();
    limit.setHours(0, 0, 0, 0);
    limit.setDate(limit.getDate() + EXPIRY_THRESHOLD);
    return this.products()
      .filter((p) => p.expiryDate && new Date(p.expiryDate + 'T00:00:00') <= limit)
      .sort((a, b) => (a.expiryDate! < b.expiryDate! ? -1 : 1));
  });
  protected readonly expiringCount = computed(() => this.expiring().length);
  protected readonly expiringPreview = computed(() => this.expiring().slice(0, PREVIEW));

  ngOnInit(): void {
    forkJoin({
      products: this.productService.list(),
      items: this.shoppingService.list(),
      deadlines: this.deadlineService.upcoming(),
      chores: this.choreService.list(),
      budget: this.expenseService.summary(),
      documents: this.documentService.list(),
    }).subscribe({
      next: ({ products, items, deadlines, chores, budget, documents }) => {
        this.products.set(products);
        this.items.set(items);
        this.dueSoon.set(deadlines);
        this.chores.set(chores);
        this.budgetTotal.set(budget.total);
        this.documentCount.set(documents.length);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your data. Is the backend running?');
        this.loading.set(false);
      },
    });
  }

  protected labelFor(p: Product): string {
    return expiryLabel(daysToExpiry(p.expiryDate)) ?? '';
  }

  protected colorFor(p: Product): string {
    return expiryColorClass(daysToExpiry(p.expiryDate));
  }

  protected dueLabelFor(d: Deadline): string {
    return dueLabel(daysUntilDue(d.dueDate)) ?? '';
  }

  protected dueColorFor(d: Deadline): string {
    return dueColorClass(daysUntilDue(d.dueDate));
  }
}
