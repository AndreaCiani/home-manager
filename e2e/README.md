# 🎭 End-to-end tests (Playwright)

Browser tests that drive the **running app** through real user flows: auth
(guard, register, login, logout), shopping list, pantry (with expiry), and
families (invite, shared data, member management). They complement the
backend integration tests (`backend/src/test`).

## Prerequisites

The full stack must be running and reachable at `http://localhost:4200`:

```bash
docker compose up -d
```

(Override the target with `E2E_BASE_URL` if needed.)

## Run

From this folder:

```bash
npm install            # first time only
npx playwright install chromium   # first time only — downloads the browser
npm test               # runs the suite (headless)
npm run report         # open the HTML report of the last run
```

## Notes

- Tests create data through the API and use **unique emails**, so they are
  independent and don't need a reset between runs. They do leave rows behind;
  point them at a disposable database, or truncate the tables when you want a
  clean slate.
- `workers: 1` keeps the shared backend state predictable; the service worker
  is blocked in tests to avoid cache flakiness.
