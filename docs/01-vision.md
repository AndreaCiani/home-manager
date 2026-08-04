# 01 — Visione

## In una frase

**home-manager è un gestionale per la casa**: un'unica applicazione, condivisa in famiglia, che raccoglie in un solo posto tutto ciò che serve a gestire la vita domestica — partendo dalla spesa e dalla dispensa.

## Da dove nasce

L'idea è nata da un percorso di ragionamento (registrato in [03-decisions.md](03-decisions.md)). I punti fermi emersi:

- 🎯 **Risolvere un problema proprio.** Non un'app "per il mercato", ma qualcosa che serve *davvero* a chi la costruisce e alla sua famiglia. Questo garantisce un utente reale dal giorno 1 e feedback immediato.
- 👨‍👩‍👧 **Uso familiare e condiviso.** Più persone, più dispositivi, dati condivisi in tempo reale. Da qui la scelta di un vero backend + database centrale (non un'app locale mono-utente).
- 📱 **Comodità da telefono.** La si usa in cucina, davanti al frigo, al supermercato. Deve stare bene sul telefono → **PWA installabile**.
- 🧩 **Deve poter crescere.** Non un giocattolo usa-e-getta, ma un progetto "corposo" che si espande **un modulo alla volta** senza dover essere riscritto.

## I due bisogni originari

L'utente ha identificato due frustrazioni ricorrenti, che nel dominio "casa" si traducono così:

1. **"Perdo / non ritrovo informazioni"** → dove sono le scadenze? cosa c'è in dispensa? cosa manca? → un posto unico e ordinato.
2. **"Non ho visibilità sui miei dati"** → quanto spendo? cosa sta per scadere? → viste chiare e aggregate.

## Principio guida: crescita a moduli

Il progetto **non è** "un'app della spesa". È un contenitore che ospita moduli. Il primo è Spesa & Dispensa; gli altri arrivano nel tempo.

```
🏠 home-manager
├── 🛒 Spesa & Dispensa       ← MODULO 1 (in costruzione)
├── 📅 Scadenze & Bollette    ← futuro
├── 🧹 Faccende domestiche     ← futuro
├── 💰 Budget di casa          ← futuro
└── 📄 Documenti & Manutenzioni← futuro
```

Vedi la roadmap dettagliata in [04-modules.md](04-modules.md).

## Non-obiettivi (per ora)

- ❌ Non è un prodotto SaaS multi-tenant per il mercato: è per la propria casa (poi si vedrà).
- ❌ Niente app store all'inizio: si parte come PWA. Lo store resta una possibilità futura (Capacitor).
- ❌ Niente funzioni avanzate al primo colpo: prima un Modulo 1 solido e usato davvero.
