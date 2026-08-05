# 02 — Architecture

## Overview

Three services, all containerized and orchestrated by **Docker Compose**. A single command (`docker compose up`) starts the whole system — nothing to set up by hand.

```
                 ┌───────────────────── docker compose ─────────────────────┐
                 │                                                           │
  browser  ─────▶│  🌐 nginx ──┬──▶ Angular files (PWA, HTML/JS/CSS)         │
  (phone/pc)     │             │                                            │
                 │             └──▶ /api/* ──▶ ☕ Spring Boot ──▶ 🐘 Postgres │
                 │                :80            :8080              :5432     │
                 └───────────────────────────────────────────────────────────┘
```

## The three services

### 🅰️ Frontend — Angular 19 + Tailwind CSS (PWA)

- **Angular 19** with *standalone* components (the modern approach, without NgModules).
- **Pure Tailwind CSS** for styling: no Angular Material, no component library. Maximum freedom over the look. We build the components (cards, forms, lists) ourselves.
- **PWA**: the app is installable ("Add to Home Screen") and works offline thanks to the service worker. A single codebase serves both phone and desktop.
- In production it is served by **Nginx** (see below).

### ☕ Backend — Java 21 + Spring Boot

- Exposes a **REST API** under `/api` (e.g. `/api/products`, `/api/shopping-items`).
- **Spring Data JPA** for database access (repositories generated automatically).
- **Bean Validation** to validate incoming data.
- Configured via environment variables (see `.env.example`).

### 🐘 Database — PostgreSQL 16

- The central relational database, shared across all users/family members.
- Data persists in a Docker volume (`pgdata`).
- ⚠️ In production it must **not** be exposed to the outside: only the backend reaches it, over Docker's internal network.

## How files are served

Choice: **Nginx serves the frontend + Spring serves only the APIs.**

- Nginx was built to serve static files (very fast, great handling of cache and the PWA service worker).
- Nginx also acts as a **reverse proxy**: it forwards `/api/*` requests to Spring Boot; everything else is the Angular app (with an SPA *fallback* for client-side routes).

Alternative considered and discarded: letting Spring Boot serve everything (a single artifact). Simpler to deploy, but it couples frontend and backend, and Java is not ideal as a static file server. Details in [03-decisions.md](03-decisions.md).

## Development vs production mode

| | Development | Production |
|---|---|---|
| Frontend | `ng serve` (Angular dev server, **hot reload** on :4200) | static build served by **Nginx** |
| Backend | Spring Boot running (hot reload with devtools) | jar inside a Docker image |
| How APIs are called | the dev server proxies to :8080 (or CORS enabled) | Nginx forwards `/api` to the backend |

In development you can work comfortably with hot reload; Docker Compose is mainly for the "release" version and for having the database ready without installing it.

## Flow of a request (example)

1. The user opens the shopping list → Angular calls `GET /api/shopping-items`.
2. Nginx receives the request and, seeing `/api`, forwards it to Spring Boot.
3. Spring Boot queries Postgres through the JPA repository.
4. A JSON with the items comes back → Angular shows them in the list.

## Code structure

```
backend/src/main/java/com/homemanager/
├── HomeManagerApplication.java      entry point
├── config/                          configuration (CORS, etc.)
└── pantry/                          MODULE 1: Shopping & Pantry
    ├── model/                       entities (Product, ShoppingItem)
    ├── repository/                  data access (JPA)
    ├── controller/                  REST endpoints
    └── dto/                         data transfer objects (input/output)

frontend/src/                        (generated with "ng new", see frontend/README.md)
└── app/
    ├── pages/                       screens: pantry, shopping list
    ├── components/                  reusable pieces (product card, list row)
    └── services/                    HTTP calls to the backend
```

Every future module will follow the same layout (one folder per module, on both backend and frontend), to keep the project tidy as it grows.
