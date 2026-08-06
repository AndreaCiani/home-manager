import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Expense, ExpenseSummary } from '../models/expense.model';

/**
 * HTTP calls to household budget (/api/expenses), scoped to the family.
 */
@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/expenses';

  list(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.baseUrl);
  }

  /** Monthly summary; month format yyyy-MM (defaults to the current month). */
  summary(month?: string): Observable<ExpenseSummary> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    return this.http.get<ExpenseSummary>(`${this.baseUrl}/summary`, { params });
  }

  add(expense: Expense): Observable<Expense> {
    return this.http.post<Expense>(this.baseUrl, expense);
  }

  update(id: number, expense: Expense): Observable<Expense> {
    return this.http.put<Expense>(`${this.baseUrl}/${id}`, expense);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
