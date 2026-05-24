#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SQL_FILE="$ROOT_DIR/docs/demo/demo_seed.sql"
BACKEND_SQL_FILE="$ROOT_DIR/docs/demo/backend_portfolio_seed.sql"

if [[ ! -f "$SQL_FILE" ]]; then
  echo "Missing seed file: $SQL_FILE" >&2
  exit 1
fi

if [[ -n "${DATABASE_URL:-}" ]]; then
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SQL_FILE"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$BACKEND_SQL_FILE"
  exit 0
fi

if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -qx 'foliosage-postgres'; then
  docker exec -i foliosage-postgres psql \
    -U "${POSTGRES_USER:-foliosage}" \
    -d "${POSTGRES_DB:-foliosage}" \
    -v ON_ERROR_STOP=1 < "$SQL_FILE"
  docker exec -i foliosage-postgres psql \
    -U "${POSTGRES_USER:-foliosage}" \
    -d "${POSTGRES_DB:-foliosage}" \
    -v ON_ERROR_STOP=1 < "$BACKEND_SQL_FILE"
  exit 0
fi

cat >&2 <<'EOF'
Could not find a database target.

Use one of:
  DATABASE_URL='postgresql://user:password@host:5432/foliosage' ./scripts/seed-demo-data.sh
  docker compose up -d postgres && ./scripts/seed-demo-data.sh

For production, run this script on the deploy host or set DATABASE_URL to the production database.
EOF
exit 1
