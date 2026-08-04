# 03 — Registro delle decisioni

Questo documento registra **tutte le scelte** fatte durante la fase di ideazione, con le alternative considerate e il perché della decisione. Serve a ricordare *perché* le cose sono come sono (ed eventualmente a rimetterle in discussione con cognizione).

---

## D1 — Che tipo di progetto

**Decisione:** un gestionale per la casa, a uso familiare, che parte dal modulo Spesa & Dispensa.

**Percorso:** l'obiettivo di partenza era "risolvere un mio problema". Sono state esplorate e scartate idee più orientate allo sviluppatore (un "cockpit personale" che aggrega dati e note): non accendevano interesse perché **non erano un problema realmente vissuto**. L'idea del gestionale di casa è invece emersa in modo spontaneo → segnale di un bisogno autentico.

---

## D2 — Local-first mono-utente vs app condivisa

**Decisione:** app **condivisa** con backend + database centrale.

**Perché:** l'uso è familiare (più persone, più dispositivi, dati in tempo reale). Un'app locale mono-utente (inizialmente ipotizzata quando l'utente era "solo io") non regge questo scenario. Questa scelta **giustifica** l'adozione di PostgreSQL e di un backend vero.

---

## D3 — Database: PostgreSQL

**Decisione:** **PostgreSQL**.

**Alternative:** SQLite (valida solo nello scenario mono-utente locale, poi decaduto).

**Perché:** affidabile, standard di settore, gestisce bene più utenti che scrivono contemporaneamente. Scelta corretta per un'app condivisa, non solo "sicura".

---

## D4 — Backend: Java 21 + Spring Boot

**Decisione:** **Java 21 + Spring Boot** (con Maven).

**Perché:** l'utente ci lavora bene; stack robusto, professionale e molto richiesto (valore anche per il CV). 

**Consapevolezza del contro:** è lo stack più verboso (parecchio boilerplate). Accettato in cambio di solidità e familiarità.

---

## D5 — Frontend: Angular (senza Material)

**Decisione:** **Angular 19** (standalone), **senza Angular Material**.

**Alternative discusse:** React + Vite, Svelte, Vue. Erano state proposte per alleggerire rispetto ad Angular; l'utente ha però scelto di **restare su Angular**, rinunciando però al look "di default" di Material.

**Perché:** familiarità e coerenza; l'importante era evitare l'aspetto standardizzato di Material.

---

## D6 — Stile UI: Tailwind CSS puro

**Decisione:** **Tailwind CSS puro** (nessuna libreria di componenti).

**Alternative discusse:** Tailwind + DaisyUI (componenti pronti), Tailwind + spartan/ui (stile shadcn).

**Perché:** massima libertà e controllo sull'aspetto; i componenti si costruiscono a mano. Più lavoro iniziale, ma nessun vincolo estetico.

---

## D7 — Come servire l'app: Nginx + Spring

**Decisione:** **Nginx serve la PWA + reverse proxy verso le API Spring.**

**Alternativa scartata:** Spring Boot serve tutto (frontend statico + API in un unico artefatto). Più semplice da distribuire, ma accoppia frontend e backend e Java non è ottimale come server di file statici.

**Perché:** Nginx è efficiente sui file statici (ideale per una PWA), i tre servizi restano indipendenti e aggiornabili separatamente. L'uso quotidiano resta comunque `docker compose up`.

---

## D8 — Web app vs app nativa: PWA

**Decisione:** **PWA** (Progressive Web App).

**Perché:** è "la web app che ti installi" — un solo codice per telefono e desktop, funziona offline, si installa senza passare dagli store. Se un domani servirà la vera app da store, si impacchetta la stessa PWA con **Capacitor** senza rifare nulla.

---

## D9 — Tutto in Docker

**Decisione:** frontend, backend e database **tutti in container**, orchestrati da Docker Compose.

**Perché:** elimina il problema del "setup degli ambienti" (timore esplicito dell'utente). Riproducibile, isolato, un solo comando. `psql` non è installato sulla macchina, ma Docker sì → Postgres gira in container senza installazioni locali.

---

## D10 — Nome del progetto

**Decisione:** nome di lavoro **`home-manager`**.

**Perché:** chiaro e descrittivo. Sono stati esplorati molti nomi (ShelfLife, PantryPal, Homebase, Domus, Vesta, Hestia, Butler, Steward…) senza convincere; si è scelto di **partire subito** con un nome di lavoro, essendo la rinomina un'operazione banale. Il nome può cambiare in seguito.

---

## D11 — Deploy: auto-hosting da casa + Cloudflare

**Decisione (piano, da attuare alla fine):** hosting su **PC fisso di casa** con **IP statico**, protetto da **Cloudflare** (idealmente **Cloudflare Tunnel**).

**Perché:** l'utente ha già IP statico e un PC sempre acceso. Cloudflare aggiunge anti-bot/DDoS/WAF (piano gratuito), SSL, e **nasconde l'IP di casa**. Con Cloudflare Tunnel si evita del tutto il port-forwarding e l'esposizione dell'IP. Dettagli operativi in [05-deployment.md](05-deployment.md).

**Da non dimenticare per la messa online:** HTTPS obbligatorio (richiesto dalla PWA), **login/utenti**, **backup automatici del database**, esporre **solo** la porta del proxy.
