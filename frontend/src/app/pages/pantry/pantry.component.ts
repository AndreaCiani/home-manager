import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CATEGORIES, Category, Product } from '../../models/product.model';
import { ShoppingItem } from '../../models/shopping-item.model';
import { ProductService } from '../../services/product.service';
import { ShoppingItemService } from '../../services/shopping-item.service';
import { ProductLookupService } from '../../services/product-lookup.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { BarcodeScannerComponent } from '../../components/barcode-scanner/barcode-scanner.component';

interface ProductForm {
  name: string;
  quantity: number | null;
  unit: string;
  category: Category;
  expiryDate: string;
}

function emptyForm(): ProductForm {
  return { name: '', quantity: null, unit: '', category: 'OTHER', expiryDate: '' };
}

/** A confirmation banner, optionally offering to remove a product from the pantry. */
interface PantryNotice {
  message: string;
  removeId: number | null;
}

/** Threshold (days) within which a product is considered "expiring". */
const EXPIRY_THRESHOLD = 7;

type CategoryFilter = 'ALL' | Category;

/**
 * 📦 Pantry: inventory of products at home with quantity, category and
 * expiry dates. Expiring (or expired) items show first to help reduce waste.
 * Products can be filtered by category and edited in place.
 */
@Component({
  selector: 'app-pantry',
  imports: [FormsModule, ProductCardComponent, BarcodeScannerComponent],
  template: `
    <section>
      <h2 class="mb-4 text-xl font-bold">📦 Pantry</h2>

      <!-- Barcode scanner (lazily loaded on first use) -->
      @if (editingId() === null) {
        <button
          type="button"
          class="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 px-4 py-2.5 font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
          (click)="startScan()"
        >
          📷 Scan barcode
        </button>
      }
      @defer (when scanning()) {
        @if (scanning()) {
          <app-barcode-scanner (scanned)="onScanned($event)" (closed)="scanning.set(false)" />
        }
      } @loading {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 text-sm text-white">
          Loading scanner…
        </div>
      }

      <!-- Add / edit form -->
      <form (ngSubmit)="submit()" class="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        @if (editingId() !== null) {
          <p class="text-sm font-semibold text-emerald-700">✏️ Editing product</p>
        }
        <input
          type="text"
          name="name"
          [(ngModel)]="form.name"
          placeholder="Product name (e.g. Milk)"
          autocomplete="off"
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />

        <div class="flex gap-2">
          <input
            type="number"
            name="quantity"
            [(ngModel)]="form.quantity"
            placeholder="Quantity"
            min="0"
            step="any"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <input
            type="text"
            name="unit"
            [(ngModel)]="form.unit"
            placeholder="Unit (pcs, L, kg)"
            autocomplete="off"
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
              <option [value]="cat.value">{{ cat.label }}</option>
            }
          </select>
          <input
            type="date"
            name="expiryDate"
            [(ngModel)]="form.expiryDate"
            aria-label="Expiry date"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div class="flex gap-2">
          <button
            type="submit"
            [disabled]="!form.name.trim()"
            class="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
          >
            {{ editingId() === null ? 'Add to pantry' : 'Save changes' }}
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
      @if (looking()) {
        <p class="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">🔎 Looking up product…</p>
      }
      @if (notice(); as n) {
        <div class="mb-4 flex items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <span class="flex-1">{{ n.message }}</span>
          @if (n.removeId !== null) {
            <button
              type="button"
              class="shrink-0 font-medium text-red-600 transition-colors hover:underline"
              (click)="removeFromPantry(n.removeId)"
            >
              Remove from pantry
            </button>
          }
          <button
            type="button"
            class="shrink-0 leading-none text-emerald-700/60 transition-colors hover:text-emerald-900"
            (click)="dismissNotice()"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      }

      @if (loading()) {
        <p class="py-8 text-center text-slate-400">Loading…</p>
      } @else {
        <!-- Expiring -->
        @if (expiring().length) {
          <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-600">
            ⏰ Expiring ({{ expiring().length }})
          </h3>
          <ul class="mb-6 space-y-2">
            @for (p of expiring(); track p.id) {
              <app-product-card
                [product]="p"
                (addToShopping)="addToShopping($event)"
                (edit)="startEdit($event)"
                (remove)="remove($event)"
              />
            }
          </ul>
        }

        <!-- All products, with category filter -->
        @if (products().length) {
          <div class="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              (click)="filter.set('ALL')"
              [class]="chipClass('ALL')"
            >
              All
            </button>
            @for (cat of categories; track cat.value) {
              <button type="button" (click)="filter.set(cat.value)" [class]="chipClass(cat.value)">
                {{ cat.label }}
              </button>
            }
          </div>

          <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            In the pantry ({{ filtered().length }})
          </h3>
          @if (filtered().length) {
            <ul class="space-y-2">
              @for (p of filtered(); track p.id) {
                <app-product-card
                [product]="p"
                (addToShopping)="addToShopping($event)"
                (edit)="startEdit($event)"
                (remove)="remove($event)"
              />
              }
            </ul>
          } @else {
            <p class="py-8 text-center text-slate-400">No products in this category.</p>
          }
        } @else {
          <p class="py-8 text-center text-slate-400">The pantry is empty. Add your first product! 📦</p>
        }
      }
    </section>
  `,
})
export class PantryComponent implements OnInit {
  private readonly service = inject(ProductService);
  private readonly shoppingService = inject(ShoppingItemService);
  private readonly lookup = inject(ProductLookupService);

  protected readonly categories = CATEGORIES;
  protected readonly scanning = signal(false);
  protected readonly looking = signal(false);
  protected form: ProductForm = emptyForm();
  protected readonly editingId = signal<number | null>(null);
  protected readonly filter = signal<CategoryFilter>('ALL');

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<PantryNotice | null>(null);

  /** Lowercased names of items already on the shopping list and not yet purchased. */
  private readonly activeShoppingNames = signal<Set<string>>(new Set());

  /** Products expiring within the threshold (including already expired), most urgent first. */
  protected readonly expiring = computed(() => {
    const limit = new Date();
    limit.setHours(0, 0, 0, 0);
    limit.setDate(limit.getDate() + EXPIRY_THRESHOLD);
    return this.products()
      .filter((p) => p.expiryDate && new Date(p.expiryDate + 'T00:00:00') <= limit)
      .sort((a, b) => (a.expiryDate! < b.expiryDate! ? -1 : 1));
  });

  /** The full list filtered by the selected category. */
  protected readonly filtered = computed(() => {
    const f = this.filter();
    return f === 'ALL' ? this.products() : this.products().filter((p) => p.category === f);
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    // Products are required; the shopping list is best-effort (only used for
    // the duplicate check), so a failure there must not break the pantry.
    forkJoin({
      products: this.service.list(),
      shopping: this.shoppingService.list().pipe(catchError(() => of([] as ShoppingItem[]))),
    }).subscribe({
      next: ({ products, shopping }) => {
        this.products.set(products);
        this.setActiveShopping(shopping);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load the pantry. Is the backend running?');
        this.loading.set(false);
      },
    });
  }

  private setActiveShopping(items: ShoppingItem[]): void {
    this.activeShoppingNames.set(
      new Set(items.filter((i) => !i.purchased).map((i) => i.name.trim().toLowerCase())),
    );
  }

  protected chipClass(value: CategoryFilter): string {
    const base = 'rounded-full px-3 py-1 text-sm font-medium transition-colors ';
    return this.filter() === value
      ? base + 'bg-emerald-600 text-white'
      : base + 'border border-slate-300 text-slate-600 hover:bg-slate-100';
  }

  protected startEdit(product: Product): void {
    this.editingId.set(product.id ?? null);
    this.form = {
      name: product.name,
      quantity: product.quantity ?? null,
      unit: product.unit ?? '',
      category: product.category,
      expiryDate: product.expiryDate ?? '',
    };
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.form = emptyForm();
  }

  protected submit(): void {
    const name = this.form.name.trim();
    if (!name) return;
    this.error.set(null);
    const payload: Product = {
      name,
      quantity: this.form.quantity ?? null,
      unit: this.form.unit.trim() || null,
      category: this.form.category,
      expiryDate: this.form.expiryDate || null,
    };

    const id = this.editingId();
    if (id !== null) {
      this.service.update(id, payload).subscribe({
        next: (saved) => {
          this.products.update((p) => p.map((x) => (x.id === saved.id ? saved : x)));
          this.cancelEdit();
        },
        error: () => this.error.set('Could not save changes. Please try again.'),
      });
    } else {
      this.service.add(payload).subscribe({
        next: (saved) => {
          this.products.update((p) => [...p, saved]);
          this.form = emptyForm();
        },
        error: () => this.error.set('Could not add the product. Please try again.'),
      });
    }
  }

  protected remove(product: Product): void {
    if (product.id == null) return;
    if (this.editingId() === product.id) this.cancelEdit();
    this.service.remove(product.id).subscribe({
      next: () => this.products.update((p) => p.filter((x) => x.id !== product.id)),
      error: () => this.error.set('Could not remove the product. Please try again.'),
    });
  }

  /** "Ran out" → add the product to the shopping list (carrying its quantity). */
  protected addToShopping(product: Product): void {
    this.error.set(null);
    this.notice.set(null);
    const removeId = product.id ?? null;
    const key = product.name.trim().toLowerCase();
    if (this.activeShoppingNames().has(key)) {
      this.showNotice(`"${product.name}" is already on your shopping list.`, removeId);
      return;
    }
    const item: ShoppingItem = {
      name: product.name,
      quantity: product.quantity ?? null,
      purchased: false,
    };
    this.shoppingService.add(item).subscribe({
      next: () => {
        this.activeShoppingNames.update((s) => new Set(s).add(key));
        this.showNotice(`Added "${product.name}" to your shopping list. 🛒`, removeId);
      },
      error: () => this.error.set('Could not add to the shopping list. Please try again.'),
    });
  }

  protected startScan(): void {
    this.error.set(null);
    this.notice.set(null);
    this.scanning.set(true);
  }

  /** A barcode was scanned: look up its name and prefill the add form. */
  protected onScanned(barcode: string): void {
    this.scanning.set(false);
    this.error.set(null);
    this.notice.set(null);
    this.editingId.set(null);
    this.looking.set(true);
    this.lookup.lookupName(barcode).subscribe((name) => {
      this.looking.set(false);
      if (name) {
        this.form = { ...emptyForm(), name };
        this.showNotice(`Found "${name}" — review the details and add it. 📷`);
      } else {
        this.showNotice(`No product found for barcode ${barcode}. Enter the name manually.`);
      }
    });
  }

  private showNotice(message: string, removeId: number | null = null): void {
    this.notice.set({ message, removeId });
  }

  protected dismissNotice(): void {
    this.notice.set(null);
  }

  /** Remove a product from the pantry as a follow-up to "ran out" (from the notice). */
  protected removeFromPantry(id: number): void {
    const product = this.products().find((p) => p.id === id);
    this.notice.set(null);
    if (product) this.remove(product);
  }
}
