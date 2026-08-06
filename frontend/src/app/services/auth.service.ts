import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, tap } from 'rxjs';

import { User } from '../models/user.model';

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  inviteCode?: string;
  familyName?: string;
}

/**
 * Authentication state and calls. Uses session cookies + CSRF (handled by
 * Angular's built-in XSRF support), so no tokens are stored by the app.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  /** Called at app startup to establish who (if anyone) is logged in. */
  loadCurrentUser(): Promise<void> {
    return firstValueFrom(this.http.get<User>('/api/auth/me'))
      .then((user) => this.currentUser.set(user))
      .catch(() => this.currentUser.set(null));
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http
      .post<User>('/api/auth/register', payload)
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<User>('/api/auth/login', { email, password })
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  logout(): Observable<void> {
    return this.http
      .post<void>('/api/auth/logout', {})
      .pipe(tap(() => this.currentUser.set(null)));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>('/api/auth/change-password', { currentPassword, newPassword });
  }

  /** Clears local auth state without a server call (e.g. after a 401). */
  clear(): void {
    this.currentUser.set(null);
  }
}
