# Release Notes

## 2026-03-06

### `unreleased` - Storefront UI checkpoint (hero/catalog/PDP + typography)
- Added current cross-device UI handoff checkpoint (`docs/agent-handoff-ui-current.md`) with restart instructions for the next agent.
- Refined Home hero flow: config-driven content placement (`overlay` / `below`) and removed horizontal scroll behavior from hero/home showcase composition.
- Upgraded Catalog UX with sticky mini-bar presets (`rail=all|new|bestsellers|day-night|blackout`) and aligned neon search/filter interactions with top-nav behavior.
- Upgraded PDP experience with premium content blocks (swatches + service highlights), shared favorite interaction, and sticky mobile CTA.
- Synced E2E catalog presets with current UI copy (`Показано` / `Фильтры`) to keep regression checks stable after copy/tone updates.
- Refreshed storefront visual baselines for `390x844`, `768x1024`, `1280x900` after UI restructuring.
- Applied theme-driven typography and text palette refinement for Atelier variant:
  - tuned text contrast and muted hierarchy,
  - updated semantic `ui-*` type tokens in `globals.css`,
  - migrated button typography to semantic `ui-button` token usage in shared UI.
- Validation after updates:
  - `corepack pnpm --dir apps/web build` passes,
  - `corepack pnpm e2e:visual` passes,
  - `SMOKE_SKIP_BUILD=1 corepack pnpm smoke:storefront` passes.

## 2026-03-03

### `unreleased` - Smoke standalone parity
- Updated `smoke:storefront` to start standalone Next.js server when available.
- Added automatic copy of `.next/static` and `public` assets into standalone output before startup.
- Removed `next start` standalone warning from smoke runs while preserving route/viewport checks.
- Added CI smoke coverage for shared-transition mode (`NEXT_PUBLIC_ENABLE_SHARED_PRODUCT_TRANSITION=1`).
- Added Playwright check for `catalog -> PDP` transition stability (`tests/e2e/storefront-transition.spec.ts`).
- Added catalog query-presets mapping for hero quick-links (`view=room|light|texture|kits`).
- Added Playwright check for catalog presets (`tests/e2e/catalog-presets.spec.ts`).
- Added accessibility hardening for catalog/PDP interactions (focus states, ARIA metadata, keyboard gallery navigation).
- Added Playwright keyboard a11y check (`tests/e2e/storefront-a11y.spec.ts`) and CI guard step.
- Tuned shared transition spring/easing and reduced-motion behavior for product media interactions.
- Added visual snapshot regression suite for storefront key pages (`/`, `/catalog`, `/product/[slug]`) on `390/768/1280`.
- Added dedicated CI visual gate (`corepack pnpm e2e:visual`) and excluded `@visual` specs from generic `e2e` step.
- Added Lighthouse performance guard for storefront routes (`/`, `/catalog`, `/product/[slug]`) with versioned budgets for score/LCP/CLS/INP.
- Added CI performance step (`PERF_SKIP_BUILD=1 corepack pnpm perf:storefront`).
- Stabilized `pwa:lighthouse` for current Lighthouse versions (compatible package pin + adaptive PWA audit set and configurable score threshold).
- Added admin favorites analytics screen (`/admin/analytics/favorites`) with read-only filters (`metric`, `sync_id`, period) and CSV export.
- Added backend favorites analytics endpoints (`GET /metrics/favorites-events`, `GET /metrics/favorites-events/export.csv`) with admin token guard.
- Replaced legacy shared favorites sync id with stable `anon-*` id persisted in localStorage + cookie.
- Added E2E coverage for favorites sync persistence and PDP heart state (`tests/e2e/favorites-sync.spec.ts`).

### `44047ba` - Unified storefront smoke + CI gate
- Added `smoke:storefront` script with route checks and viewport QA for `390/768/1024/1280`.
- Wired smoke check into CI workflow (`Storefront smoke` step).
- Added smoke artifacts output directory to `.gitignore`.

### `67921de` - P2.9 shared transitions behind feature flag
- Reintroduced shared element transition (`catalog -> PDP`) behind `NEXT_PUBLIC_ENABLE_SHARED_PRODUCT_TRANSITION`.
- Kept default behavior stable by leaving feature disabled unless explicitly enabled.
- Added rollout path for local demo runs via `make dev-web-demo`.
