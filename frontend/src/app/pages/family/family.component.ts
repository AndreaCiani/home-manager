import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { FamilyService } from '../../services/family.service';
import { Family } from '../../models/user.model';

/**
 * 👪 Family / account screen: household name, members, invite code (admins),
 * and sign-out.
 */
@Component({
  selector: 'app-family',
  template: `
    <section>
      <h2 class="mb-4 text-xl font-bold">👪 Family</h2>

      @if (error()) {
        <p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error() }}</p>
      }

      @if (loading()) {
        <p class="py-8 text-center text-slate-400">Loading…</p>
      } @else {
        @if (family(); as fam) {
        <div class="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
          <p class="text-xs uppercase tracking-wide text-slate-400">Household</p>
          <p class="text-lg font-semibold">{{ fam.name }}</p>
          <p class="mt-1 text-sm text-slate-500">
            Signed in as {{ auth.currentUser()?.displayName }} ({{ auth.currentUser()?.role }})
          </p>
        </div>

        <!-- Invite code (admins only) -->
        @if (fam.inviteCode) {
          <div class="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p class="text-xs uppercase tracking-wide text-emerald-700">Invite code</p>
            <p class="mt-1 font-mono text-2xl font-bold tracking-widest text-emerald-800">
              {{ fam.inviteCode }}
            </p>
            <p class="mt-1 text-sm text-emerald-700">Share this code so family members can register.</p>
            <button
              type="button"
              class="mt-3 rounded-lg border border-emerald-300 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-40"
              (click)="regenerate()"
              [disabled]="regenerating()"
            >
              {{ regenerating() ? 'Regenerating…' : 'Regenerate code' }}
            </button>
          </div>
        }

        <!-- Members -->
        <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Members ({{ fam.members.length }})
        </h3>
        <ul class="space-y-2">
          @for (m of fam.members; track m.id) {
            <li class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <div class="min-w-0">
                <p class="truncate font-medium">{{ m.displayName }}</p>
                <p class="truncate text-xs text-slate-500">{{ m.email }}</p>
              </div>
              <span
                class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                [class]="m.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
              >
                {{ m.role }}
              </span>
            </li>
          }
        </ul>

        <button
          type="button"
          class="mt-8 w-full rounded-xl border border-red-200 px-4 py-2.5 font-medium text-red-600 transition-colors hover:bg-red-50"
          (click)="logout()"
        >
          Log out
        </button>
        }
      }
    </section>
  `,
})
export class FamilyComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly service = inject(FamilyService);
  private readonly router = inject(Router);

  protected readonly family = signal<Family | null>(null);
  protected readonly loading = signal(true);
  protected readonly regenerating = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.service.get().subscribe({
      next: (fam) => {
        this.family.set(fam);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your family.');
        this.loading.set(false);
      },
    });
  }

  protected regenerate(): void {
    this.regenerating.set(true);
    this.error.set(null);
    this.service.regenerateInviteCode().subscribe({
      next: (fam) => {
        this.family.set(fam);
        this.regenerating.set(false);
      },
      error: () => {
        this.error.set('Could not regenerate the invite code.');
        this.regenerating.set(false);
      },
    });
  }

  protected logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
