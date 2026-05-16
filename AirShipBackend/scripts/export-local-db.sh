#!/usr/bin/env bash
# Export rows-only from local Docker Postgres (repo-root docker-compose.yml).
# Usage (from repo root): ./AirShipBackend/scripts/export-local-db.sh [output.sql]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${1:-$ROOT/airship-data-only.sql}"

cd "$ROOT"
if ! docker compose exec -T postgres pg_isready -U airship >/dev/null 2>&1; then
  echo "Postgres not reachable. From repo root run: docker compose up -d postgres"
  exit 1
fi

echo "Writing data-only dump to $OUT ..."
# Omit _prisma_migrations: Railway already applied migrations; importing local migration rows causes duplicate errors.
docker compose exec -T postgres pg_dump -U airship airship \
  --data-only \
  --no-owner \
  --no-privileges \
  --exclude-table=_prisma_migrations \
  >"$OUT"

echo "Done. Tables must already exist on Railway (deploy backend so prisma migrate deploy runs)."
echo "Import on your Mac with Railway PUBLIC DATABASE_URL:"
echo "  export DATABASE_URL='postgresql://...'"
echo "  psql \"\$DATABASE_URL\" -f \"$OUT\""
