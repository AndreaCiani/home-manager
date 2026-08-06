import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Chore } from '../models/chore.model';

/**
 * HTTP calls to household chores (/api/chores), scoped to the family.
 */
@Injectable({ providedIn: 'root' })
export class ChoreService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/chores';

  list(): Observable<Chore[]> {
    return this.http.get<Chore[]>(this.baseUrl);
  }

  add(chore: Chore): Observable<Chore> {
    return this.http.post<Chore>(this.baseUrl, chore);
  }

  update(id: number, chore: Chore): Observable<Chore> {
    return this.http.put<Chore>(`${this.baseUrl}/${id}`, chore);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Mark done (recurring chores roll forward to the next occurrence). */
  markDone(id: number): Observable<Chore> {
    return this.http.post<Chore>(`${this.baseUrl}/${id}/done`, {});
  }
}
