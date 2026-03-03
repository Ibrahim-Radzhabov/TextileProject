# Release Notes

## 2026-03-03

### `unreleased` - Smoke standalone parity
- Updated `smoke:storefront` to start standalone Next.js server when available.
- Added automatic copy of `.next/static` and `public` assets into standalone output before startup.
- Removed `next start` standalone warning from smoke runs while preserving route/viewport checks.

### `44047ba` - Unified storefront smoke + CI gate
- Added `smoke:storefront` script with route checks and viewport QA for `390/768/1024/1280`.
- Wired smoke check into CI workflow (`Storefront smoke` step).
- Added smoke artifacts output directory to `.gitignore`.

### `67921de` - P2.9 shared transitions behind feature flag
- Reintroduced shared element transition (`catalog -> PDP`) behind `NEXT_PUBLIC_ENABLE_SHARED_PRODUCT_TRANSITION`.
- Kept default behavior stable by leaving feature disabled unless explicitly enabled.
- Added rollout path for local demo runs via `make dev-web-demo`.
