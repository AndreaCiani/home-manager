# 02 — Architettura

## Panoramica

Tre servizi, tutti containerizzati e orchestrati da **Docker Compose**. Un solo comando (`docker compose up`) avvia l'intero sistema — nessun ambiente da configurare a mano.

```
                 ┌───────────────────── docker compose ─────────────────────┐
                 │                                                           │
  browser  ─────▶│  🌐 nginx ──┬──▶ file Angular (PWA, HTML/JS/CSS)          │
  (telefono/pc)  │             │                                            │
                 │             └──▶ /api/* ──▶ ☕ Spring Boot ──▶ 🐘 Postgres │
                 │                :80            :8080              :5432     │
                 └───────────────────────────────────────────────────────────┘
```

## I tre servizi

### 🅰️ Frontend — Angular 19 + Tailwind CSS (PWA)

- **Angular 19** con componenti *standalone* (approccio moderno, senza NgModule).
- **Tailwind CSS puro** per lo stile: nessun Angular Material, nessuna libreria di componenti. Massima libertà sull'aspetto. I componenti (card, form, liste) li costruiamo noi.
- **PWA**: l'app è installabile ("Aggiungi a schermata Home") e funziona offline grazie al service worker. Un solo codice serve sia telefono che desktop.
- In rilascio è servito da **Nginx** (vedi sotto).

### ☕ Backend — Java 21 + Spring Boot

- Espone una **API REST** sotto `/api` (es. `/api/prodotti`, `/api/spesa`).
- **Spring Data JPA** per l'accesso al database (repository generati automaticamente).
- **Bean Validation** per validare i dati in ingresso.
- Configurazione via variabili d'ambiente (vedi `.env.example`).

### 🐘 Database — PostgreSQL 16

- Database relazionale centrale, condiviso tra tutti gli utenti/famigliari.
- I dati persistono in un volume Docker (`pgdata`).
- ⚠️ In produzione **non** va esposto verso l'esterno: solo il backend lo raggiunge, sulla rete interna di Docker.

## Come vengono serviti i file (serving)

Scelta: **Nginx serve il frontend + Spring serve solo le API.**

- Nginx è nato per servire file statici (velocissimo, ottima gestione di cache e service worker della PWA).
- Nginx fa anche da **reverse proxy**: le richieste `/api/*` le inoltra a Spring Boot; tutto il resto è l'app Angular (con *fallback* SPA sulle rotte lato client).

Alternativa considerata e scartata: far servire tutto a Spring Boot (un unico artefatto). Più semplice da distribuire, ma accoppia frontend e backend e Java non è l'ideale come server di file statici. Dettagli in [03-decisions.md](03-decisions.md).

## Modalità sviluppo vs rilascio

| | Sviluppo | Rilascio |
|---|---|---|
| Frontend | `ng serve` (dev-server Angular, **ricarica automatica** su :4200) | build statico servito da **Nginx** |
| Backend | Spring Boot in esecuzione (hot reload con devtools) | jar dentro immagine Docker |
| Come si chiamano le API | il dev-server fa da proxy verso :8080 (o CORS abilitato) | Nginx inoltra `/api` al backend |

In sviluppo si può lavorare comodamente con la ricarica automatica; Docker Compose serve soprattutto per la versione "buona" e per avere il database pronto senza installarlo.

## Flusso di una richiesta (esempio)

1. L'utente apre la lista della spesa → Angular chiama `GET /api/spesa`.
2. Nginx riceve la richiesta e, vedendo `/api`, la inoltra a Spring Boot.
3. Spring Boot interroga Postgres tramite il repository JPA.
4. Torna un JSON con le voci → Angular le mostra nella lista.

## Struttura del codice

```
backend/src/main/java/com/homemanager/
├── HomeManagerApplication.java      punto d'avvio
├── config/                          configurazioni (CORS, ecc.)
└── pantry/                          MODULO 1: Spesa & Dispensa
    ├── model/                       entità (Prodotto, VoceSpesa)
    ├── repository/                  accesso dati (JPA)
    ├── controller/                  endpoint REST
    └── dto/                         oggetti di trasferimento (input/output)

frontend/src/                        (generato con "ng new", vedi frontend/README.md)
└── app/
    ├── pages/                       schermate: dispensa, lista spesa
    ├── components/                  pezzi riusabili (card prodotto, riga lista)
    └── services/                    chiamate HTTP al backend
```

Ogni modulo futuro seguirà lo stesso schema (una cartella per modulo, sia lato backend che frontend), per mantenere il progetto ordinato mentre cresce.
