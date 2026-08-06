# 05 — Deployment (going online from home)

> ⚠️ **This is the last step.** First everything is developed and tested locally (`localhost`). This document is the plan to carry out when the app is ready.

## Chosen scenario: self-hosting from home

The user has available:
- 🖥️ an always-on **desktop PC** (it runs `docker compose up`)
- 🌐 a public **static IP**

Basic plan (it works, but see the Cloudflare improvement below):

```
Internet ──▶ static IP ──▶ modem (port forwarding) ──▶ 💻 home PC (docker compose)
```

## ✅ The 3 indispensable precautions

### 1. 🔒 HTTPS mandatory
A **PWA installs and works only over HTTPS** (except locally). So you need:
- a **domain** (~€10/year) pointed at your own IP/service
- a **TLS certificate** (Let's Encrypt, free and auto-renewable)

Tools that make this much easier: **Caddy** (automatic HTTPS) or directly **Cloudflare** (see below).

### 2. 🛡️ Security
- Expose **only** the proxy port (443). **Never** expose PostgreSQL or the Spring Boot port directly.
- ✅ **Login is in place** (Users & Family module): session cookies, BCrypt, CSRF, and per-family data isolation.
- ⚠️ **Registration is currently open** — anyone who reaches the app can create a household. Before exposing it publicly, decide whether to restrict sign-up (e.g. invite-only, an allow-list, or an extra network gate in front of Cloudflare).
- Change the default database password (`.env`) and keep the containers up to date.

### 3. 📡 ISP check
Check that the provider doesn't block ports **80/443 inbound** (some do, even with a static IP). With Cloudflare Tunnel (below) the problem is bypassed entirely.

## ☁️ Recommended improvement: Cloudflare

Putting **Cloudflare** in front of the site is warmly recommended for home self-hosting:

- 🕵️ **Hides the home IP** — traffic passes through Cloudflare
- 🛡️ **Anti-bot / DDoS / WAF** — protection already in the **free** plan (Bot Fight Mode)
- 🔒 **SSL at the edge** — HTTPS handled by Cloudflare
- ⚡ **Cache + rate limiting**

### 🚀 Even better: Cloudflare Tunnel

With **Cloudflare Tunnel** (`cloudflared`) the home PC connects **outbound** to Cloudflare:

```
Internet ──▶ ☁️ Cloudflare (anti-bot, SSL, hides IP) ──tunnel──▶ 💻 home PC (docker compose)
```

Advantages:
- ❌ **no port-forwarding** on the modem
- ❌ **no exposed IP**
- ✅ no inbound port open on the home network

It only requires a **domain managed on Cloudflare** (free plan). Today it is the safest practice for hosting from home.

## 💾 Not to forget

- **Automatic database backups** — this is the family's data. Schedule a periodic PostgreSQL dump (e.g. a scheduled `pg_dump`) saved in a safe place.
- **Uploaded files backup** — the Documents module stores real files on the `docdata` Docker volume. Back it up too (the database only holds their metadata).
- **Secrets management** — the DB password and the like in `.env` (never in the repository).
- **Monitoring/uptime** — optional, a simple check that alerts you if the app goes down.

## 🔮 Beyond the PWA (optional, future)

If one day a **real app** on Google Play / App Store were needed, the same PWA can be packaged with **Capacitor**, without rewriting the frontend.
