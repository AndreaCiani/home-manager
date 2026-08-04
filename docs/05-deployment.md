# 05 — Deploy (messa online da casa)

> ⚠️ **Questo è l'ultimo step.** Prima si sviluppa e si prova tutto in locale (`localhost`). Questo documento è il piano da attuare quando l'app è pronta.

## Scenario scelto: auto-hosting da casa

L'utente ha a disposizione:
- 🖥️ un **PC fisso** sempre acceso (ci gira `docker compose up`)
- 🌐 un **IP statico** pubblico

Piano di base (funziona, ma vedi sotto il miglioramento con Cloudflare):

```
Internet ──▶ IP statico ──▶ modem (port forwarding) ──▶ 💻 PC di casa (docker compose)
```

## ✅ Le 3 accortezze indispensabili

### 1. 🔒 HTTPS obbligatorio
Una **PWA si installa e funziona solo in HTTPS** (eccetto in locale). Serve quindi:
- un **dominio** (~10 €/anno) puntato al proprio IP/servizio
- un **certificato TLS** (Let's Encrypt, gratuito e auto-rinnovabile)

Strumenti che semplificano molto: **Caddy** (HTTPS automatico) oppure direttamente **Cloudflare** (vedi sotto).

### 2. 🛡️ Sicurezza
- Esporre **solo** la porta del proxy (443). **Mai** esporre direttamente PostgreSQL o la porta di Spring Boot.
- Aggiungere un **login** sull'app (modulo Utenti & Famiglia) prima di aprirla a Internet.
- Tenere aggiornati i container.

### 3. 📡 Verifica ISP
Controllare che il provider non blocchi le porte **80/443 in entrata** (alcuni lo fanno anche con IP statico). Con Cloudflare Tunnel (sotto) il problema si aggira del tutto.

## ☁️ Miglioramento consigliato: Cloudflare

Mettere **Cloudflare** davanti al sito è caldamente consigliato per l'auto-hosting domestico:

- 🕵️ **Nasconde l'IP di casa** — il traffico passa da Cloudflare
- 🛡️ **Anti-bot / DDoS / WAF** — protezione già nel piano **gratuito** (Bot Fight Mode)
- 🔒 **SSL al bordo** — HTTPS gestito da Cloudflare
- ⚡ **Cache + rate limiting**

### 🚀 Ancora meglio: Cloudflare Tunnel

Con **Cloudflare Tunnel** (`cloudflared`) il PC di casa si collega **in uscita** a Cloudflare:

```
Internet ──▶ ☁️ Cloudflare (anti-bot, SSL, nasconde IP) ──tunnel──▶ 💻 PC di casa (docker compose)
```

Vantaggi:
- ❌ **niente port-forwarding** sul modem
- ❌ **niente IP esposto**
- ✅ nessuna porta in ingresso aperta sulla rete di casa

Richiede solo un **dominio gestito su Cloudflare** (piano gratuito). È oggi la prassi più sicura per ospitare in casa.

## 💾 Da non dimenticare

- **Backup automatici del database** — sono i dati della famiglia. Pianificare un dump periodico di PostgreSQL (es. `pg_dump` schedulato) salvato in un posto sicuro.
- **Gestione dei segreti** — password del DB e simili in `.env` (mai nel repository).
- **Monitoraggio/uptime** — opzionale, un semplice check che avvisa se l'app va giù.

## 🔮 Oltre la PWA (facoltativo, futuro)

Se un domani servisse la **vera app** su Google Play / App Store, si può impacchettare la stessa PWA con **Capacitor**, senza riscrivere il frontend.
