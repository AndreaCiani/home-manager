import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ShoppingItem } from '../../models/shopping-item.model';
import { ShoppingItemService } from '../../services/shopping-item.service';
import { ShoppingItemRowComponent } from '../../components/shopping-item-row/shopping-item-row.component';

/**
 * 🛒 Shared shopping list: quick add, toggle "purchased", remove.
 */
@Component({
  selector: 'app-shopping-list',
  imports: [FormsModule, ShoppingItemRowComponent],
  template: `
    <section>
      <h2 class="mb-4 text-xl font-bold">🛒 Shopping list</h2>

      <!-- Quick add -->
      <form (ngSubmit)="add()" class="mb-5 flex gap-2">
        <input
          type="text"
          name="newName"
          [(ngModel)]="newName"
          placeholder="Add an item…"
          autocomplete="off"
          class="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="submit"
          [disabled]="!newName().trim()"
          class="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
        >
          Add
        </button>
      </form>

      @if (error()) {
        <p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error() }}</p>
      }

      @if (loading()) {
        <p class="py-8 text-center text-slate-400">Loading…</p>
      } @else {
        <!-- Still to buy -->
        @if (toBuy().length) {
          <ul class="space-y-2">
            @for (item of toBuy(); track item.id) {
              <app-shopping-item-row
                [item]="item"
                (togglePurchased)="togglePurchased($event)"
                (remove)="remove($event)"
              />
            }
          </ul>
        } @else {
          <p class="py-8 text-center text-slate-400">Nothing to buy. Add your first item! 🎉</p>
        }

        <!-- Already purchased -->
        @if (purchased().length) {
          <h3 class="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Already purchased ({{ purchased().length }})
          </h3>
          <ul class="space-y-2">
            @for (item of purchased(); track item.id) {
              <app-shopping-item-row
                [item]="item"
                (togglePurchased)="togglePurchased($event)"
                (remove)="remove($event)"
              />
            }
          </ul>
        }
      }
    </section>
  `,
})
export class ShoppingListComponent implements OnInit {
  private readonly service = inject(ShoppingItemService);

  protected readonly items = signal<ShoppingItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly newName = signal('');

  protected readonly toBuy = computed(() => this.items().filter((i) => !i.purchased));
  protected readonly purchased = computed(() => this.items().filter((i) => i.purchased));

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load the list. Is the backend running?');
        this.loading.set(false);
      },
    });
  }

  protected add(): void {
    const name = this.newName().trim();
    if (!name) return;
    this.error.set(null);
    this.service.add({ name, purchased: false }).subscribe({
      next: (item) => {
        this.items.update((i) => [...i, item]);
        this.newName.set('');
      },
      error: () => this.error.set('Could not add the item. Please try again.'),
    });
  }

  protected togglePurchased(item: ShoppingItem): void {
    if (item.id == null) return;
    const updated = { ...item, purchased: !item.purchased };
    this.service.update(item.id, updated).subscribe({
      next: (saved) => this.items.update((i) => i.map((x) => (x.id === saved.id ? saved : x))),
      error: () => this.error.set('Could not update the item. Please try again.'),
    });
  }

  protected remove(item: ShoppingItem): void {
    if (item.id == null) return;
    this.service.remove(item.id).subscribe({
      next: () => this.items.update((i) => i.filter((x) => x.id !== item.id)),
      error: () => this.error.set('Could not remove the item. Please try again.'),
    });
  }
}
