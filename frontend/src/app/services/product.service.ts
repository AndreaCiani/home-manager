import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product } from '../models/product.model';

/**
 * HTTP calls to the pantry (/api/products).
 * The /api prefix is handled by the dev proxy and by Nginx in production.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/products';

  /** Full pantry list. */
  list(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  /** Products expiring within N days (default 7). */
  expiring(days = 7): Observable<Product[]> {
    const params = new HttpParams().set('days', days);
    return this.http.get<Product[]>(`${this.baseUrl}/expiring`, { params });
  }

  /** Adds a product. */
  add(product: Product): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }

  /** Updates an existing product. */
  update(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, product);
  }

  /** Removes a product. */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
