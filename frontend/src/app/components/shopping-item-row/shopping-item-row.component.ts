import { Component, input, output } from '@angular/core';

import { ShoppingItem } from '../../models/shopping-item.model';

/**
 * Row for a shopping list item: toggle "purchased" and remove.
 */
@Component({
  selector: 'app-shopping-item-row',
  template: `
    <li class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <input
        type="checkbox"
        class="h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        [checked]="item().purchased"
        (change)="togglePurchased.emit(item())"
        [attr.aria-label]="'Mark ' + item().name + ' as purchased'"
      />

      <div class="min-w-0 flex-1" [class.opacity-50]="item().purchased">
        <p class="truncate font-medium" [class.line-through]="item().purchased">{{ item().name }}</p>
        @if (item().quantity) {
          <p class="text-xs text-slate-500">Quantity: {{ item().quantity }}</p>
        }
      </div>

      <button
        type="button"
        class="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
        (click)="remove.emit(item())"
        [attr.aria-label]="'Remove ' + item().name"
      >
        🗑️
      </button>
    </li>
  `,
})
export class ShoppingItemRowComponent {
  readonly item = input.required<ShoppingItem>();
  readonly togglePurchased = output<ShoppingItem>();
  readonly remove = output<ShoppingItem>();
}
