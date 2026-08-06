import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Family, Role } from '../models/user.model';

/**
 * The current user's family: members and (for admins) the invite code.
 */
@Injectable({ providedIn: 'root' })
export class FamilyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/family';

  get(): Observable<Family> {
    return this.http.get<Family>(this.baseUrl);
  }

  regenerateInviteCode(): Observable<Family> {
    return this.http.post<Family>(`${this.baseUrl}/invite-code/regenerate`, {});
  }

  removeMember(userId: number): Observable<Family> {
    return this.http.delete<Family>(`${this.baseUrl}/members/${userId}`);
  }

  setMemberRole(userId: number, role: Role): Observable<Family> {
    return this.http.put<Family>(`${this.baseUrl}/members/${userId}/role`, { role });
  }
}
