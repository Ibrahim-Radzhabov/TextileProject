#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_PORT="${API_PORT:-8011}"
WEB_PORT="${WEB_PORT:-3011}"
API_URL="http://127.0.0.1:${API_PORT}"
WEB_URL="http://127.0.0.1:${WEB_PORT}"
REPORT_PATH="$ROOT_DIR/lighthouse-pwa.report.json"
API_LOG="/tmp/store-platform-lighthouse-api.log"
WEB_LOG="/tmp/store-platform-lighthouse-web.log"
LIGHTHOUSE_VERSION="${LIGHTHOUSE_VERSION:-11.7.1}"
PWA_MIN_SCORE="${PWA_MIN_SCORE:-0.85}"

API_PID=""
WEB_PID=""

cleanup() {
  if [[ -n "$WEB_PID" ]]; then
    kill "$WEB_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "$API_PID" ]]; then
    kill "$API_PID" >/dev/null 2>&1 || true
  fi
}

wait_for_url() {
  local url="$1"
  local timeout_seconds="${2:-60}"
  local start_ts
  start_ts="$(date +%s)"

  while true; do
    if curl --silent --show-error --fail "$url" >/dev/null 2>&1; then
      return 0
    fi

    if (( "$(date +%s)" - start_ts >= timeout_seconds )); then
      echo "Timed out waiting for $url" >&2
      return 1
    fi

    sleep 1
  done
}

trap cleanup EXIT

cd "$ROOT_DIR"

CLIENT_ID=demo \
FRONTEND_ORIGIN="$WEB_URL" \
STRIPE_WEBHOOK_SECRET=whsec_lighthouse_test \
ORDER_DB_PATH=/tmp/store-platform-lighthouse.sqlite3 \
.venv/bin/uvicorn apps.api.main:app --host 127.0.0.1 --port "${API_PORT}" >"$API_LOG" 2>&1 &
API_PID="$!"

STORE_API_URL="$API_URL" \
NEXT_PUBLIC_STORE_API_URL="$API_URL" \
ADMIN_TOKEN=e2e-admin \
corepack pnpm --dir apps/web build

mkdir -p apps/web/.next/standalone/apps/web/.next/static
cp -R apps/web/.next/static/. apps/web/.next/standalone/apps/web/.next/static/
mkdir -p apps/web/.next/standalone/apps/web/public
cp -R apps/web/public/. apps/web/.next/standalone/apps/web/public/

STORE_API_URL="$API_URL" \
NEXT_PUBLIC_STORE_API_URL="$API_URL" \
ADMIN_TOKEN=e2e-admin \
HOSTNAME=127.0.0.1 \
PORT="${WEB_PORT}" \
node apps/web/.next/standalone/apps/web/server.js >"$WEB_LOG" 2>&1 &
WEB_PID="$!"

wait_for_url "$API_URL/health" 60
wait_for_url "$WEB_URL" 60

rm -f "$REPORT_PATH"

corepack pnpm dlx "lighthouse@${LIGHTHOUSE_VERSION}" "$WEB_URL" \
  --quiet \
  --only-categories=pwa \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu" \
  --output=json \
  --output-path="$REPORT_PATH"

node "$ROOT_DIR/scripts/assert-lighthouse-pwa.mjs" "$REPORT_PATH" "$PWA_MIN_SCORE"

echo "Lighthouse report: $REPORT_PATH"
