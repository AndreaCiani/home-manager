import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/** Minimal shape of the Open Food Facts v2 product response we rely on. */
interface OffResponse {
  status?: number;
  product?: {
    product_name?: string;
    brands?: string;
  };
}

/**
 * Looks up a product name from a barcode using the free, open
 * Open Food Facts database. The barcode is sent to their public API.
 */
@Injectable({ providedIn: 'root' })
export class ProductLookupService {
  private readonly http = inject(HttpClient);

  /** Returns the product name for a barcode, or null if unknown / on error. */
  lookupName(barcode: string): Observable<string | null> {
    const url =
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json` +
      `?fields=product_name,brands`;
    return this.http.get<OffResponse>(url).pipe(
      map((res) => {
        if (res?.status !== 1 || !res.product) return null;
        const name = (res.product.product_name ?? '').trim();
        const brand = (res.product.brands ?? '').split(',')[0]?.trim() ?? '';
        return name || brand || null;
      }),
      catchError(() => of(null)),
    );
  }
}
