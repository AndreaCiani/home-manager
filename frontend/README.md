# 🅰️ Frontend — Angular + Tailwind (PWA)

Questa cartella conterrà l'app **Angular 19** (standalone) con **Tailwind CSS** puro, configurata come **PWA**.

> 🚧 Lo scheletro Angular non è ancora generato: va creato con la CLI (`ng new`). Questo README descrive i passi e la struttura prevista, in modo che l'inizializzazione non sovrascriva la configurazione del progetto.

## Passi di inizializzazione (prossimo step)

Dalla cartella `home-manager/` (verrà eseguito insieme):

```bash
# 1. Genera il progetto Angular dentro ./frontend
ng new frontend --directory frontend --style css --routing --ssr false

# 2. Aggiungi il supporto PWA
cd frontend
ng add @angular/pwa

# 3. Installa e configura Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
# poi configurare tailwind.config.js e gli @tailwind in styles.css
```

I comandi esatti e le versioni verranno fissati al momento dell'esecuzione.

## Struttura prevista

```
frontend/
├── Dockerfile           🐳 build Angular + servizio con Nginx (già presente)
├── nginx.conf           🌐 config Nginx: static + proxy /api + fallback SPA (già presente)
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── dispensa/      📦 inventario + scadenze
│   │   │   └── lista-spesa/   🛒 lista condivisa
│   │   ├── components/        🧩 card prodotto, riga lista, ecc.
│   │   └── services/          🔗 chiamate HTTP al backend (/api/...)
│   ├── styles.css            🎨 direttive @tailwind
│   └── manifest.webmanifest  📱 PWA
├── tailwind.config.js
└── package.json
```

## Note

- **Tailwind puro**: nessuna libreria di componenti. I componenti UI si costruiscono con le utility di Tailwind.
- Le chiamate API usano il prefisso `/api` (in dev via proxy verso `http://localhost:8080`, in produzione via Nginx).
- Vedi [../docs/02-architecture.md](../docs/02-architecture.md) per il quadro completo.
