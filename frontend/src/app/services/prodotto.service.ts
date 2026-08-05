import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Prodotto } from '../models/prodotto.model';

/**
 * Chiamate HTTP alla dispensa (/api/prodotti).
 * Il prefisso /api è gestito dal proxy in sviluppo e da Nginx in produzione.
 */
@Injectable({ providedIn: 'root' })
export class ProdottoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/prodotti';

  /** Elenco completo della dispensa. */
  elenco(): Observable<Prodotto[]> {
    return this.http.get<Prodotto[]>(this.baseUrl);
  }

  /** Prodotti in scadenza entro N giorni (default 7). */
  inScadenza(giorni = 7): Observable<Prodotto[]> {
    const params = new HttpParams().set('giorni', giorni);
    return this.http.get<Prodotto[]>(`${this.baseUrl}/in-scadenza`, { params });
  }

  /** Aggiunge un prodotto. */
  aggiungi(prodotto: Prodotto): Observable<Prodotto> {
    return this.http.post<Prodotto>(this.baseUrl, prodotto);
  }

  /** Modifica un prodotto esistente. */
  modifica(id: number, prodotto: Prodotto): Observable<Prodotto> {
    return this.http.put<Prodotto>(`${this.baseUrl}/${id}`, prodotto);
  }

  /** Rimuove un prodotto. */
  rimuovi(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
