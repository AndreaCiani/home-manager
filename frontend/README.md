# 🅰️ Frontend — Angular + Tailwind (PWA)

App **Angular 19** (standalone) con **Tailwind CSS** puro, configurata come **PWA** installabile. Realizza il **Modulo 1 — Spesa & Dispensa**.

## 🚀 Sviluppo (ricarica automatica)

Dalla cartella `frontend/`:

```bash
npm install        # solo la prima volta
npm start          # ng serve su http://localhost:4200
```

Il dev-server fa da **proxy**: le chiamate a `/api` vengono inoltrate al backend su `http://localhost:8080` (vedi [proxy.conf.json](proxy.conf.json)). Avvia quindi anche il backend (o l'intero stack con `docker compose up`).

## 📦 Build di produzione

```bash
npm run build      # output in dist/frontend/browser
```

È lo stesso comando usato dal [Dockerfile](Dockerfile): Nginx serve i file statici da `dist/frontend/browser` e inoltra `/api` al backend (vedi [nginx.conf](nginx.conf)).

## 🗂️ Struttura

```
frontend/
├── Dockerfile              🐳 build Angular + servizio con Nginx
├── nginx.conf              🌐 static + proxy /api + fallback SPA
├── proxy.conf.json         🔗 proxy /api → :8080 (solo sviluppo)
├── tailwind.config.js      🎨 configurazione Tailwind
├── ngsw-config.json        📱 configurazione service worker (PWA)
└── src/
    ├── app/
    │   ├── models/         🧩 tipi allineati alle entità backend (Prodotto, VoceSpesa)
    │   ├── services/       🔗 chiamate HTTP a /api (ProdottoService, VoceSpesaService)
    │   ├── components/     🧱 pezzi riusabili (card prodotto, riga lista)
    │   ├── pages/
    │   │   ├── lista-spesa/  🛒 lista condivisa
    │   │   └── dispensa/     📦 inventario + scadenze
    │   ├── app.component.ts  guscio: header + navigazione
    │   └── app.routes.ts     rotte (/spesa, /dispensa)
    ├── styles.css           direttive @tailwind + stili globali
    ├── index.html
    └── public/
        ├── manifest.webmanifest  📱 PWA
        └── icons/                icone PWA
```

## 📝 Note

- **Tailwind puro**: nessuna libreria di componenti. La UI è costruita con le utility di Tailwind e componenti standalone.
- **Angular moderno**: componenti *standalone*, *signals*, `inject()` e il nuovo control flow (`@if` / `@for`).
- Le pagine gestiscono con grazia il backend non raggiungibile mostrando un messaggio, senza bloccare l'app.
- Vedi [../docs/02-architecture.md](../docs/02-architecture.md) per il quadro completo.
