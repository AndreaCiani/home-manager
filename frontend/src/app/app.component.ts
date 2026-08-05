import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Guscio dell'applicazione: header, area contenuto (router-outlet) e
 * barra di navigazione inferiore (mobile-first) tra Spesa e Dispensa.
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

      <!-- Contenuto -->
      <main class="flex-1 px-4 py-5 pb-24">
        <router-outlet />
      </main>

      <!-- Navigazione inferiore -->
      <nav
        class="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white"
        aria-label="Navigazione principale"
      >
        <div class="mx-auto flex max-w-2xl">
          <a
            routerLink="/spesa"
            routerLinkActive="text-emerald-600"
            #spesa="routerLinkActive"
            class="flex flex-1 flex-col items-center gap-1 py-3 text-sm text-slate-500 transition-colors"
            [attr.aria-current]="spesa.isActive ? 'page' : null"
          >
            <span class="text-xl" aria-hidden="true">🛒</span>
            Spesa
          </a>
          <a
            routerLink="/dispensa"
            routerLinkActive="text-emerald-600"
            #dispensa="routerLinkActive"
            class="flex flex-1 flex-col items-center gap-1 py-3 text-sm text-slate-500 transition-colors"
            [attr.aria-current]="dispensa.isActive ? 'page' : null"
          >
            <span class="text-xl" aria-hidden="true">📦</span>
            Dispensa
          </a>
        </div>
      </nav>
    </div>
  `,
})
export class AppComponent {}
