import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HmDocument } from '../models/document.model';

/**
 * HTTP calls to household documents (/api/documents), scoped to the family.
 * Files are uploaded as multipart/form-data and downloaded via a direct URL
 * (the session cookie authenticates the GET).
 */
@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/documents';

  list(): Observable<HmDocument[]> {
    return this.http.get<HmDocument[]>(this.baseUrl);
  }

  upload(form: FormData): Observable<HmDocument> {
    return this.http.post<HmDocument>(this.baseUrl, form);
  }

  updateMetadata(id: number, doc: HmDocument): Observable<HmDocument> {
    return this.http.put<HmDocument>(`${this.baseUrl}/${id}`, doc);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Direct download URL (authenticated by the session cookie). */
  fileUrl(id: number): string {
    return `${this.baseUrl}/${id}/file`;
  }
}
