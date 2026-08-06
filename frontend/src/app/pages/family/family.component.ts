import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { FamilyService } from '../../services/family.service';
import { Family, FamilyMember } from '../../models/user.model';

/**
 * 👪 Family / account screen: household, members (with admin management),
 * invite code, change password, and sign-out.
 */
@Component({
  selector: 'app-family',
  imports: [FormsModule],
  template: `
    <section>
      <h2 class="mb-4 text-xl font-bold">👪 Family</h2>

      @if (error()) {
        <p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error() }}</p>
      }
      @if (notice()) {
        <p class="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{{ notice() }}</p>
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
              [disabled]="busy()"
            >
              Regenerate code
            </button>
          </div>
        }

        <!-- Members -->
        <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Members ({{ fam.members.length }})
        </h3>
        <ul class="space-y-2">
          @for (m of fam.members; track m.id) {
            <li class="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <p class="truncate font-medium">
                    {{ m.displayName }}
                    @if (m.id === auth.currentUser()?.id) {
                      <span class="text-xs font-normal text-slate-400">(you)</span>
                    }
                  </p>
                  <p class="truncate text-xs text-slate-500">{{ m.email }}</p>
                </div>
                <span
                  class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                  [class]="m.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
                >
                  {{ m.role }}
                </span>
              </div>

              <!-- Admin controls for other members -->
              @if (auth.isAdmin() && m.id !== auth.currentUser()?.id) {
                <div class="mt-2 flex gap-2">
                  @if (m.role === 'MEMBER') {
                    <button
                      type="button"
                      class="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40"
                      (click)="setRole(m, 'ADMIN')"
                      [disabled]="busy()"
                    >
                      Make admin
                    </button>
                  } @else {
                    <button
                      type="button"
                      class="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40"
                      (click)="setRole(m, 'MEMBER')"
                      [disabled]="busy()"
                    >
                      Make member
                    </button>
                  }
                  <button
                    type="button"
                    class="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40"
                    (click)="remove(m)"
                    [disabled]="busy()"
                  >
                    Remove
                  </button>
                </div>
              }
            </li>
          }
        </ul>

        <!-- Change password -->
        <h3 class="mb-2 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Change password
        </h3>
        <form (ngSubmit)="changePassword()" class="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <input
            type="password"
            name="currentPassword"
            [(ngModel)]="currentPassword"
            placeholder="Current password"
            autocomplete="current-password"
            class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <input
            type="password"
            name="newPassword"
            [(ngModel)]="newPassword"
            placeholder="New password (min 8 characters)"
            autocomplete="new-password"
            class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          @if (passwordError()) {
            <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ passwordError() }}</p>
          }
          <button
            type="submit"
            [disabled]="changingPassword() || !currentPassword() || newPassword().length < 8"
            class="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
          >
            {{ changingPassword() ? 'Updating…' : 'Update password' }}
          </button>
        </form>

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
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);

  protected readonly currentPassword = signal('');
  protected readonly newPassword = signal('');
  protected readonly changingPassword = signal(false);
  protected readonly passwordError = signal<string | null>(null);

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
    this.run(this.service.regenerateInviteCode(), 'Invite code regenerated.');
  }

  protected setRole(member: FamilyMember, role: 'ADMIN' | 'MEMBER'): void {
    this.run(
      this.service.setMemberRole(member.id, role),
      `${member.displayName} is now ${role === 'ADMIN' ? 'an admin' : 'a member'}.`,
    );
  }

  protected remove(member: FamilyMember): void {
    this.run(this.service.removeMember(member.id), `${member.displayName} was removed.`);
  }

  /** Runs a family-mutating call, updating the view and showing feedback. */
  private run(call: Observable<Family>, successMessage: string): void {
    this.busy.set(true);
    this.error.set(null);
    this.notice.set(null);
    call.subscribe({
      next: (fam) => {
        this.family.set(fam);
        this.notice.set(successMessage);
        this.busy.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.busy.set(false);
        this.error.set(
          err.status === 400
            ? 'The family must keep at least one admin.'
            : 'Action failed. Please try again.',
        );
      },
    });
  }

  protected changePassword(): void {
    if (this.changingPassword()) return;
    this.passwordError.set(null);
    this.notice.set(null);
    this.changingPassword.set(true);
    this.auth.changePassword(this.currentPassword(), this.newPassword()).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.currentPassword.set('');
        this.newPassword.set('');
        this.notice.set('Password updated.');
      },
      error: (err: HttpErrorResponse) => {
        this.changingPassword.set(false);
        this.passwordError.set(
          err.status === 400
            ? 'Your current password is incorrect.'
            : 'Could not update the password. Please try again.',
        );
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
