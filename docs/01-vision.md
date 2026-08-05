# 01 — Vision

## In one sentence

**home-manager is a household management app**: a single application, shared within the family, that gathers in one place everything you need to manage domestic life — starting from shopping and the pantry.

## Where it comes from

The idea was born out of a reasoning process (recorded in [03-decisions.md](03-decisions.md)). The firm points that emerged:

- 🎯 **Solve a problem of your own.** Not an app "for the market", but something that is *genuinely* useful to whoever builds it and to their family. This guarantees a real user from day 1 and immediate feedback.
- 👨‍👩‍👧 **Family and shared use.** Multiple people, multiple devices, data shared in real time. Hence the choice of a real backend + central database (not a local single-user app).
- 📱 **Convenience from the phone.** It's used in the kitchen, in front of the fridge, at the supermarket. It has to work well on the phone → **installable PWA**.
- 🧩 **It must be able to grow.** Not a throwaway toy, but a "substantial" project that expands **one module at a time** without having to be rewritten.

## The two original needs

The user identified two recurring frustrations, which in the "home" domain translate as follows:

1. **"I lose / can't find information"** → where are the deadlines? what's in the pantry? what's missing? → a single, tidy place.
2. **"I have no visibility over my data"** → how much do I spend? what's about to expire? → clear, aggregated views.

## Guiding principle: growth by modules

The project **is not** "a shopping app". It's a container that hosts modules. The first is Shopping & Pantry; the others arrive over time.

```
🏠 home-manager
├── 🛒 Shopping & Pantry       ← MODULE 1 (under construction)
├── 📅 Deadlines & Bills    ← future
├── 🧹 Household chores     ← future
├── 💰 Household budget          ← future
└── 📄 Documents & Maintenance← future
```

See the detailed roadmap in [04-modules.md](04-modules.md).

## Non-goals (for now)

- ❌ It is not a multi-tenant SaaS product for the market: it's for your own home (we'll see later).
- ❌ No app store at the start: we begin as a PWA. The store remains a future possibility (Capacitor).
- ❌ No advanced features right off the bat: first a solid Module 1 that is actually used.
