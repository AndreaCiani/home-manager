# 04 — Modules & Roadmap

The project grows **one module at a time**. Each module is a coherent, releasable feature, with its own folder on both the backend and the frontend.

---

## ✅ Module 1 — Shopping & Pantry (under construction)

The MVP: the first usable version, to put in the family's hands right away.

### Features

1. **🛒 Shared shopping list**
   - Add an item (name, quantity)
   - Mark as "purchased" / remove
   - Shared view: everyone sees the same list

2. **📦 Pantry (inventory)**
   - List of products at home with quantity and category
   - Add / edit / remove products

3. **⏰ Expiry**
   - Expiry date on products
   - "Expires in X days" highlighting to reduce waste

### Data model (first version)

**Product** (pantry)
| Field | Type | Notes |
|---|---|---|
| id | Long | key |
| name | String | e.g. "Milk" |
| quantity | BigDecimal | e.g. 2 |
| unit | String | e.g. "L", "pcs", "kg" |
| category | enum | e.g. FRESH, PANTRY, FROZEN, OTHER |
| expiryDate | LocalDate | optional; the basis for alerts |
| createdAt | Instant | automatic |

**ShoppingItem** (shopping list)
| Field | Type | Notes |
|---|---|---|
| id | Long | key |
| name | String | e.g. "Bread" |
| quantity | BigDecimal | optional |
| purchased | boolean | ticked or not |
| addedBy | String | who added it (temporary, pending the users module) |
| createdAt | Instant | automatic |

### Planned REST endpoints

```
GET    /api/products              pantry list
POST   /api/products              add product
PUT    /api/products/{id}         edit product
DELETE /api/products/{id}         remove product

GET    /api/shopping-items        shopping list
POST   /api/shopping-items        add item
PUT    /api/shopping-items/{id}   edit item (e.g. mark as "purchased")
DELETE /api/shopping-items/{id}   remove item
```

### "Later" ideas (same module)
- Suggestion: when a pantry product runs out → quick add to the shopping list
- Barcode scanner to add items quickly
- Recipe suggestions using what is about to expire

---

## 🔜 Future modules (roadmap)

Ideas, not commitments. The order will be decided based on real usefulness.

| Module | What it does |
|---|---|
| 📅 **Deadlines & Bills** | Reminders for car tax, insurance, bills, inspections… |
| 🧹 **Household chores** | Who does what, rotations, recurrences |
| 💰 **Household budget** | Family expenses, trends, categories |
| 📄 **Documents & Maintenance** | Archive of household documents, maintenance deadlines |
| 🔑 **Users & Family** | Login, family profiles, permissions (enables real shared use and safe going-online) |

> Note: the **Users & Family** module is cross-cutting and becomes necessary before public going-online (to protect access). See [05-deployment.md](05-deployment.md).
