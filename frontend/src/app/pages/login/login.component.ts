import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

/**
 * 🔑 Sign-in screen.
 */
@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 class="mb-1 flex items-center gap-2 text-2xl font-bold text-slate-800">
        <span aria-hidden="true">🏠</span> home-manager
      </h1>
      <p class="mb-6 text-sm text-slate-500">Sign in to your household.</p>

      <form (ngSubmit)="submit()" class="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <input
          type="email"
          name="email"
          [(ngModel)]="email"
          placeholder="Email"
          autocomplete="email"
          required
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <input
          type="password"
          name="password"
          [(ngModel)]="password"
          placeholder="Password"
          autocomplete="current-password"
          required
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />

        @if (error()) {
          <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error() }}</p>
        }

        <button
          type="submit"
          [disabled]="submitting() || !email().trim() || !password()"
          class="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
        >
          {{ submitting() ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-slate-500">
        No account yet?
        <a routerLink="/register" class="font-medium text-emerald-600 hover:underline">Register</a>
      </p>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);

  protected submit(): void {
    if (this.submitting()) return;
    this.error.set(null);
    this.submitting.set(true);
    this.auth.login(this.email().trim(), this.password()).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.error.set(
          err.status === 401
            ? 'Invalid email or password.'
            : 'Could not sign in. Please try again.',
        );
      },
    });
  }
}
