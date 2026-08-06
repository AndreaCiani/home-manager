import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ShoppingItem } from '../../models/shopping-item.model';

/**
 * Row for a shopping list item: toggle "purchased", inline rename, and remove.
 */
@Component({
  selector: 'app-shopping-item-row',
  imports: [FormsModule],
  template: `
    <li class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <input
        type="checkbox"
        class="h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        [checked]="item().purchased"
        (change)="togglePurchased.emit(item())"
        [attr.aria-label]="'Mark ' + item().name + ' as purchased'"
      />

      @if (editing()) {
        <input
          type="text"
          [(ngModel)]="draft"
          (keydown.enter)="save()"
          (keydown.escape)="cancel()"
          autocomplete="off"
          class="min-w-0 flex-1 rounded-lg border border-emerald-400 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          [attr.aria-label]="'Rename ' + item().name"
        />
        <button
          type="button"
          class="shrink-0 rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50"
          (click)="save()"
          [disabled]="!draft().trim()"
          aria-label="Save name"
        >
          ✔️
        </button>
        <button
          type="button"
          class="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100"
          (click)="cancel()"
          aria-label="Cancel rename"
        >
          ✖️
        </button>
      } @else {
        <div class="min-w-0 flex-1" [class.opacity-50]="item().purchased">
          <p class="truncate font-medium" [class.line-through]="item().purchased">{{ item().name }}</p>
          @if (item().quantity) {
            <p class="text-xs text-slate-500">Quantity: {{ item().quantity }}</p>
          }
        </div>

        <button
          type="button"
          class="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          (click)="startEdit()"
          [attr.aria-label]="'Rename ' + item().name"
        >
          ✏️
        </button>
        <button
          type="button"
          class="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          (click)="remove.emit(item())"
          [attr.aria-label]="'Remove ' + item().name"
        >
          🗑️
        </button>
      }
    </li>
  `,
})
export class ShoppingItemRowComponent {
  readonly item = input.required<ShoppingItem>();
  readonly togglePurchased = output<ShoppingItem>();
  readonly remove = output<ShoppingItem>();
  readonly rename = output<{ item: ShoppingItem; name: string }>();

  protected readonly editing = signal(false);
  protected readonly draft = signal('');

  protected startEdit(): void {
    this.draft.set(this.item().name);
    this.editing.set(true);
  }

  protected cancel(): void {
    this.editing.set(false);
  }

  protected save(): void {
    const name = this.draft().trim();
    if (!name || name === this.item().name) {
      this.editing.set(false);
      return;
    }
    this.rename.emit({ item: this.item(), name });
    this.editing.set(false);
  }
}
