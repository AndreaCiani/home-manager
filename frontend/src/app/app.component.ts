import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Application shell: header, content area (router-outlet) and a
 * mobile-first bottom navigation bar between Shopping and Pantry.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="mx-auto flex min-h-screen max-w-2xl flex-col">
      <!-- Header -->
      <header class="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur">
        <h1 class="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <span aria-hidden="true">🏠</span> home-manager
        </h1>
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
        </div>
      </nav>
    </div>
  `,
})
export class AppComponent {}
