import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { VoceSpesa } from '../../models/voce-spesa.model';
import { VoceSpesaService } from '../../services/voce-spesa.service';
import { VoceSpesaRigaComponent } from '../../components/voce-spesa-riga/voce-spesa-riga.component';

/**
 * 🛒 Lista della spesa condivisa: aggiunta rapida, spunta "presa", rimozione.
 */
@Component({
  selector: 'app-lista-spesa',
  imports: [FormsModule, VoceSpesaRigaComponent],
  template: `
    <section>
      <h2 class="mb-4 text-xl font-bold">🛒 Lista della spesa</h2>

      <!-- Aggiunta rapida -->
      <form (ngSubmit)="aggiungi()" class="mb-5 flex gap-2">
        <input
          type="text"
          name="nuovoNome"
          [(ngModel)]="nuovoNome"
          placeholder="Aggiungi un articolo…"
          autocomplete="off"
          class="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="submit"
          [disabled]="!nuovoNome().trim()"
          class="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
        >
          Aggiungi
        </button>
      </form>

      @if (errore()) {
        <p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ errore() }}</p>
      }

      @if (caricamento()) {
        <p class="py-8 text-center text-slate-400">Caricamento…</p>
      } @else {
        <!-- Da prendere -->
        @if (daPrendere().length) {
          <ul class="space-y-2">
            @for (voce of daPrendere(); track voce.id) {
              <app-voce-spesa-riga
                [voce]="voce"
                (togglePresa)="togglePresa($event)"
                (rimuovi)="rimuovi($event)"
              />
            }
          </ul>
        } @else {
          <p class="py-8 text-center text-slate-400">
            Niente da comprare. Aggiungi il primo articolo! 🎉
          </p>
        }

        <!-- Già prese -->
        @if (prese().length) {
          <h3 class="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Già prese ({{ prese().length }})
          </h3>
          <ul class="space-y-2">
            @for (voce of prese(); track voce.id) {
              <app-voce-spesa-riga
                [voce]="voce"
                (togglePresa)="togglePresa($event)"
                (rimuovi)="rimuovi($event)"
              />
            }
          </ul>
        }
      }
    </section>
  `,
})
export class ListaSpesaComponent implements OnInit {
  private readonly service = inject(VoceSpesaService);

  protected readonly voci = signal<VoceSpesa[]>([]);
  protected readonly caricamento = signal(true);
  protected readonly errore = signal<string | null>(null);
  protected readonly nuovoNome = signal('');

  protected readonly daPrendere = computed(() => this.voci().filter((v) => !v.presa));
  protected readonly prese = computed(() => this.voci().filter((v) => v.presa));

  ngOnInit(): void {
    this.carica();
  }

  private carica(): void {
    this.caricamento.set(true);
    this.service.elenco().subscribe({
      next: (voci) => {
        this.voci.set(voci);
        this.caricamento.set(false);
      },
      error: () => {
        this.errore.set('Impossibile caricare la lista. Il backend è avviato?');
        this.caricamento.set(false);
      },
    });
  }

  protected aggiungi(): void {
    const nome = this.nuovoNome().trim();
    if (!nome) return;
    this.errore.set(null);
    this.service.aggiungi({ nome, presa: false }).subscribe({
      next: (voce) => {
        this.voci.update((v) => [...v, voce]);
        this.nuovoNome.set('');
      },
      error: () => this.errore.set('Aggiunta non riuscita. Riprova.'),
    });
  }

  protected togglePresa(voce: VoceSpesa): void {
    if (voce.id == null) return;
    const aggiornata = { ...voce, presa: !voce.presa };
    this.service.modifica(voce.id, aggiornata).subscribe({
      next: (salvata) => this.voci.update((v) => v.map((x) => (x.id === salvata.id ? salvata : x))),
      error: () => this.errore.set('Aggiornamento non riuscito. Riprova.'),
    });
  }

  protected rimuovi(voce: VoceSpesa): void {
    if (voce.id == null) return;
    this.service.rimuovi(voce.id).subscribe({
      next: () => this.voci.update((v) => v.filter((x) => x.id !== voce.id)),
      error: () => this.errore.set('Rimozione non riuscita. Riprova.'),
    });
  }
}
