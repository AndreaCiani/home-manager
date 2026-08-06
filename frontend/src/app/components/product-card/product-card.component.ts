import { Component, computed, input, output } from '@angular/core';

import { CATEGORIES, Product } from '../../models/product.model';
import { daysToExpiry, expiryColorClass, expiryLabel } from '../../models/expiry.util';

/**
 * Card for a pantry product, with expiry highlighting
 * ("expires in X days" / "expired") to help reduce waste.
 */
@Component({
  selector: 'app-product-card',
  template: `
    <li class="flex items-start gap-3 rounded-xl border bg-white p-3" [class]="border()">
      <span class="text-2xl" aria-hidden="true">{{ icon() }}</span>

      <div class="min-w-0 flex-1">
        <p class="truncate font-medium">{{ product().name }}</p>
        <p class="text-xs text-slate-500">
          {{ categoryLabel() }}
          @if (product().quantity) {
            · {{ product().quantity }}{{ product().unit ? ' ' + product().unit : '' }}
          }
        </p>
        @if (expiryText()) {
          <p class="mt-1 text-xs font-medium" [class]="expiryColor()">⏰ {{ expiryText() }}</p>
        }
      </div>

      <div class="flex shrink-0 gap-1">
        <button
          type="button"
          class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          (click)="edit.emit(product())"
          [attr.aria-label]="'Edit ' + product().name"
        >
          ✏️
        </button>
        <button
          type="button"
          class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          (click)="remove.emit(product())"
          [attr.aria-label]="'Remove ' + product().name"
        >
          🗑️
        </button>
      </div>
    </li>
  `,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly edit = output<Product>();
  readonly remove = output<Product>();

  private readonly icons: Record<string, string> = {
    FRESH: '🥬',
    PANTRY: '🥫',
    FROZEN: '🧊',
    BEVERAGES: '🥤',
    OTHER: '📦',
  };

  readonly icon = computed(() => this.icons[this.product().category] ?? '📦');

  readonly categoryLabel = computed(
    () => CATEGORIES.find((c) => c.value === this.product().category)?.label ?? 'Other',
  );

  private readonly days = computed(() => daysToExpiry(this.product().expiryDate));

  readonly expiryText = computed(() => expiryLabel(this.days()));
  readonly expiryColor = computed(() => expiryColorClass(this.days()));

  readonly border = computed(() => {
    const d = this.days();
    if (d === null) return 'border-slate-200';
    if (d < 0) return 'border-red-300';
    if (d <= 3) return 'border-amber-300';
    return 'border-slate-200';
  });
}
