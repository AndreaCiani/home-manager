import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { VoceSpesa } from '../models/voce-spesa.model';

/**
 * Chiamate HTTP alla lista della spesa condivisa (/api/spesa).
 * Il prefisso /api è gestito dal proxy in sviluppo e da Nginx in produzione.
 */
@Injectable({ providedIn: 'root' })
export class VoceSpesaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/spesa';

  /** Elenco della lista (prima le voci da prendere). */
  elenco(): Observable<VoceSpesa[]> {
    return this.http.get<VoceSpesa[]>(this.baseUrl);
  }

  /** Aggiunge una voce alla lista. */
  aggiungi(voce: VoceSpesa): Observable<VoceSpesa> {
    return this.http.post<VoceSpesa>(this.baseUrl, voce);
  }

  /** Modifica una voce (es. spuntare "presa"). */
  modifica(id: number, voce: VoceSpesa): Observable<VoceSpesa> {
    return this.http.put<VoceSpesa>(`${this.baseUrl}/${id}`, voce);
  }

  /** Rimuove una voce dalla lista. */
  rimuovi(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
