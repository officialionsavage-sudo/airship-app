#!/usr/bin/env bash
# Drop all tables/data, reapply Prisma migrations (empty schema).
# Usage:
#   export DATABASE_URL='postgresql://...@host:port/railway?sslmode=require'
#   ./scripts/wipe-database.sh
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${DATABASE_URL:-}" && -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Set DATABASE_URL (Railway DATABASE_PUBLIC_URL + ?sslmode=require)" >&2
  exit 1
fi

if [[ "$DATABASE_URL" == *"railway.internal"* ]]; then
  echo "Use the PUBLIC database URL from Railway (not postgres.railway.internal)." >&2
  exit 1
fi

echo "Wiping all data in public schema…"
npx prisma db execute --url "$DATABASE_URL" --file scripts/wipe-database.sql

echo "Reapplying migrations…"
npx prisma migrate deploy

echo "Done. Database is empty. Optional: npm run db:seed:resume && npm run db:seed:bulk"
