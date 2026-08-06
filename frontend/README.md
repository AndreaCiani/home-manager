# 🅰️ Frontend — Angular + Tailwind (PWA)

**Angular 19** app (standalone) with pure **Tailwind CSS**, set up as an installable **PWA**. It implements **Module 1 — Shopping & Pantry**.

## 🚀 Development (hot reload)

Easiest — from the repository root, start db + backend (Docker) and the dev
server together:

```bash
./scripts/dev.sh
```

Or just the frontend, from this folder (start the backend yourself):

```bash
npm install        # first time only
npm start          # ng serve on http://localhost:4200
```

The dev server acts as a **proxy**: calls to `/api` are forwarded to the backend on `http://localhost:8080` (see [proxy.conf.json](proxy.conf.json)). So also start the backend (or the whole stack with `docker compose up`).

## 📦 Production build

```bash
npm run build      # output in dist/frontend/browser
```

This is the same command used by the [Dockerfile](Dockerfile): Nginx serves the static files from `dist/frontend/browser` and forwards `/api` to the backend (see [nginx.conf](nginx.conf)).

## 🗂️ Structure

```
frontend/
├── Dockerfile              🐳 Angular build + serving with Nginx
├── nginx.conf              🌐 static + /api proxy + SPA fallback
├── proxy.conf.json         🔗 /api → :8080 proxy (development only)
├── tailwind.config.js      🎨 Tailwind configuration
├── ngsw-config.json        📱 service worker configuration (PWA)
└── src/
    ├── app/
    │   ├── models/         🧩 types mirroring the backend entities (Product, ShoppingItem, User, Family)
    │   ├── services/       🔗 HTTP calls to /api (products, shopping, auth, family, lookup)
    │   ├── components/     🧱 reusable pieces (product card, list row, barcode scanner)
    │   ├── guards/         🔒 route protection (auth / guest)
    │   ├── interceptors/   🔌 401 handling
    │   ├── pages/
    │   │   ├── dashboard/      🏠 overview
    │   │   ├── shopping-list/  🛒 shared list
    │   │   ├── pantry/         📦 inventory + expiry
    │   │   ├── login/          🔑 sign in
    │   │   ├── register/       🧑‍🤝‍🧑 create/join a household
    │   │   └── family/         👪 members, invite code, password
    │   ├── app.component.ts    shell: header + navigation (when signed in)
    │   └── app.routes.ts       routes (guarded)
    ├── styles.css           @tailwind directives + global styles
    ├── index.html
    └── public/
        ├── manifest.webmanifest  📱 PWA
        └── icons/                PWA icons
```

## 📝 Notes

- **Pure Tailwind**: no component library. The UI is built with Tailwind utilities and standalone components.
- **Modern Angular**: standalone components, *signals*, `inject()` and the new control flow (`@if` / `@for`).
- The pages handle an unreachable backend gracefully by showing a message, without blocking the app.
- See [../docs/02-architecture.md](../docs/02-architecture.md) for the full picture.
