import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ShoppingItem } from '../models/shopping-item.model';

/**
 * HTTP calls to the shared shopping list (/api/shopping-items).
 * The /api prefix is handled by the dev proxy and by Nginx in production.
 */
@Injectable({ providedIn: 'root' })
export class ShoppingItemService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/shopping-items';

  /** List the items (still-to-buy first). */
  list(): Observable<ShoppingItem[]> {
    return this.http.get<ShoppingItem[]>(this.baseUrl);
  }

  /** Adds an item to the list. */
  add(item: ShoppingItem): Observable<ShoppingItem> {
    return this.http.post<ShoppingItem>(this.baseUrl, item);
  }

  /** Updates an item (e.g. mark as "purchased"). */
  update(id: number, item: ShoppingItem): Observable<ShoppingItem> {
    return this.http.put<ShoppingItem>(`${this.baseUrl}/${id}`, item);
  }

  /** Removes an item from the list. */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
