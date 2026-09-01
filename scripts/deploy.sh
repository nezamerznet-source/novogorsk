#!/usr/bin/env bash
set -euo pipefail

cd /opt/novogorsk

# Preserve .env across git reset (never overwrite from git)
ENV_BACKUP=""
if [[ -f .env ]]; then
  ENV_BACKUP="$(mktemp)"
  cp -a .env "$ENV_BACKUP"
fi

git fetch origin
git reset --hard origin/main

if [[ -n "$ENV_BACKUP" ]]; then
  cp -a "$ENV_BACKUP" .env
  rm -f "$ENV_BACKUP"
fi

# Load runtime secrets for build/migrate (systemd also uses EnvironmentFile)
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

# Ensure Nitro builds the Node server binary used by systemd (not vercel)
if grep -q 'preset: "vercel"' vite.config.ts 2>/dev/null; then
  sed -i 's/preset: "vercel"/preset: "node-server"/' vite.config.ts
fi
export NITRO_PRESET=node-server

npm ci || npm install --include=dev
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
echo "Smoke OK: ${SMOKE}"
echo "Deploy finished successfully"
