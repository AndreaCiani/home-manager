import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Deadline } from '../models/deadline.model';

/**
 * HTTP calls to deadlines & bills (/api/deadlines), scoped to the family.
 */
@Injectable({ providedIn: 'root' })
export class DeadlineService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/deadlines';

  list(): Observable<Deadline[]> {
    return this.http.get<Deadline[]>(this.baseUrl);
  }

  /** Unpaid deadlines due within N days (default 30), including overdue. */
  upcoming(days = 30): Observable<Deadline[]> {
    const params = new HttpParams().set('days', days);
    return this.http.get<Deadline[]>(`${this.baseUrl}/upcoming`, { params });
  }

  add(deadline: Deadline): Observable<Deadline> {
    return this.http.post<Deadline>(this.baseUrl, deadline);
  }

  update(id: number, deadline: Deadline): Observable<Deadline> {
    return this.http.put<Deadline>(`${this.baseUrl}/${id}`, deadline);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Mark as paid (recurring deadlines roll forward to the next occurrence). */
  pay(id: number): Observable<Deadline> {
    return this.http.post<Deadline>(`${this.baseUrl}/${id}/pay`, {});
  }
}
