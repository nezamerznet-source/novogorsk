#!/usr/bin/env bash
# Deploy from origin/main. Postgres data is NEVER dropped or recreated.
set -euo pipefail

APP_DIR=/opt/novogorsk
BACKUP_DIR=/var/backups/novogorsk
KEEP=14

cd "$APP_DIR"
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
if [[ -n "${DATABASE_URL:-}" ]]; then
  DUMP="$BACKUP_DIR/novogorsk-$STAMP.dump"
  pg_dump --no-owner --no-privileges --format=custom --file="$DUMP" "$DATABASE_URL"
  chmod 600 "$DUMP"
  echo "DB backup: $DUMP"
  ls -1t "$BACKUP_DIR"/novogorsk-*.dump 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -f
else
  echo "ERROR: DATABASE_URL missing — refusing to deploy without a DB backup" >&2
  exit 1
fi

ENV_BACKUP="$(mktemp)"
cp -a .env "$ENV_BACKUP"

git fetch origin
git reset --hard origin/main

cp -a "$ENV_BACKUP" .env
rm -f "$ENV_BACKUP"
chmod 600 .env

set -a
# shellcheck disable=SC1091
source .env
set +a

if grep -q 'preset: "vercel"' vite.config.ts 2>/dev/null; then
  sed -i 's/preset: "vercel"/preset: "node-server"/' vite.config.ts
fi
export NITRO_PRESET=node-server

npm ci || npm install --include=dev
# db:migrate applies pending SQL only; it does not drop the database
npm run build

systemctl restart novogorsk
sleep 2
systemctl is-active --quiet novogorsk

SMOKE="$(curl -sf http://127.0.0.1:8080/ | head -c 200 || true)"
if [[ -z "$SMOKE" ]]; then
  echo "Smoke check failed: empty response from http://127.0.0.1:8080/" >&2
  systemctl status novogorsk --no-pager -l || true
  journalctl -u novogorsk -n 50 --no-pager || true
  exit 1
fi
echo "Smoke OK"
echo "Deploy finished successfully (database preserved, backup $DUMP)"
