# 04 — Moduli & Roadmap

Il progetto cresce **un modulo alla volta**. Ogni modulo è una funzionalità coerente e rilasciabile, con la sua cartella sia nel backend che nel frontend.

---

## ✅ Modulo 1 — Spesa & Dispensa (in costruzione)

L'MVP: la prima versione usabile, da mettere subito in mano alla famiglia.

### Funzioni

1. **🛒 Lista della spesa condivisa**
   - Aggiungere una voce (nome, quantità)
   - Spuntare come "presa" / rimuovere
   - Vista condivisa: tutti vedono la stessa lista

2. **📦 Dispensa (inventario)**
   - Elenco dei prodotti in casa con quantità e categoria
   - Aggiungere / modificare / rimuovere prodotti

3. **⏰ Scadenze**
   - Data di scadenza sui prodotti
   - Evidenziazione "scade tra X giorni" per ridurre gli sprechi

### Modello dati (prima versione)

**Prodotto** (dispensa)
| Campo | Tipo | Note |
|---|---|---|
| id | Long | chiave |
| nome | String | es. "Latte" |
| quantita | BigDecimal | es. 2 |
| unita | String | es. "L", "pz", "kg" |
| categoria | enum | es. FRESCO, DISPENSA, SURGELATO, ALTRO |
| dataScadenza | LocalDate | opzionale; base per gli avvisi |
| createdAt | Instant | automatico |

**VoceSpesa** (lista della spesa)
| Campo | Tipo | Note |
|---|---|---|
| id | Long | chiave |
| nome | String | es. "Pane" |
| quantita | BigDecimal | opzionale |
| presa | boolean | spuntata o no |
| aggiuntoDa | String | chi l'ha aggiunta (provvisorio, in attesa del modulo utenti) |
| createdAt | Instant | automatico |

### Endpoint REST previsti

```
GET    /api/prodotti           elenco dispensa
POST   /api/prodotti           aggiungi prodotto
PUT    /api/prodotti/{id}      modifica prodotto
DELETE /api/prodotti/{id}      rimuovi prodotto

GET    /api/spesa              elenco lista spesa
POST   /api/spesa              aggiungi voce
PUT    /api/spesa/{id}         modifica voce (es. spunta "presa")
DELETE /api/spesa/{id}         rimuovi voce
```

### Idee "dopo" (stesso modulo)
- Suggerimento: quando un prodotto della dispensa finisce → aggiunta rapida alla lista spesa
- Scanner del codice a barre per aggiungere velocemente
- Ricette suggerite con ciò che sta per scadere

---

## 🔜 Moduli futuri (roadmap)

Idee, non impegni. L'ordine si deciderà in base all'utilità reale.

| Modulo | Cosa fa |
|---|---|
| 📅 **Scadenze & Bollette** | Promemoria per bollo auto, assicurazioni, bollette, revisioni… |
| 🧹 **Faccende domestiche** | Chi fa cosa, turni, ricorrenze |
| 💰 **Budget di casa** | Spese familiari, andamento, categorie |
| 📄 **Documenti & Manutenzioni** | Archivio documenti di casa, scadenze manutenzioni |
| 🔑 **Utenti & Famiglia** | Login, profili familiari, permessi (abilita l'uso "vero" condiviso e la messa online sicura) |

> Nota: il modulo **Utenti & Famiglia** è trasversale e diventa necessario prima della messa online pubblica (per proteggere l'accesso). Vedi [05-deployment.md](05-deployment.md).
