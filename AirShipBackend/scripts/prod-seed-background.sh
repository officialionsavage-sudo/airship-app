#!/usr/bin/env bash
# Run from AirShipBackend. Requires DATABASE_URL (Railway public URL + ?sslmode=require).
set -euo pipefail
cd "$(dirname "$0")/.."
LOG="${LOG:-/tmp/airship-prod-seed-pipeline.log}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Set DATABASE_URL to Railway DATABASE_PUBLIC_URL (+ ?sslmode=require)" >&2
  exit 1
fi

export DATABASE_URL

log() { echo "[$(date -Iseconds)] $*" | tee -a "$LOG"; }

wait_for_db() {
  local n=0
  while true; do
    if npx tsx -e "
import { PrismaClient } from '@prisma/client';
(async () => {
  const p = new PrismaClient();
  await p.\$queryRaw\`SELECT 1\`;
  await p.\$disconnect();
  console.log('ok');
})().catch(() => process.exit(1));
" >>"$LOG" 2>&1; then
      log "Database reachable"
      return 0
    fi
    n=$((n + 1))
    log "DB not reachable (attempt $n), retry in 30s…"
    sleep 30
  done
}

run_step() {
  local name=$1
  shift
  local tries=0
  while [[ $tries -lt 20 ]]; do
    tries=$((tries + 1))
    log "=== $name (try $tries) ==="
    if "$@" >>"$LOG" 2>&1; then
      log "=== $name OK ==="
      return 0
    fi
    log "=== $name failed, retry in 60s ==="
    sleep 60
    wait_for_db
  done
  log "=== $name gave up after 20 tries ==="
  return 1
}

log "Pipeline start"
wait_for_db
run_step "db:seed:resume" npm run db:seed:resume
run_step "db:seed:bulk" npm run db:seed:bulk

npx tsx -e "
import { PrismaClient } from '@prisma/client';
(async () => {
  const p = new PrismaClient();
  const [cities, projects, tours, units, offers, cars, bookings, contacts, reviews] = await Promise.all([
    p.city.count(), p.project.count(), p.tour.count(), p.unit.count(),
    p.offer.count(), p.car.count(), p.bookingInquiry.count(), p.contactInquiry.count(), p.review.count(),
  ]);
  console.log(JSON.stringify({ cities, projects, tours, units, offers, cars, bookings, contacts, reviews }));
  await p.\$disconnect();
})();
" | tee -a "$LOG"

log "Pipeline complete"
