import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CATEGORIES, Category, Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

interface NewProduct {
  name: string;
  quantity: number | null;
  unit: string;
  category: Category;
  expiryDate: string;
}

function emptyForm(): NewProduct {
  return { name: '', quantity: null, unit: '', category: 'OTHER', expiryDate: '' };
}

/** Threshold (days) within which a product is considered "expiring". */
const EXPIRY_THRESHOLD = 7;

/**
 * 📦 Pantry: inventory of products at home with quantity, category and
 * expiry dates. Expiring (or expired) items show first to help reduce waste.
 */
@Component({
  selector: 'app-pantry',
  imports: [FormsModule, ProductCardComponent],
  template: `
    <section>
      <h2 class="mb-4 text-xl font-bold">📦 Pantry</h2>

      <!-- Add form -->
      <form (ngSubmit)="add()" class="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <input
          type="text"
          name="name"
          [(ngModel)]="newProduct.name"
          placeholder="Product name (e.g. Milk)"
          autocomplete="off"
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />

        <div class="flex gap-2">
          <input
            type="number"
            name="quantity"
            [(ngModel)]="newProduct.quantity"
            placeholder="Quantity"
            min="0"
            step="any"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <input
            type="text"
            name="unit"
            [(ngModel)]="newProduct.unit"
            placeholder="Unit (pcs, L, kg)"
            autocomplete="off"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div class="flex gap-2">
          <select
            name="category"
            [(ngModel)]="newProduct.category"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            @for (cat of categories; track cat.value) {
              <option [value]="cat.value">{{ cat.label }}</option>
            }
          </select>
          <input
            type="date"
            name="expiryDate"
            [(ngModel)]="newProduct.expiryDate"
            aria-label="Expiry date"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          [disabled]="!newProduct.name.trim()"
          class="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
        >
          Add to pantry
        </button>
      </form>

      @if (error()) {
        <p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error() }}</p>
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
              <app-product-card [product]="p" (remove)="remove($event)" />
            }
          </ul>
        }

        <!-- All products -->
        @if (products().length) {
          <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            In the pantry ({{ products().length }})
          </h3>
          <ul class="space-y-2">
            @for (p of products(); track p.id) {
              <app-product-card [product]="p" (remove)="remove($event)" />
            }
          </ul>
        } @else {
          <p class="py-8 text-center text-slate-400">The pantry is empty. Add your first product! 📦</p>
        }
      }
    </section>
  `,
})
export class PantryComponent implements OnInit {
  private readonly service = inject(ProductService);

  protected readonly categories = CATEGORIES;
  protected newProduct: NewProduct = emptyForm();

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  /** Products expiring within the threshold (including already expired), most urgent first. */
  protected readonly expiring = computed(() => {
    const limit = new Date();
    limit.setHours(0, 0, 0, 0);
    limit.setDate(limit.getDate() + EXPIRY_THRESHOLD);
    return this.products()
      .filter((p) => p.expiryDate && new Date(p.expiryDate + 'T00:00:00') <= limit)
      .sort((a, b) => (a.expiryDate! < b.expiryDate! ? -1 : 1));
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load the pantry. Is the backend running?');
        this.loading.set(false);
      },
    });
  }

  protected add(): void {
    const name = this.newProduct.name.trim();
    if (!name) return;
    this.error.set(null);
    const product: Product = {
      name,
      quantity: this.newProduct.quantity ?? null,
      unit: this.newProduct.unit.trim() || null,
      category: this.newProduct.category,
      expiryDate: this.newProduct.expiryDate || null,
    };
    this.service.add(product).subscribe({
      next: (saved) => {
        this.products.update((p) => [...p, saved]);
        this.newProduct = emptyForm();
      },
      error: () => this.error.set('Could not add the product. Please try again.'),
    });
  }

  protected remove(product: Product): void {
    if (product.id == null) return;
    this.service.remove(product.id).subscribe({
      next: () => this.products.update((p) => p.filter((x) => x.id !== product.id)),
      error: () => this.error.set('Could not remove the product. Please try again.'),
    });
  }
}
