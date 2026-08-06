import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { ShoppingItem } from '../../models/shopping-item.model';
import { ShoppingItemService } from '../../services/shopping-item.service';
import { ShoppingItemRowComponent } from '../../components/shopping-item-row/shopping-item-row.component';

/**
 * 🛒 Shared shopping list: quick add, toggle "purchased", inline rename, remove.
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
        <input
          type="number"
          name="newQuantity"
          [(ngModel)]="newQuantity"
          placeholder="Qty"
          min="0"
          step="any"
          aria-label="Quantity"
          class="w-20 shrink-0 rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                (rename)="rename($event)"
                (remove)="remove($event)"
              />
            }
          </ul>
        } @else {
          <p class="py-8 text-center text-slate-400">Nothing to buy. Add your first item! 🎉</p>
        }

        <!-- Already purchased -->
        @if (purchased().length) {
          <div class="mb-2 mt-6 flex items-center justify-between">
            <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Already purchased ({{ purchased().length }})
            </h3>
            <button
              type="button"
              class="text-xs font-medium text-red-600 transition-colors hover:underline disabled:opacity-40"
              (click)="clearPurchased()"
              [disabled]="clearing()"
            >
              Clear purchased
            </button>
          </div>
          <ul class="space-y-2">
            @for (item of purchased(); track item.id) {
              <app-shopping-item-row
                [item]="item"
                (togglePurchased)="togglePurchased($event)"
                (rename)="rename($event)"
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
  protected readonly clearing = signal(false);
  protected readonly newName = signal('');
  protected readonly newQuantity = signal<number | null>(null);

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
    const item: ShoppingItem = { name, quantity: this.newQuantity() ?? null, purchased: false };
    this.service.add(item).subscribe({
      next: (created) => {
        this.items.update((i) => [...i, created]);
        this.newName.set('');
        this.newQuantity.set(null);
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

  protected rename({ item, name }: { item: ShoppingItem; name: string }): void {
    if (item.id == null) return;
    const updated = { ...item, name };
    this.service.update(item.id, updated).subscribe({
      next: (saved) => this.items.update((i) => i.map((x) => (x.id === saved.id ? saved : x))),
      error: () => this.error.set('Could not rename the item. Please try again.'),
    });
  }

  protected remove(item: ShoppingItem): void {
    if (item.id == null) return;
    this.service.remove(item.id).subscribe({
      next: () => this.items.update((i) => i.filter((x) => x.id !== item.id)),
      error: () => this.error.set('Could not remove the item. Please try again.'),
    });
  }

  protected clearPurchased(): void {
    const done = this.purchased();
    const ids = done.map((i) => i.id).filter((id): id is number => id != null);
    if (!ids.length) return;
    this.clearing.set(true);
    this.error.set(null);
    forkJoin(ids.map((id) => this.service.remove(id))).subscribe({
      next: () => {
        this.items.update((i) => i.filter((x) => !x.purchased));
        this.clearing.set(false);
      },
      error: () => {
        this.error.set('Could not clear purchased items. Please try again.');
        this.clearing.set(false);
        this.load();
      },
    });
  }
}
