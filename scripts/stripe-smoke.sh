#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ "${1:-}" == "--help" ]]; then
  cat <<'EOF'
Usage: scripts/stripe-smoke.sh

Required setup:
1) ./\.bin/stripe login
2) Set STRIPE_SECRET_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID in env or infra/.env

The script runs a real local smoke flow:
checkout -> stripe trigger -> webhook -> order paid -> webhook audit check
EOF
  exit 0
fi

if [[ -f "infra/.env" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "infra/.env"
  set +a
fi

STRIPE_BIN="${STRIPE_BIN:-$ROOT_DIR/.bin/stripe}"
UVICORN_BIN="${UVICORN_BIN:-$ROOT_DIR/.venv/bin/uvicorn}"
API_HOST="${API_HOST:-127.0.0.1}"
API_PORT="${API_PORT:-8000}"
API_BASE_URL="http://${API_HOST}:${API_PORT}"
CLIENT_ID="${CLIENT_ID:-demo}"
FRONTEND_ORIGIN="${FRONTEND_ORIGIN:-http://localhost:3000}"
ORDER_DB_PATH="${ORDER_DB_PATH:-/tmp/store-platform-stripe-smoke.sqlite3}"
SMOKE_RUN_DIR="${SMOKE_RUN_DIR:-/tmp/store-platform-stripe-smoke}"

: "${STRIPE_SECRET_KEY:?Set STRIPE_SECRET_KEY in env or infra/.env}"
: "${TELEGRAM_BOT_TOKEN:?Set TELEGRAM_BOT_TOKEN in env or infra/.env}"
: "${TELEGRAM_CHAT_ID:?Set TELEGRAM_CHAT_ID in env or infra/.env}"

if [[ ! -x "$STRIPE_BIN" ]]; then
  echo "Stripe CLI not found at $STRIPE_BIN" >&2
  echo "Install local binary first (expected ./.bin/stripe)." >&2
  exit 1
fi

if [[ ! -x "$UVICORN_BIN" ]]; then
  echo "Uvicorn not found at $UVICORN_BIN" >&2
  echo "Create virtualenv and install API requirements first." >&2
  exit 1
fi

mkdir -p "$SMOKE_RUN_DIR"
RUN_ID="$(date +%Y%m%d-%H%M%S)-$$"
LISTEN_LOG="$SMOKE_RUN_DIR/stripe-listen-$RUN_ID.log"
API_LOG="$SMOKE_RUN_DIR/api-$RUN_ID.log"
CHECKOUT_BODY_FILE="$SMOKE_RUN_DIR/checkout-body-$RUN_ID.json"
CHECKOUT_RESPONSE_FILE="$SMOKE_RUN_DIR/checkout-response-$RUN_ID.json"
ORDER_RESPONSE_FILE="$SMOKE_RUN_DIR/order-response-$RUN_ID.json"
AUDIT_RESPONSE_FILE="$SMOKE_RUN_DIR/audit-response-$RUN_ID.json"
TRIGGER_LOG="$SMOKE_RUN_DIR/stripe-trigger-$RUN_ID.log"

LISTEN_PID=""
API_PID=""

cleanup() {
  if [[ -n "$API_PID" ]] && kill -0 "$API_PID" 2>/dev/null; then
    kill "$API_PID" 2>/dev/null || true
  fi
  if [[ -n "$LISTEN_PID" ]] && kill -0 "$LISTEN_PID" 2>/dev/null; then
    kill "$LISTEN_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "Starting Stripe listener..."
"$STRIPE_BIN" listen --forward-to "${API_BASE_URL}/webhooks/stripe" --print-secret >"$LISTEN_LOG" 2>&1 &
LISTEN_PID="$!"

WEBHOOK_SECRET=""
for _ in {1..120}; do
  if grep -q "You have not configured API keys yet" "$LISTEN_LOG" 2>/dev/null; then
    echo "Stripe CLI is not authenticated. Run: ./.bin/stripe login" >&2
    echo "Listener log: $LISTEN_LOG" >&2
    exit 1
  fi
  WEBHOOK_SECRET="$(grep -Eo 'whsec_[A-Za-z0-9]+' "$LISTEN_LOG" 2>/dev/null | head -n1 || true)"
  if [[ -n "$WEBHOOK_SECRET" ]]; then
    break
  fi
  sleep 0.25
done

if [[ -z "$WEBHOOK_SECRET" ]]; then
  echo "Failed to capture webhook secret from Stripe listener." >&2
  echo "Listener log: $LISTEN_LOG" >&2
  exit 1
fi

echo "Starting API..."
CLIENT_ID="$CLIENT_ID" \
FRONTEND_ORIGIN="$FRONTEND_ORIGIN" \
ORDER_DB_PATH="$ORDER_DB_PATH" \
STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
STRIPE_WEBHOOK_SECRET="$WEBHOOK_SECRET" \
TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN" \
TELEGRAM_CHAT_ID="$TELEGRAM_CHAT_ID" \
"$UVICORN_BIN" apps.api.main:app --host "$API_HOST" --port "$API_PORT" >"$API_LOG" 2>&1 &
API_PID="$!"

for _ in {1..80}; do
  if curl -fsS "${API_BASE_URL}/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

if ! curl -fsS "${API_BASE_URL}/health" >/dev/null 2>&1; then
  echo "API did not become healthy." >&2
  echo "API log: $API_LOG" >&2
  exit 1
fi

cat >"$CHECKOUT_BODY_FILE" <<'JSON'
{
  "cart": {
    "items": [
      {
        "product_id": "p1",
        "quantity": 1
      }
    ]
  },
  "customer": {
    "email": "stripe-smoke@example.com",
    "name": "Stripe Smoke",
    "address_line1": "Main street 1",
    "address_city": "Moscow",
    "address_country": "RU",
    "postal_code": "101000"
  }
}
JSON

CHECKOUT_HTTP_CODE="$(
  curl -sS \
    -o "$CHECKOUT_RESPONSE_FILE" \
    -w "%{http_code}" \
    -H "content-type: application/json" \
    -X POST \
    "${API_BASE_URL}/checkout" \
    --data "@${CHECKOUT_BODY_FILE}"
)"

if [[ "$CHECKOUT_HTTP_CODE" != "200" ]]; then
  echo "Checkout failed with HTTP $CHECKOUT_HTTP_CODE" >&2
  cat "$CHECKOUT_RESPONSE_FILE" >&2
  exit 1
fi

json_path() {
  python3 - "$1" "$2" <<'PY'
import json
import sys

path = sys.argv[2].split(".")
with open(sys.argv[1], "r", encoding="utf-8") as fh:
    value = json.load(fh)

for part in path:
    if isinstance(value, list) and part.isdigit():
        idx = int(part)
        value = value[idx] if idx < len(value) else None
    elif isinstance(value, dict):
        value = value.get(part)
    else:
        value = None
    if value is None:
        break

if value is None:
    print("")
else:
    print(value)
PY
}

ORDER_ID="$(json_path "$CHECKOUT_RESPONSE_FILE" "order_id")"
CHECKOUT_STATUS="$(json_path "$CHECKOUT_RESPONSE_FILE" "status")"
REDIRECT_URL="$(json_path "$CHECKOUT_RESPONSE_FILE" "redirect_url")"

if [[ -z "$ORDER_ID" ]]; then
  echo "Checkout response does not include order_id" >&2
  cat "$CHECKOUT_RESPONSE_FILE" >&2
  exit 1
fi

echo "Checkout created order: $ORDER_ID (status=$CHECKOUT_STATUS)"
if [[ "$CHECKOUT_STATUS" == "redirect" && -n "$REDIRECT_URL" ]]; then
  echo "Stripe Checkout URL: $REDIRECT_URL"
fi

echo "Triggering Stripe webhook event..."
"$STRIPE_BIN" trigger checkout.session.async_payment_succeeded \
  --override "checkout_session:metadata.order_id=${ORDER_ID}" >"$TRIGGER_LOG" 2>&1

ORDER_STATUS=""
for _ in {1..80}; do
  ORDER_HTTP_CODE="$(
    curl -sS -o "$ORDER_RESPONSE_FILE" -w "%{http_code}" "${API_BASE_URL}/orders/${ORDER_ID}"
  )"
  if [[ "$ORDER_HTTP_CODE" == "200" ]]; then
    ORDER_STATUS="$(json_path "$ORDER_RESPONSE_FILE" "status")"
    if [[ "$ORDER_STATUS" == "paid" ]]; then
      break
    fi
  fi
  sleep 0.25
done

if [[ "$ORDER_STATUS" != "paid" ]]; then
  echo "Order did not reach paid status. Current status: ${ORDER_STATUS:-unknown}" >&2
  echo "Order response: $ORDER_RESPONSE_FILE" >&2
  echo "Trigger log: $TRIGGER_LOG" >&2
  echo "API log: $API_LOG" >&2
  echo "Stripe listener log: $LISTEN_LOG" >&2
  exit 1
fi

AUDIT_HTTP_CODE="$(
  curl -sS \
    -o "$AUDIT_RESPONSE_FILE" \
    -w "%{http_code}" \
    "${API_BASE_URL}/webhooks/audit?order_id=${ORDER_ID}&limit=1"
)"

if [[ "$AUDIT_HTTP_CODE" != "200" ]]; then
  echo "Webhook audit request failed with HTTP $AUDIT_HTTP_CODE" >&2
  cat "$AUDIT_RESPONSE_FILE" >&2
  exit 1
fi

AUDIT_PROCESSING_STATUS="$(json_path "$AUDIT_RESPONSE_FILE" "items.0.processing_status")"
AUDIT_ORDER_STATUS="$(json_path "$AUDIT_RESPONSE_FILE" "items.0.order_status")"

if [[ "$AUDIT_PROCESSING_STATUS" != "processed" || "$AUDIT_ORDER_STATUS" != "paid" ]]; then
  echo "Unexpected webhook audit status: processing=$AUDIT_PROCESSING_STATUS order=$AUDIT_ORDER_STATUS" >&2
  cat "$AUDIT_RESPONSE_FILE" >&2
  exit 1
fi

echo
echo "Stripe smoke check passed."
echo "- order_id: $ORDER_ID"
echo "- order_status: $ORDER_STATUS"
echo "- webhook_processing_status: $AUDIT_PROCESSING_STATUS"
echo "- webhook_order_status: $AUDIT_ORDER_STATUS"
echo "- logs:"
echo "  - $LISTEN_LOG"
echo "  - $API_LOG"
echo "  - $TRIGGER_LOG"
