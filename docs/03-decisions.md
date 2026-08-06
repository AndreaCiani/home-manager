# 03 — Decision log

This document records **all the choices** made during the ideation phase, along with the alternatives considered and the reasoning behind each decision. It serves to remember *why* things are the way they are (and, if needed, to reconsider them knowingly).

---

## D1 — What kind of project

**Decision:** a household management app, for family use, that starts from the Shopping & Pantry module.

**Path:** the starting goal was "solve a problem of my own". Ideas more oriented towards the developer (a "personal cockpit" aggregating data and notes) were explored and discarded: they didn't spark interest because **they weren't a genuinely lived problem**. The idea of the household app, on the other hand, emerged spontaneously → a sign of an authentic need.

---

## D2 — Local-first single-user vs shared app

**Decision:** a **shared** app with backend + central database.

**Why:** the use is family-based (multiple people, multiple devices, data in real time). A local single-user app (initially hypothesised when the user was "just me") doesn't hold up in this scenario. This choice **justifies** the adoption of PostgreSQL and a real backend.

---

## D3 — Database: PostgreSQL

**Decision:** **PostgreSQL**.

**Alternatives:** SQLite (valid only in the local single-user scenario, which later lapsed).

**Why:** reliable, an industry standard, handles multiple users writing simultaneously well. The right choice for a shared app, not just a "safe" one.

---

## D4 — Backend: Java 21 + Spring Boot

**Decision:** **Java 21 + Spring Boot** (with Maven).

**Why:** the user works well with it; a robust, professional and much sought-after stack (also valuable for the CV).

**Awareness of the downside:** it's the most verbose stack (quite a lot of boilerplate). Accepted in exchange for solidity and familiarity.

---

## D5 — Frontend: Angular (without Material)

**Decision:** **Angular 19** (standalone), **without Angular Material**.

**Alternatives discussed:** React + Vite, Svelte, Vue. They had been proposed to lighten things up compared to Angular; the user, however, chose to **stay on Angular**, while giving up Material's "default" look.

**Why:** familiarity and consistency; the important thing was to avoid Material's standardised appearance.

---

## D6 — UI style: pure Tailwind CSS

**Decision:** **pure Tailwind CSS** (no component library).

**Alternatives discussed:** Tailwind + DaisyUI (ready-made components), Tailwind + spartan/ui (shadcn style).

**Why:** maximum freedom and control over the appearance; components are built by hand. More initial work, but no aesthetic constraints.

---

## D7 — How to serve the app: Nginx + Spring

**Decision:** **Nginx serves the PWA + reverse proxy towards the Spring APIs.**

**Discarded alternative:** Spring Boot serves everything (static frontend + API in a single artifact). Simpler to distribute, but it couples frontend and backend, and Java is not optimal as a static file server.

**Why:** Nginx is efficient with static files (ideal for a PWA), the three services remain independent and can be updated separately. Day-to-day use remains `docker compose up` anyway.

---

## D8 — Web app vs native app: PWA

**Decision:** **PWA** (Progressive Web App).

**Why:** it's "the web app you install" — a single codebase for phone and desktop, works offline, installs without going through the stores. If one day a real store app is needed, the same PWA is packaged with **Capacitor** without redoing anything.

---

## D9 — Everything in Docker

**Decision:** frontend, backend and database **all in containers**, orchestrated by Docker Compose.

**Why:** it eliminates the "environment setup" problem (an explicit concern of the user). Reproducible, isolated, a single command. `psql` is not installed on the machine, but Docker is → Postgres runs in a container with no local installations.

---

## D10 — Project name

**Decision:** working name **`home-manager`**.

**Why:** clear and descriptive. Many names were explored (ShelfLife, PantryPal, Homebase, Domus, Vesta, Hestia, Butler, Steward…) without convincing; the choice was to **start right away** with a working name, since renaming is a trivial operation. The name may change later.

---

## D11 — Deployment: self-hosting from home + Cloudflare

**Decision (plan, to be carried out at the end):** hosting on a **home desktop PC** with a **static IP**, protected by **Cloudflare** (ideally **Cloudflare Tunnel**).

**Why:** the user already has a static IP and an always-on PC. Cloudflare adds anti-bot/DDoS/WAF (free plan), SSL, and **hides the home IP**. With Cloudflare Tunnel, port-forwarding and IP exposure are avoided altogether. Operational details in [05-deployment.md](05-deployment.md).

**Not to forget when going online:** HTTPS mandatory (required by the PWA), **login/users**, **automatic database backups**, expose **only** the proxy port.

---

## D12 — Authentication: session cookies (not JWT)

**Decision:** **session-based authentication** with Spring Security — an HttpOnly session cookie, BCrypt-hashed passwords, and cookie-based **CSRF** protection (Angular's built-in XSRF support echoes the token).

**Alternative discussed:** stateless **JWT**.

**Why:** the frontend and backend are same-origin (Nginx serves the app and proxies `/api`), so a session cookie is simpler and safer than JWT — no token storage in the SPA, no refresh logic, no XSS-exposed tokens. JWT would add complexity that only pays off for cross-domain APIs or native clients, which we don't have.

---

## D13 — Households: one family per user, invite-based, multiple households

**Decision:** every user belongs to **one family**; all Shopping & Pantry data is **scoped to that family**. Registration either **creates a new household** (the user becomes its admin) or **joins an existing one** with its **invite code**.

**Path:** we first considered a single, closed household bootstrapped by the very first account. It was then opened up so that **multiple separate households** can coexist (anyone can create one), which is the natural multi-tenant shape.

**Consequence:** registration is effectively open. Restricting who can register is a decision deferred to just before public deployment (see [05-deployment.md](05-deployment.md)).

---

## D14 — Roles: ADMIN / MEMBER

**Decision:** two roles. **ADMIN** manages the family (invite code, promote/demote members, remove members); **MEMBER** uses the shared data. A family must always keep **at least one admin**, and a user cannot remove themselves.

**Why:** a small, understandable permission model that fits a household. Finer-grained permissions can come later if a real need appears.
