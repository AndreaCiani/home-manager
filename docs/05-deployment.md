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
- 🔒 **Set `COOKIE_SECURE=true`** on the backend once you're on HTTPS, so the session cookie is never sent over plain HTTP. (It defaults to `false` for local http development.)
- ⚠️ **Registration is currently open** — anyone who reaches the app can create a household. Before exposing it publicly, decide whether to restrict sign-up (e.g. invite-only, an allow-list, or an extra network gate in front of Cloudflare).
- Change the default database password (`.env`) and keep the containers up to date.

> **Schema changes:** the database schema is managed by **Flyway migrations**
> (`backend/src/main/resources/db/migration`), and JPA only *validates* against
> it — it never alters it on its own. To change the schema, add a new
> `V2__…​.sql` (etc.) migration rather than relying on Hibernate auto-DDL.

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

---

## 🚀 Go-live runbook (Cloudflare Tunnel)

The repo ships a production compose file (`docker-compose.prod.yml`) and a
Cloudflare Tunnel service, so going online is mostly configuration.

On the home PC (with Docker):

1. **Configure `.env`** (copy from `.env.example`): set a **strong**
   `POSTGRES_PASSWORD`; leave `TUNNEL_TOKEN` empty for now.

2. **Create a Cloudflare Tunnel** — Cloudflare **Zero Trust → Networks →
   Tunnels → Create a tunnel** (Cloudflared connector). Copy the **token** it
   shows and set it in `.env` as `TUNNEL_TOKEN=...`.

3. **Add a Public Hostname** to the tunnel: your domain (e.g.
   `home.example.com`) → Service **`http://frontend:80`**. Cloudflare provides
   the HTTPS certificate.

4. **Start the stack:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
   No host ports are opened — the app is reachable only through the tunnel. The
   prod compose already sets `COOKIE_SECURE=true` and `REGISTRATION_OPEN=false`.

5. **Create your admin account:** open `https://home.example.com/register`. The
   **first** account creates your household and makes you the admin (bootstrap is
   allowed even with registration closed). After that, new households can't be
   created publicly — invite family members with the code from the Family page.

6. **Set up backups** (database + uploaded files):
   ```bash
   ./scripts/backup.sh docker-compose.prod.yml
   ```
   Schedule it with cron (see the script header) and keep copies off-machine.

**Updating later:** `git pull`, then re-run the `up -d --build` command — Flyway
applies any new migrations and the containers restart.
