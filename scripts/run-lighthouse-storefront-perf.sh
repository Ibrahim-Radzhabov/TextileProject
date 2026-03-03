#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_PORT="${API_PORT:-8012}"
WEB_PORT="${WEB_PORT:-3012}"
API_URL="http://127.0.0.1:${API_PORT}"
WEB_URL="http://127.0.0.1:${WEB_PORT}"
REPORT_DIR="$ROOT_DIR/artifacts/lighthouse-storefront-perf"
SUMMARY_PATH="$REPORT_DIR/summary.json"
BUDGET_PATH="${BUDGET_PATH:-$ROOT_DIR/docs/storefront-performance-budgets.json}"
API_LOG="/tmp/store-platform-lighthouse-perf-api.log"
WEB_LOG="/tmp/store-platform-lighthouse-perf-web.log"
PERF_SKIP_BUILD="${PERF_SKIP_BUILD:-0}"

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

route_to_slug() {
  local route="$1"
  if [[ "$route" == "/" ]]; then
    echo "home"
    return 0
  fi

  local slug="${route#/}"
  slug="${slug//\//-}"
  echo "$slug"
}

trap cleanup EXIT

cd "$ROOT_DIR"

rm -f /tmp/store-platform-lighthouse-perf.sqlite3

CLIENT_ID=demo \
FRONTEND_ORIGIN="$WEB_URL" \
STRIPE_WEBHOOK_SECRET=whsec_lighthouse_perf_test \
ORDER_DB_PATH=/tmp/store-platform-lighthouse-perf.sqlite3 \
.venv/bin/uvicorn apps.api.main:app --host 127.0.0.1 --port "${API_PORT}" >"$API_LOG" 2>&1 &
API_PID="$!"

if [[ "$PERF_SKIP_BUILD" != "1" ]]; then
  STORE_API_URL="$API_URL" \
  NEXT_PUBLIC_STORE_API_URL="$API_URL" \
  ADMIN_TOKEN=e2e-admin \
  corepack pnpm --dir apps/web build
fi

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

rm -rf "$REPORT_DIR"
mkdir -p "$REPORT_DIR"

ROUTES=(
  "/"
  "/catalog"
  "/product/ripple-fold-sheer"
)

TARGETS=()

for route in "${ROUTES[@]}"; do
  slug="$(route_to_slug "$route")"
  report_path="$REPORT_DIR/${slug}.report.json"
  full_url="${WEB_URL}${route}"

  echo "[perf] lighthouse ${full_url}"
  corepack pnpm dlx lighthouse@12.8.2 "$full_url" \
    --quiet \
    --only-categories=performance \
    --preset=desktop \
    --throttling-method=simulate \
    --chrome-flags="--headless=new --no-sandbox --disable-gpu" \
    --output=json \
    --output-path="$report_path"

  TARGETS+=("${route}=${report_path}")
done

node "$ROOT_DIR/scripts/assert-lighthouse-storefront-perf.mjs" \
  "$BUDGET_PATH" \
  "$SUMMARY_PATH" \
  "${TARGETS[@]}"

echo "Storefront perf summary: $SUMMARY_PATH"
