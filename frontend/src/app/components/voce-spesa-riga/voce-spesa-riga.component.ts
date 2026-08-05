import { Component, input, output } from '@angular/core';

import { VoceSpesa } from '../../models/voce-spesa.model';

/**
 * Riga di una voce della lista della spesa: spunta "presa" e rimozione.
 */
@Component({
  selector: 'app-voce-spesa-riga',
  template: `
    <li class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <input
        type="checkbox"
        class="h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        [checked]="voce().presa"
        (change)="togglePresa.emit(voce())"
        [attr.aria-label]="'Segna ' + voce().nome + ' come presa'"
      />

      <div class="min-w-0 flex-1" [class.opacity-50]="voce().presa">
        <p class="truncate font-medium" [class.line-through]="voce().presa">{{ voce().nome }}</p>
        @if (voce().quantita) {
          <p class="text-xs text-slate-500">Quantità: {{ voce().quantita }}</p>
        }
      </div>

      <button
        type="button"
        class="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
        (click)="rimuovi.emit(voce())"
        [attr.aria-label]="'Rimuovi ' + voce().nome"
      >
        🗑️
      </button>
    </li>
  `,
})
export class VoceSpesaRigaComponent {
  readonly voce = input.required<VoceSpesa>();
  readonly togglePresa = output<VoceSpesa>();
  readonly rimuovi = output<VoceSpesa>();
}
