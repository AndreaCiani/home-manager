#!/usr/bin/env bash
#
# Backs up home-manager: the PostgreSQL database AND the uploaded document
# files (the DB only holds their metadata, so both are needed).
#
# Usage:
#   ./scripts/backup.sh [compose-file]
#   # e.g. in production:
#   ./scripts/backup.sh docker-compose.prod.yml
#
# Schedule it (e.g. daily at 3am) with cron:
#   0 3 * * * cd /path/to/home-manager && ./scripts/backup.sh docker-compose.prod.yml >> backups/backup.log 2>&1
#
set -euo pipefail

cd "$(dirname "$0")/.."

# Load .env (for POSTGRES_USER / POSTGRES_DB) if present.
if [ -f .env ]; then
  set -a; . ./.env; set +a
fi

COMPOSE_FILE="${1:-docker-compose.yml}"
DC=(docker compose -f "${COMPOSE_FILE}")
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_DIR="backups"
DB_USER="${POSTGRES_USER:-homemanager}"
DB_NAME="${POSTGRES_DB:-homemanager}"

mkdir -p "${OUT_DIR}"

echo "→ Dumping database (${DB_NAME})…"
"${DC[@]}" exec -T db pg_dump -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${OUT_DIR}/db-${STAMP}.sql.gz"

echo "→ Archiving uploaded files…"
"${DC[@]}" exec -T backend tar -czf - -C /data documents > "${OUT_DIR}/documents-${STAMP}.tar.gz"

echo "✓ Backup complete:"
ls -lh "${OUT_DIR}/db-${STAMP}.sql.gz" "${OUT_DIR}/documents-${STAMP}.tar.gz"
