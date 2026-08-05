# 🅰️ Frontend — Angular + Tailwind (PWA)

**Angular 19** app (standalone) with pure **Tailwind CSS**, set up as an installable **PWA**. It implements **Module 1 — Shopping & Pantry**.

## 🚀 Development (hot reload)

From the `frontend/` folder:

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
    │   ├── models/         🧩 types mirroring the backend entities (Product, ShoppingItem)
    │   ├── services/       🔗 HTTP calls to /api (ProductService, ShoppingItemService)
    │   ├── components/     🧱 reusable pieces (product card, list row)
    │   ├── pages/
    │   │   ├── shopping-list/  🛒 shared list
    │   │   └── pantry/         📦 inventory + expiry
    │   ├── app.component.ts    shell: header + navigation
    │   └── app.routes.ts       routes (/shopping, /pantry)
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
