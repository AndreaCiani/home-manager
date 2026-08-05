import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CATEGORIE, Categoria, Prodotto } from '../../models/prodotto.model';
import { ProdottoService } from '../../services/prodotto.service';
import { ProdottoCardComponent } from '../../components/prodotto-card/prodotto-card.component';

interface NuovoProdotto {
  nome: string;
  quantita: number | null;
  unita: string;
  categoria: Categoria;
  dataScadenza: string;
}

function formVuoto(): NuovoProdotto {
  return { nome: '', quantita: null, unita: '', categoria: 'ALTRO', dataScadenza: '' };
}

/** Soglia (giorni) entro cui un prodotto è considerato "in scadenza". */
const SOGLIA_SCADENZA = 7;

/**
 * 📦 Dispensa: inventario dei prodotti in casa con quantità, categoria e
 * scadenze. In cima gli articoli in scadenza (o scaduti) per ridurre gli sprechi.
 */
@Component({
  selector: 'app-dispensa',
  imports: [FormsModule, ProdottoCardComponent],
  template: `
    <section>
      <h2 class="mb-4 text-xl font-bold">📦 Dispensa</h2>

      <!-- Form di aggiunta -->
      <form (ngSubmit)="aggiungi()" class="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <input
          type="text"
          name="nome"
          [(ngModel)]="nuovo.nome"
          placeholder="Nome prodotto (es. Latte)"
          autocomplete="off"
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />

        <div class="flex gap-2">
          <input
            type="number"
            name="quantita"
            [(ngModel)]="nuovo.quantita"
            placeholder="Quantità"
            min="0"
            step="any"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <input
            type="text"
            name="unita"
            [(ngModel)]="nuovo.unita"
            placeholder="Unità (pz, L, kg)"
            autocomplete="off"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div class="flex gap-2">
          <select
            name="categoria"
            [(ngModel)]="nuovo.categoria"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            @for (cat of categorie; track cat.valore) {
              <option [value]="cat.valore">{{ cat.etichetta }}</option>
            }
          </select>
          <input
            type="date"
            name="dataScadenza"
            [(ngModel)]="nuovo.dataScadenza"
            aria-label="Data di scadenza"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          [disabled]="!nuovo.nome.trim()"
          class="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
        >
          Aggiungi alla dispensa
        </button>
      </form>

      @if (errore()) {
        <p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ errore() }}</p>
      }

      @if (caricamento()) {
        <p class="py-8 text-center text-slate-400">Caricamento…</p>
      } @else {
        <!-- In scadenza -->
        @if (inScadenza().length) {
          <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-600">
            ⏰ In scadenza ({{ inScadenza().length }})
          </h3>
          <ul class="mb-6 space-y-2">
            @for (p of inScadenza(); track p.id) {
              <app-prodotto-card [prodotto]="p" (rimuovi)="rimuovi($event)" />
            }
          </ul>
        }

        <!-- Tutti i prodotti -->
        @if (prodotti().length) {
          <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            In dispensa ({{ prodotti().length }})
          </h3>
          <ul class="space-y-2">
            @for (p of prodotti(); track p.id) {
              <app-prodotto-card [prodotto]="p" (rimuovi)="rimuovi($event)" />
            }
          </ul>
        } @else {
          <p class="py-8 text-center text-slate-400">
            La dispensa è vuota. Aggiungi il primo prodotto! 📦
          </p>
        }
      }
    </section>
  `,
})
export class DispensaComponent implements OnInit {
  private readonly service = inject(ProdottoService);

  protected readonly categorie = CATEGORIE;
  protected nuovo: NuovoProdotto = formVuoto();

  protected readonly prodotti = signal<Prodotto[]>([]);
  protected readonly caricamento = signal(true);
  protected readonly errore = signal<string | null>(null);

  /** Prodotti con scadenza entro la soglia (inclusi i già scaduti), i più urgenti in cima. */
  protected readonly inScadenza = computed(() => {
    const limite = new Date();
    limite.setHours(0, 0, 0, 0);
    limite.setDate(limite.getDate() + SOGLIA_SCADENZA);
    return this.prodotti()
      .filter((p) => p.dataScadenza && new Date(p.dataScadenza + 'T00:00:00') <= limite)
      .sort((a, b) => (a.dataScadenza! < b.dataScadenza! ? -1 : 1));
  });

  ngOnInit(): void {
    this.carica();
  }

  private carica(): void {
    this.caricamento.set(true);
    this.service.elenco().subscribe({
      next: (prodotti) => {
        this.prodotti.set(prodotti);
        this.caricamento.set(false);
      },
      error: () => {
        this.errore.set('Impossibile caricare la dispensa. Il backend è avviato?');
        this.caricamento.set(false);
      },
    });
  }

  protected aggiungi(): void {
    const nome = this.nuovo.nome.trim();
    if (!nome) return;
    this.errore.set(null);
    const prodotto: Prodotto = {
      nome,
      quantita: this.nuovo.quantita ?? null,
      unita: this.nuovo.unita.trim() || null,
      categoria: this.nuovo.categoria,
      dataScadenza: this.nuovo.dataScadenza || null,
    };
    this.service.aggiungi(prodotto).subscribe({
      next: (salvato) => {
        this.prodotti.update((p) => [...p, salvato]);
        this.nuovo = formVuoto();
      },
      error: () => this.errore.set('Aggiunta non riuscita. Riprova.'),
    });
  }

  protected rimuovi(prodotto: Prodotto): void {
    if (prodotto.id == null) return;
    this.service.rimuovi(prodotto.id).subscribe({
      next: () => this.prodotti.update((p) => p.filter((x) => x.id !== prodotto.id)),
      error: () => this.errore.set('Rimozione non riuscita. Riprova.'),
    });
  }
}
