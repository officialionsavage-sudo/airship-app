#!/usr/bin/env bash
# Import a data-only SQL file into hosted Postgres (e.g. Railway).
# Use Railway's PUBLIC connection URL from the dashboard (not postgres.railway.internal).
# Append ssl if needed: ?sslmode=require or &sslmode=require
#
# Usage:
#   export DATABASE_URL='postgresql://user:pass@HOST:PORT/db?sslmode=require'
#   ./AirShipBackend/scripts/import-to-hosted-db.sh [path/to/airship-data-only.sql]
set -euo pipefail

FILE="${1:-$(cd "$(dirname "$0")/../.." && pwd)/airship-data-only.sql}"

if [[ ! -f "$FILE" ]]; then
  echo "File not found: $FILE"
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Set DATABASE_URL to your hosted Postgres URL (public / TCP proxy URL)."
  echo "Internal Railway URLs (postgres.railway.internal) only work inside Railway."
  exit 1
fi

if [[ "$DATABASE_URL" == *"railway.internal"* ]]; then
  echo "ERROR: This URL is internal to Railway. Use the PUBLIC Postgres URL from Railway → Postgres → Connect."
  echo "See AirShipBackend/scripts/COPY_DATA_TO_RAILWAY.txt"
  exit 1
fi

# Hosted Postgres usually requires TLS from your laptop.
CONN="$DATABASE_URL"
if [[ "$CONN" != *"sslmode="* ]]; then
  if [[ "$CONN" == *\?* ]]; then
    CONN="${CONN}&sslmode=require"
  else
    CONN="${CONN}?sslmode=require"
  fi
  echo "Added sslmode=require to connection URL"
fi

command -v psql >/dev/null 2>&1 || {
  echo "Install psql (e.g. brew install libpq && brew link --force libpq)"
  exit 1
}

echo "Importing $FILE ..."
psql "$CONN" -v ON_ERROR_STOP=1 -f "$FILE"
echo "Done."
