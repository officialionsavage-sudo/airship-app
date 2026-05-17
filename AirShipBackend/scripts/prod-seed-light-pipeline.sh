#!/usr/bin/env bash
# Wait for DB → wipe → light catalog seed → bulk inbound fake data.
set -euo pipefail
cd "$(dirname "$0")/.."
LOG="${LOG:-/tmp/airship-seed-pipeline.log}"

if [[ -f .env ]]; then set -a; source .env; set +a; fi
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Missing DATABASE_URL in .env" >&2
  exit 1
fi
export DATABASE_URL SEED_TINY=1

log() { echo "[$(date -Iseconds)] $*" | tee -a "$LOG"; }

wait_for_db() {
  local n=0
  while true; do
  if npx tsx -e "
import { PrismaClient } from '@prisma/client';
(async () => { const p = new PrismaClient(); await p.\$queryRaw\`SELECT 1\`; await p.\$disconnect(); })();
" >>"$LOG" 2>&1; then
      log "Database reachable"
      return 0
    fi
    n=$((n + 1))
    log "DB not ready (attempt $n), retry in 30s…"
    sleep 30
  done
}

log "Light seed pipeline start (SEED_TINY=1)"
wait_for_db
log "Wiping public schema…"
npm run db:wipe >>"$LOG" 2>&1
log "Light catalog seed…"
npm run db:seed:light >>"$LOG" 2>&1
log "Bulk inbound fake data…"
npm run db:seed:bulk >>"$LOG" 2>&1
log "Pipeline complete"
npx tsx -e "
import { PrismaClient } from '@prisma/client';
(async () => {
  const p = new PrismaClient();
  const [cities, projects, tours, offers, cars, bookings, reviews] = await Promise.all([
    p.city.count(), p.project.count(), p.tour.count(), p.offer.count(), p.car.count(),
    p.bookingInquiry.count(), p.review.count(),
  ]);
  console.log(JSON.stringify({ cities, projects, tours, offers, cars, bookings, reviews }));
  await p.\$disconnect();
})();
" | tee -a "$LOG"
