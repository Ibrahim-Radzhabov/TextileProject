#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-}"
API_URL="${API_URL:-}"
TIMEOUT_SEC="${SMOKE_TIMEOUT_SEC:-8}"

if [[ -z "${BASE_URL}" || -z "${API_URL}" ]]; then
  echo "Usage: BASE_URL=https://shop.example.com API_URL=https://api.example.com bash scripts/post-deploy-smoke.sh"
  exit 1
fi

check_url() {
  local url="$1"
  local expected="$2"
  local status
  status="$(curl -sS -o /tmp/post-deploy-smoke.out -w "%{http_code}" --max-time "${TIMEOUT_SEC}" "${url}")"
  if [[ "${status}" != "${expected}" ]]; then
    echo "[FAIL] ${url} -> ${status} (expected ${expected})"
    echo "--- response snippet ---"
    head -c 600 /tmp/post-deploy-smoke.out || true
    echo
    exit 1
  fi
  echo "[OK]   ${url} -> ${status}"
}

check_contains() {
  local url="$1"
  local pattern="$2"
  local body
  body="$(curl -sS --max-time "${TIMEOUT_SEC}" "${url}")"
  if ! grep -qE "${pattern}" <<<"${body}"; then
    echo "[FAIL] ${url} does not contain pattern: ${pattern}"
    exit 1
  fi
  echo "[OK]   ${url} contains ${pattern}"
}

echo "== API health checks =="
check_url "${API_URL}/health" "200"
check_url "${API_URL}/storefront/config" "200"

echo
echo "== Storefront route checks =="
check_url "${BASE_URL}/" "200"
check_url "${BASE_URL}/catalog" "200"
check_url "${BASE_URL}/favorites" "200"
check_url "${BASE_URL}/checkout" "200"
check_url "${BASE_URL}/manifest.webmanifest" "200"
check_url "${BASE_URL}/sw.js" "200"

echo
echo "== Content sanity checks =="
check_contains "${BASE_URL}/" "Искусство оформления окон|Тихий люкс"
check_contains "${BASE_URL}/catalog" "Каталог|Все позиции"

echo
echo "Post-deploy smoke: PASS"
