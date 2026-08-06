# 🏠 home-manager

A **household management app**: a single app, shared across the family, to keep everything about running the home under control.

It was born to solve a concrete, everyday problem (shopping, pantry, expiry) and is designed to **grow module by module** over time.

> ⚠️ Working name: `home-manager`. It is easy to rename later (folder + a few references in configuration).

---

## 🎯 What it does (first module)

**Module 1 — Shopping & Pantry** (the MVP, the one we use with the family right away):

- 🛒 **Shared shopping list** — everyone in the family adds/ticks items in real time
- 📦 **Pantry** — what's at home, with quantities
- ⏰ **Expiry** — alerts when a product is about to expire → less waste

The later modules (bills, chores, budget, documents…) are in the [roadmap](docs/04-modules.md).

---

## 🧱 Tech stack

| Layer | Technology |
|---|---|
| Frontend | **Angular 19** (standalone) + **Tailwind CSS** (pure), as an installable **PWA** |
| Backend | **Java 21** + **Spring Boot** (REST API) |
| Database | **PostgreSQL** |
| Serving | **Nginx** serves the PWA and proxies the APIs |
| Orchestration | **Docker Compose** (everything in containers) |

Details and rationale in [docs/02-architecture.md](docs/02-architecture.md) and [docs/03-decisions.md](docs/03-decisions.md).

---

## 🚀 Quick start (locally)

> Requirements: **Docker** installed. No need to install Java, Node or Postgres by hand.

```bash
docker compose up
```

Then open the browser at:

- App (frontend): http://localhost:4200
- API (backend): http://localhost:8080/api

For development with frontend hot reload, see [docs/02-architecture.md](docs/02-architecture.md#development-vs-production-mode).

---

## 📁 Project structure

```
home-manager/
├── docker-compose.yml      🐳 orchestrates the 3 services
├── .env.example            🔧 environment variables (copy to .env)
├── docs/                   📖 project documentation and decisions
├── backend/                ☕ Spring Boot (REST API)
└── frontend/               🅰️ Angular + Tailwind (PWA)
```

---

## 📖 Documentation

- [01 — Vision](docs/01-vision.md) — what it is and why
- [02 — Architecture](docs/02-architecture.md) — how it's built technically
- [03 — Decisions](docs/03-decisions.md) — every choice made and the reasoning
- [04 — Modules & Roadmap](docs/04-modules.md) — what exists now and what's coming
- [05 — Deployment](docs/05-deployment.md) — how to take it online from home (Docker, Cloudflare, security)

---

## 🗺️ Project status

🏗️ **Current phase:** Modules 1–3 in place and tested; hardening for going online next.

- ☕ **Backend**: REST API for the shopping list, pantry (with expiry) and **deadlines & bills** (with recurrence), plus **authentication & families** (Spring Security, session cookies, BCrypt, CSRF). Covered by integration tests.
- 🅰️ **Frontend**: Angular 19 + Tailwind (PWA) with Home, 🛒 Shopping list, 📦 Pantry, 📅 Deadlines & Bills, and account/family screens. End-to-end tested with Playwright ([e2e/](e2e/)).
- 🔑 **Accounts & families**: invite-based registration; each household's data is private to its members; admins manage members and the invite code.

Modules delivered: **1 — Shopping & Pantry**, **2 — Users & Family**, **3 — Deadlines & Bills** (see [docs/04-modules.md](docs/04-modules.md)).

Next steps: prepare for **going online** ([deployment](docs/05-deployment.md)) — HTTPS via Cloudflare, database backups — and continue the roadmap.
