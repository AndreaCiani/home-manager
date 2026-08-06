#!/usr/bin/env bash
#
# Development mode with hot reload:
#   - PostgreSQL + backend run in Docker (the backend rebuilds if needed),
#   - the Angular dev server runs on the host with live reload, proxying
#     /api to the backend on :8080.
#
# Usage:  ./scripts/dev.sh
# Stop:   Ctrl+C stops the Angular dev server; the db+backend keep running.
#         Run  docker compose stop  (or  docker compose down)  to stop them.
#
set -euo pipefail

cd "$(dirname "$0")/.."

echo "→ Starting database and backend (Docker)…"
docker compose up -d --build db backend

echo "→ Waiting for the backend to be ready…"
until [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/actuator/health || true)" = "200" ]; do
  sleep 2
done

echo "→ Starting the Angular dev server (hot reload) on http://localhost:4200"
echo "  (Ctrl+C stops it; the db+backend stay up — use 'docker compose stop' to stop them.)"
cd frontend
[ -d node_modules ] || npm install
npm start
