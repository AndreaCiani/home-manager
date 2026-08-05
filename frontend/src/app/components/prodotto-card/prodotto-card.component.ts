import { Component, computed, input, output } from '@angular/core';

import { CATEGORIE, Prodotto } from '../../models/prodotto.model';

/**
 * Card di un prodotto della dispensa, con evidenziazione della scadenza
 * ("scade tra X giorni" / "scaduto") per ridurre gli sprechi.
 */
@Component({
  selector: 'app-prodotto-card',
  template: `
    <li class="flex items-start gap-3 rounded-xl border bg-white p-3" [class]="bordo()">
      <span class="text-2xl" aria-hidden="true">{{ icona() }}</span>

      <div class="min-w-0 flex-1">
        <p class="truncate font-medium">{{ prodotto().nome }}</p>
        <p class="text-xs text-slate-500">
          {{ etichettaCategoria() }}
          @if (prodotto().quantita) {
            · {{ prodotto().quantita }}{{ prodotto().unita ? ' ' + prodotto().unita : '' }}
          }
        </p>
        @if (testoScadenza()) {
          <p class="mt-1 text-xs font-medium" [class]="coloreScadenza()">
            ⏰ {{ testoScadenza() }}
          </p>
        }
      </div>

      <button
        type="button"
        class="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
        (click)="rimuovi.emit(prodotto())"
        [attr.aria-label]="'Rimuovi ' + prodotto().nome"
      >
        🗑️
      </button>
    </li>
  `,
})
export class ProdottoCardComponent {
  readonly prodotto = input.required<Prodotto>();
  readonly rimuovi = output<Prodotto>();

  private readonly icone: Record<string, string> = {
    FRESCO: '🥬',
    DISPENSA: '🥫',
    SURGELATO: '🧊',
    BEVANDE: '🥤',
    ALTRO: '📦',
  };

  readonly icona = computed(() => this.icone[this.prodotto().categoria] ?? '📦');

  readonly etichettaCategoria = computed(
    () => CATEGORIE.find((c) => c.valore === this.prodotto().categoria)?.etichetta ?? 'Altro',
  );

  /** Giorni mancanti alla scadenza (negativo = già scaduto), null se non impostata. */
  private readonly giorniAllaScadenza = computed<number | null>(() => {
    const data = this.prodotto().dataScadenza;
    if (!data) return null;
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const scadenza = new Date(data + 'T00:00:00');
    return Math.round((scadenza.getTime() - oggi.getTime()) / 86_400_000);
  });

  readonly testoScadenza = computed(() => {
    const g = this.giorniAllaScadenza();
    if (g === null) return null;
    if (g < 0) return `Scaduto da ${-g} ${-g === 1 ? 'giorno' : 'giorni'}`;
    if (g === 0) return 'Scade oggi';
    if (g === 1) return 'Scade domani';
    return `Scade tra ${g} giorni`;
  });

  readonly coloreScadenza = computed(() => {
    const g = this.giorniAllaScadenza();
    if (g === null) return '';
    if (g < 0) return 'text-red-600';
    if (g <= 3) return 'text-amber-600';
    return 'text-slate-500';
  });

  readonly bordo = computed(() => {
    const g = this.giorniAllaScadenza();
    if (g === null) return 'border-slate-200';
    if (g < 0) return 'border-red-300';
    if (g <= 3) return 'border-amber-300';
    return 'border-slate-200';
  });
}
