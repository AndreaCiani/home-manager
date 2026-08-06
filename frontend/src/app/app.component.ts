import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

import { AuthService } from './services/auth.service';

/**
 * Application shell. When signed in it shows the header, content and the
 * mobile-first bottom navigation; otherwise it just renders the auth pages.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (auth.isAuthenticated()) {
      <div class="mx-auto flex min-h-screen max-w-2xl flex-col">
        <!-- Header -->
        <header class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur">
          <h1 class="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <span aria-hidden="true">🏠</span> home-manager
          </h1>
          <div class="flex items-center gap-3 text-sm">
            <a
              routerLink="/family"
              routerLinkActive="text-emerald-600"
              class="max-w-[9rem] truncate font-medium text-slate-600"
            >
              👤 {{ auth.currentUser()?.displayName }}
            </a>
            <button
              type="button"
              class="rounded-lg px-2 py-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              (click)="logout()"
            >
              Log out
            </button>
          </div>
        </header>

        <!-- Content -->
        <main class="flex-1 px-4 py-5 pb-24">
          <router-outlet />
        </main>

        <!-- Bottom navigation -->
        <nav
          class="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white"
          aria-label="Main navigation"
        >
          <div class="mx-auto flex max-w-2xl">
            <a
              routerLink="/"
              routerLinkActive="text-emerald-600"
              [routerLinkActiveOptions]="{ exact: true }"
              #home="routerLinkActive"
              class="flex flex-1 flex-col items-center gap-1 py-3 text-sm text-slate-500 transition-colors"
              [attr.aria-current]="home.isActive ? 'page' : null"
            >
              <span class="text-xl" aria-hidden="true">🏠</span>
              Home
            </a>
            <a
              routerLink="/shopping"
              routerLinkActive="text-emerald-600"
              #shopping="routerLinkActive"
              class="flex flex-1 flex-col items-center gap-1 py-3 text-sm text-slate-500 transition-colors"
              [attr.aria-current]="shopping.isActive ? 'page' : null"
            >
              <span class="text-xl" aria-hidden="true">🛒</span>
              Shopping
            </a>
            <a
              routerLink="/pantry"
              routerLinkActive="text-emerald-600"
              #pantry="routerLinkActive"
              class="flex flex-1 flex-col items-center gap-1 py-3 text-sm text-slate-500 transition-colors"
              [attr.aria-current]="pantry.isActive ? 'page' : null"
            >
              <span class="text-xl" aria-hidden="true">📦</span>
              Pantry
            </a>
            <a
              routerLink="/deadlines"
              routerLinkActive="text-emerald-600"
              #deadlines="routerLinkActive"
              class="flex flex-1 flex-col items-center gap-1 py-3 text-sm text-slate-500 transition-colors"
              [attr.aria-current]="deadlines.isActive ? 'page' : null"
            >
              <span class="text-xl" aria-hidden="true">📅</span>
              Bills
            </a>
          </div>
        </nav>
      </div>
    } @else {
      <router-outlet />
    }
  `,
})
export class AppComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
