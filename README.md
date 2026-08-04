# 🏠 home-manager

Un **gestionale per la casa**: un'unica app, condivisa in famiglia, per tenere sotto controllo tutto ciò che riguarda la gestione domestica.

Nasce per risolvere un problema concreto e quotidiano (spesa, dispensa, scadenze) ed è pensato per **crescere a moduli** nel tempo.

> ⚠️ Nome di lavoro: `home-manager`. È facile da rinominare più avanti (cartella + qualche riferimento in configurazione).

---

## 🎯 Cosa fa (primo modulo)

**Modulo 1 — Spesa & Dispensa** (l'MVP, quello che usiamo subito con la famiglia):

- 🛒 **Lista della spesa condivisa** — tutti in famiglia aggiungono/spuntano voci in tempo reale
- 📦 **Dispensa** — cosa c'è in casa, con quantità
- ⏰ **Scadenze** — avvisi quando un prodotto sta per scadere → meno sprechi

I moduli successivi (bollette, faccende, budget, documenti…) sono nella [roadmap](docs/04-modules.md).

---

## 🧱 Stack tecnologico

| Livello | Tecnologia |
|---|---|
| Frontend | **Angular 19** (standalone) + **Tailwind CSS** (puro), come **PWA** installabile |
| Backend | **Java 21** + **Spring Boot** (API REST) |
| Database | **PostgreSQL** |
| Serving | **Nginx** serve la PWA e fa da proxy verso le API |
| Orchestrazione | **Docker Compose** (tutto in container) |

Dettagli e motivazioni in [docs/02-architecture.md](docs/02-architecture.md) e [docs/03-decisions.md](docs/03-decisions.md).

---

## 🚀 Avvio rapido (in locale)

> Requisiti: **Docker** installato. Non serve installare Java, Node o Postgres a mano.

```bash
docker compose up
```

Poi apri il browser su:

- App (frontend): http://localhost:4200
- API (backend): http://localhost:8080/api

Per lo sviluppo con ricarica automatica del frontend, vedi [docs/02-architecture.md](docs/02-architecture.md#modalità-sviluppo-vs-rilascio).

---

## 📁 Struttura del progetto

```
home-manager/
├── docker-compose.yml      🐳 orchestra i 3 servizi
├── .env.example            🔧 variabili d'ambiente (copia in .env)
├── docs/                   📖 documentazione e decisioni di progetto
├── backend/                ☕ Spring Boot (API REST)
└── frontend/               🅰️ Angular + Tailwind (PWA)
```

---

## 📖 Documentazione

- [01 — Visione](docs/01-vision.md) — cos'è e perché
- [02 — Architettura](docs/02-architecture.md) — come è fatto tecnicamente
- [03 — Decisioni](docs/03-decisions.md) — tutte le scelte fatte e il perché
- [04 — Moduli & Roadmap](docs/04-modules.md) — cosa c'è ora e cosa verrà
- [05 — Deploy](docs/05-deployment.md) — come portarlo online da casa (Docker, Cloudflare, sicurezza)

---

## 🗺️ Stato del progetto

🚧 **Fase attuale:** scheletro + documentazione. Prossimo passo: generare il backend e il frontend e realizzare il Modulo 1.
