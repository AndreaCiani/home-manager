import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

type Mode = 'join' | 'create';

/**
 * 🧑‍🤝‍🧑 Registration. Registration is invite-based: join an existing family with
 * its code, or (for the very first account) create a new household.
 */
@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-8">
      <h1 class="mb-1 flex items-center gap-2 text-2xl font-bold text-slate-800">
        <span aria-hidden="true">🏠</span> home-manager
      </h1>
      <p class="mb-6 text-sm text-slate-500">Create your account.</p>

      <form (ngSubmit)="submit()" class="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <input
          type="text"
          name="displayName"
          [(ngModel)]="displayName"
          placeholder="Your name"
          autocomplete="name"
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <input
          type="email"
          name="email"
          [(ngModel)]="email"
          placeholder="Email"
          autocomplete="email"
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <input
          type="password"
          name="password"
          [(ngModel)]="password"
          placeholder="Password (min 8 characters)"
          autocomplete="new-password"
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />

        <!-- Join vs create toggle -->
        <div class="flex rounded-xl border border-slate-200 p-1 text-sm">
          <button
            type="button"
            class="flex-1 rounded-lg px-3 py-1.5 font-medium transition-colors"
            [class]="mode() === 'join' ? 'bg-emerald-600 text-white' : 'text-slate-600'"
            (click)="mode.set('join')"
          >
            Join a family
          </button>
          <button
            type="button"
            class="flex-1 rounded-lg px-3 py-1.5 font-medium transition-colors"
            [class]="mode() === 'create' ? 'bg-emerald-600 text-white' : 'text-slate-600'"
            (click)="mode.set('create')"
          >
            New household
          </button>
        </div>

        @if (mode() === 'join') {
          <input
            type="text"
            name="inviteCode"
            [(ngModel)]="inviteCode"
            placeholder="Invite code"
            autocomplete="off"
            class="w-full rounded-xl border border-slate-300 px-3 py-2.5 uppercase focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <p class="text-xs text-slate-400">Ask a family admin for the invite code.</p>
        } @else {
          <input
            type="text"
            name="familyName"
            [(ngModel)]="familyName"
            placeholder="Household name (optional)"
            autocomplete="off"
            class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <p class="text-xs text-slate-400">
            Only the first account can create a household; you'll be its admin.
          </p>
        }

        @if (error()) {
          <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error() }}</p>
        }

        <button
          type="submit"
          [disabled]="submitting() || !canSubmit()"
          class="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
        >
          {{ submitting() ? 'Creating…' : 'Create account' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-slate-500">
        Already have an account?
        <a routerLink="/login" class="font-medium text-emerald-600 hover:underline">Sign in</a>
      </p>
    </div>
  `,
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly displayName = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly inviteCode = signal('');
  protected readonly familyName = signal('');
  protected readonly mode = signal<Mode>('join');
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);

  protected canSubmit(): boolean {
    const base = !!this.displayName().trim() && !!this.email().trim() && this.password().length >= 8;
    return this.mode() === 'join' ? base && !!this.inviteCode().trim() : base;
  }

  protected submit(): void {
    if (this.submitting() || !this.canSubmit()) return;
    this.error.set(null);
    this.submitting.set(true);
    this.auth
      .register({
        displayName: this.displayName().trim(),
        email: this.email().trim(),
        password: this.password(),
        inviteCode: this.mode() === 'join' ? this.inviteCode().trim() : undefined,
        familyName: this.mode() === 'create' ? this.familyName().trim() || undefined : undefined,
      })
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          this.error.set(this.messageFor(err.status));
        },
      });
  }

  private messageFor(status: number): string {
    switch (status) {
      case 409:
        return 'That email is already registered.';
      case 400:
        return 'Invalid or missing invite code. If you are the first user, choose "New household".';
      default:
        return 'Could not create your account. Please try again.';
    }
  }
}
