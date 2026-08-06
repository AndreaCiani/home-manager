import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Product } from '../../models/product.model';
import { ShoppingItem } from '../../models/shopping-item.model';
import { ProductService } from '../../services/product.service';
import { ShoppingItemService } from '../../services/shopping-item.service';
import { daysToExpiry, expiryColorClass, expiryLabel } from '../../models/expiry.util';

/** Threshold (days) within which a product is considered "expiring". */
const EXPIRY_THRESHOLD = 7;

/** How many items to preview in each dashboard section. */
const PREVIEW = 5;

/**
 * 🏠 Home / dashboard: an at-a-glance overview of what needs attention —
 * items to buy and products about to expire — with links into each section.
 */
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <section>
      <h2 class="mb-4 text-xl font-bold">🏠 Overview</h2>

      @if (error()) {
        <p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error() }}</p>
      }

      @if (loading()) {
        <p class="py-8 text-center text-slate-400">Loading…</p>
      } @else {
        <!-- Stat cards -->
        <div class="mb-6 grid grid-cols-3 gap-3">
          <a
            routerLink="/shopping"
            class="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300"
          >
            <p class="text-2xl font-bold text-emerald-600">{{ toBuyCount() }}</p>
            <p class="mt-1 text-xs text-slate-500">🛒 To buy</p>
          </a>
          <a
            routerLink="/pantry"
            class="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-amber-300"
          >
            <p class="text-2xl font-bold" [class]="expiringCount() ? 'text-amber-600' : 'text-slate-800'">
              {{ expiringCount() }}
            </p>
            <p class="mt-1 text-xs text-slate-500">⏰ Expiring</p>
          </a>
          <a
            routerLink="/pantry"
            class="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300"
          >
            <p class="text-2xl font-bold text-slate-800">{{ products().length }}</p>
            <p class="mt-1 text-xs text-slate-500">📦 In pantry</p>
          </a>
        </div>

        <!-- Expiring soon -->
        @if (expiring().length) {
          <div class="mb-6">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-sm font-semibold uppercase tracking-wide text-amber-600">⏰ Expiring soon</h3>
              <a routerLink="/pantry" class="text-xs font-medium text-emerald-600 hover:underline">
                View pantry →
              </a>
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

        <!-- To buy -->
        <div>
          <div class="mb-2 flex items-center justify-between">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-400">🛒 To buy</h3>
            <a routerLink="/shopping" class="text-xs font-medium text-emerald-600 hover:underline">
              View list →
            </a>
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

  protected readonly PREVIEW = PREVIEW;

  protected readonly products = signal<Product[]>([]);
  protected readonly items = signal<ShoppingItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

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
    }).subscribe({
      next: ({ products, items }) => {
        this.products.set(products);
        this.items.set(items);
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
}
