import { Component, computed, input, output } from '@angular/core';

import { CATEGORIES, Product } from '../../models/product.model';

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

      <button
        type="button"
        class="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
        (click)="remove.emit(product())"
        [attr.aria-label]="'Remove ' + product().name"
      >
        🗑️
      </button>
    </li>
  `,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
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

  /** Days left until expiry (negative = already expired), null if not set. */
  private readonly daysToExpiry = computed<number | null>(() => {
    const date = this.product().expiryDate;
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(date + 'T00:00:00');
    return Math.round((expiry.getTime() - today.getTime()) / 86_400_000);
  });

  readonly expiryText = computed(() => {
    const d = this.daysToExpiry();
    if (d === null) return null;
    if (d < 0) return `Expired ${-d} ${-d === 1 ? 'day' : 'days'} ago`;
    if (d === 0) return 'Expires today';
    if (d === 1) return 'Expires tomorrow';
    return `Expires in ${d} days`;
  });

  readonly expiryColor = computed(() => {
    const d = this.daysToExpiry();
    if (d === null) return '';
    if (d < 0) return 'text-red-600';
    if (d <= 3) return 'text-amber-600';
    return 'text-slate-500';
  });

  readonly border = computed(() => {
    const d = this.daysToExpiry();
    if (d === null) return 'border-slate-200';
    if (d < 0) return 'border-red-300';
    if (d <= 3) return 'border-amber-300';
    return 'border-slate-200';
  });
}
