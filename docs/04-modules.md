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
- ✅ Suggestion: when a pantry product runs out → quick add to the shopping list
- ✅ Barcode scanner to add items quickly
- Recipe suggestions using what is about to expire

---

## ✅ Module 2 — Users & Family

Accounts and households, so data is shared within a family and protected from everyone else. This module is what makes it safe to put the app online.

### Features

1. **Authentication** — register, log in, log out; session cookies (HttpOnly) with BCrypt-hashed passwords and CSRF protection.
2. **Households (families)** — every user belongs to one family; the shopping list and pantry are private to that family.
3. **Invite-based registration** — creating an account either starts a **new household** (you become its admin) or **joins an existing one** with its invite code.
4. **Roles & management** — `ADMIN` / `MEMBER`; admins see and regenerate the invite code, promote/demote members, and remove members (a family always keeps at least one admin).
5. **Account** — change your own password.

### Data model

**Family** — id, name, inviteCode (unique), createdAt.
**User** (table `app_user`) — id, email (unique), displayName, passwordHash (BCrypt), role (ADMIN/MEMBER), family, createdAt.

`Product` and `ShoppingItem` gain a `family` and are always filtered by the caller's family; a shopping item also records who added it.

### Endpoints

```
POST   /api/auth/register           create a household, or join one with an invite code
POST   /api/auth/login              sign in
POST   /api/auth/logout             sign out
GET    /api/auth/me                 current user
POST   /api/auth/change-password    change own password

GET    /api/family                          family + members (invite code for admins)
POST   /api/family/invite-code/regenerate   rotate the invite code (admin)
PUT    /api/family/members/{id}/role        promote/demote a member (admin)
DELETE /api/family/members/{id}             remove a member (admin)
```

> Note: registration is open — anyone can create a household or join one with a code. Before exposing the app publicly, decide whether to restrict who can register (see [05-deployment.md](05-deployment.md)).

---

## ✅ Module 3 — Deadlines & Bills

Reminders for recurring and one-off obligations — car tax, insurance, utility
bills, inspections — so nothing slips. Overdue and soon-due items are surfaced
on the dashboard and highlighted in the list.

### Features

1. **Deadlines/bills** with a title, optional amount, due date, category
   (bill, tax, insurance, subscription, inspection, other) and notes.
2. **Due-soon & overdue highlighting** — colour-coded by urgency, with an
   "⏰ Due soon" section and a dashboard stat/preview.
3. **Recurrence** — one-off, monthly or yearly. Marking a recurring deadline as
   paid **rolls it forward** to the next occurrence; a one-off is simply marked paid.

### Data model

**Deadline** — id, title, amount (optional), dueDate, category, recurrence
(NONE/MONTHLY/YEARLY), paid, notes, family (scoped per household), createdAt.

### Endpoints

```
GET    /api/deadlines              all deadlines (soonest first)
GET    /api/deadlines/upcoming     unpaid, due within N days (incl. overdue)
POST   /api/deadlines              add
PUT    /api/deadlines/{id}         edit
DELETE /api/deadlines/{id}         remove
POST   /api/deadlines/{id}/pay     mark paid (recurring → next occurrence)
```

---

## ✅ Module 4 — Household Chores

Who does what at home: chores optionally assigned to a family member, with an
optional due date and recurrence. Marking a recurring chore done **rolls it
forward** to its next occurrence; a one-off is simply completed.

### Data model

**Chore** — id, title, assignee (member id + name, denormalized so member
removal stays simple), dueDate (optional), recurrence (NONE/DAILY/WEEKLY/MONTHLY),
done, family (scoped per household), createdAt.

### Endpoints

```
GET    /api/chores            all chores (open first)
POST   /api/chores            add
PUT    /api/chores/{id}       edit
DELETE /api/chores/{id}       remove
POST   /api/chores/{id}/done  mark done (recurring → next occurrence)
```

---

## ✅ Module 5 — Household Budget

Track household expenses and see where the money goes: this month's total
with a per-category breakdown.

### Data model

**Expense** — id, description, amount, category (groceries, utilities, rent,
transport, health, leisure, other), date, paidBy (denormalized member id +
name), family (scoped per household), createdAt.

### Endpoints

```
GET    /api/expenses            all expenses (most recent first)
GET    /api/expenses/summary    monthly total + per-category breakdown (?month=yyyy-MM)
POST   /api/expenses            add
PUT    /api/expenses/{id}       edit
DELETE /api/expenses/{id}       remove
```

---

## 🔜 Future modules (roadmap)

Ideas, not commitments. The order will be decided based on real usefulness.

| Module | What it does |
|---|---|
| 📄 **Documents & Maintenance** | Archive of household documents, maintenance deadlines |

> Note: **Users & Family** is already in place — it's the cross-cutting module that protects access before going online. See [05-deployment.md](05-deployment.md).
