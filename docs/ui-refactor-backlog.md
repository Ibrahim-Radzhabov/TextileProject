# UI Refactor Backlog (Based on Gemini Audit + Current Codebase)

## Scope
- Storefront first (home/catalog/product).
- Admin UI later.
- No push to `origin/main` until local validation is passed.

## P0 (Must Fix Now)

### 1) Hero readability and layer separation
- Status: `completed` (implemented + local QA/build, desktop screenshot capture in Codex env is flaky).
- Files:
  - `apps/web/app/home-page-client.tsx`
  - `packages/ui/src/components/HeroMedia.tsx`
  - `clients/demo/pages.json`
  - `packages/shared-types/src/configs.ts`
  - `packages/config-schema/src/pages.ts`
- Goal:
  - Text and CTA never visually merge with video background.
  - Safe-zone composition for text and stats.
- Acceptance:
  - H1 and subtitle readable on desktop/mobile without eye strain.
  - No overlap between text area and active video focal point.
  - Mobile viewport `390x844` stays readable.

### 2) Remove non-conversion noise in Hero
- Status: `completed`.
- Files:
  - `apps/web/app/home-page-client.tsx`
  - `clients/demo/pages.json`
- Goal:
  - Remove or relocate utility stats block (`Products/Featured/Budget`) out of Hero.
- Acceptance:
  - Hero focuses on value proposition + CTA + media only.

### 3) Product card visual cleanup (editorial)
- Status: `completed` (initial pass).
- Files:
  - `packages/ui/src/components/ProductCard.tsx`
  - `apps/web/app/globals.css`
- Goal:
  - Reduce badge/chip noise and heavy card framing.
  - Keep product image as dominant element.
- Acceptance:
  - Cleaner grid rhythm.
  - Faster visual scanning in catalog and home grids.

## P1 (Next Pass, 1 day)

### 4) Hero quick-entry IA (Nike-like choice paths)
- Status: `completed` (implemented in config + web + API model).
- Files:
  - `packages/shared-types/src/configs.ts`
  - `packages/config-schema/src/pages.ts`
  - `apps/api/domain/models.py`
  - `apps/web/app/home-page-client.tsx`
  - `clients/demo/pages.json`
- Goal:
  - Replace dashboard-like hero utilities with commerce-oriented quick paths.
  - Keep Hero focused on one message + CTA + guided entry.
- Acceptance:
  - Hero displays up to 4 config-driven quick links.
  - No hardcoded content in Hero quick-entry row.

### 5) Header behavior (immersive -> solid on scroll)
- Status: `completed` (sticky nav + scroll state surface).
- Files:
  - `packages/ui/src/components/LayoutShell.tsx`
  - `packages/ui/src/components/TopNav.tsx`
  - `apps/web/app/globals.css`
- Goal:
  - Transparent/low-noise header at top.
  - Blurred solid header after scroll threshold.
- Acceptance:
  - Header does not steal focus from Hero.
  - Stable readability after scroll.

### 6) Typography system hardening
- Status: `completed` (tokenized helpers in globals + applied to hero/product cards).
- Files:
  - `apps/web/app/globals.css`
  - `packages/ui/src/components/Hero.tsx`
  - `apps/web/app/home-page-client.tsx`
  - `packages/ui/src/components/ProductCard.tsx`
- Goal:
  - Strong hierarchy for H1/H2/body/meta.
  - Unified letter-spacing and line-height tokens.
- Acceptance:
  - Visual hierarchy is clear in one glance.
  - No mixed/random text rhythm between sections.

### 7) Motion consistency
- Status: `completed` (shared presets introduced and wired in core storefront surfaces).
- Files:
  - `packages/ui/src/motion/presets.ts`
  - `packages/ui/src/index.ts`
  - `packages/ui/src/components/*.tsx`
  - `apps/web/app/*/*.tsx`
- Goal:
  - Replace mixed transitions with shared Framer Motion presets.
  - Keep subtle premium motion.
- Acceptance:
  - No abrupt transitions.
  - Smooth interactions under normal CPU load.

## P2 (Polish, 2-3 days)

### 8) Hero media quality pipeline
- Status: `completed` (textile-oriented desktop/mobile video sources configured via page config + local poster fallback + playback stability fix in HeroMedia + hero textual content moved into config-driven block under video via `contentPlacement: below`).
- Files:
  - `clients/demo/pages.json`
  - `apps/web/app/home-page-client.tsx`
  - `packages/ui/src/components/HeroMedia.tsx`
  - `packages/shared-types/src/configs.ts`
  - `packages/config-schema/src/pages.ts`
  - `apps/api/domain/models.py`
  - `apps/web/public/demo/hero/README.md`
- Goal:
  - Replace demo flower clip with textile-specific loop.
  - Add mobile-specific crop/focal composition.
- Acceptance:
  - Brand-media fit for curtains/tulle.
  - No awkward loop reset feeling.

### 9) Shared element transitions (grid -> PDP)
- Status: `completed` (reintroduced behind `NEXT_PUBLIC_ENABLE_SHARED_PRODUCT_TRANSITION=1`; default `off`, rollout via `make dev-web-demo` / explicit env).
- Files:
  - `packages/ui/src/components/ProductCard.tsx`
  - `packages/ui/src/components/ProductGrid.tsx`
  - `packages/ui/src/components/ProductGallery.tsx`
  - `apps/web/app/catalog/catalog-page-client.tsx`
  - `apps/web/app/product/[slug]/product-page-client.tsx`
  - `apps/web/app/storefront-shell.tsx`
  - `apps/web/lib/feature-flags.ts`
- Goal:
  - Premium continuity between list and product page.
- Acceptance:
  - Transition feels coherent and not distracting.

### 10) Remove customer account-like entry points
- Status: `completed` (theme switcher + order-status nav removed; checkout success points back to catalog/home; `/order-status` route removed; dead storefront helper components removed).
- Files:
  - `apps/web/app/storefront-shell.tsx`
  - `apps/web/app/order-status/page.tsx`
  - `apps/web/app/checkout/success/page.tsx`
  - `apps/web/app/checkout/page.tsx`
  - `apps/web/app/(components)/order-status-lookup-card.tsx`
  - `apps/web/app/(components)/theme-demo-switcher.tsx`
- Goal:
  - Keep storefront focused on catalog/checkout only (no user cabinet flow).
- Acceptance:
  - Header has no user account/status actions.
  - `/order-status` is not exposed as a storefront route.

### 11) Metadata runtime stability
- Status: `completed` (dynamic `metadataBase` from request headers; no fallback warning in runtime logs).
- Files:
  - `apps/web/app/layout.tsx`
- Goal:
  - Remove noisy metadata warnings and keep social/meta URL resolution deterministic in different hosts.
- Acceptance:
  - No `metadataBase property ... not set` warning during storefront navigation.

### 12) Storefront viewport regression QA
- Status: `completed` (unified `smoke:storefront` script + CI step; standalone runtime parity with copied `static/public`; ON/OFF smoke coverage in CI + Playwright catalog->PDP transition check).
- Files:
  - `scripts/storefront-smoke.mjs`
  - `.github/workflows/ci.yml`
  - `tests/e2e/storefront-transition.spec.ts`
- Goal:
  - Confirm no layout drift, overflow, or runtime errors on target storefront breakpoints.
- Acceptance:
  - HTTP `200` for key pages, no horizontal overflow, no browser console/page errors in automated run.

## P3 (Next Cycle, 2-3 days)

### 13) Hero quick-links behavior mapping
- Status: `completed` (mapped `view=room|light|texture|kits` to catalog presets with visible banner + reset action + e2e coverage).
- Files:
  - `apps/web/app/catalog/catalog-page-client.tsx`
  - `apps/web/lib/catalog-view-presets.ts`
  - `tests/e2e/catalog-presets.spec.ts`
- Goal:
  - Bind hero quick-link query params (`view=room|light|texture|kits`) to real preset filters/sorts in catalog.
- Acceptance:
  - Every hero quick-link opens catalog in meaningful prefiltered state.
  - Preset state is visible and reversible in catalog controls.

### 14) Catalog/PDP a11y pass
- Status: `completed` (keyboard reachability + ARIA semantics for catalog cards, PDP gallery and main CTA; dedicated e2e a11y check added).
- Files:
  - `packages/ui/src/components/ProductCard.tsx`
  - `packages/ui/src/components/ProductGallery.tsx`
  - `apps/web/app/product/[slug]/product-page-client.tsx`
  - `tests/e2e/storefront-a11y.spec.ts`
  - `.github/workflows/ci.yml`
- Goal:
  - Improve keyboard access and ARIA semantics for card links, gallery thumbs and PDP CTA blocks.
- Acceptance:
  - Keyboard-only flow reaches all key controls on catalog and PDP.
  - No critical accessibility violations in automated checks.

### 15) Transition motion quality polish
- Status: `completed` (shared transition spring tuned; reduced-motion behavior improved for card media hover).
- Files:
  - `packages/ui/src/components/ProductCard.tsx`
  - `packages/ui/src/components/ProductGallery.tsx`
  - `apps/web/app/product/[slug]/product-page-client.tsx`
  - `packages/ui/src/motion/presets.ts`
- Goal:
  - Fine-tune shared transition timing/easing for low-end devices and reduce perceived jitter.
- Acceptance:
  - Transition remains smooth under throttled CPU.
  - No distracting jump in image/title continuity.

### 16) Storefront visual regression guard
- Status: `completed` (visual snapshot suite for home/catalog/PDP on 390/768/1280 + dedicated CI gate).
- Files:
  - `tests/e2e/storefront-visual.spec.ts`
  - `tests/e2e/storefront-visual.spec.ts-snapshots/*`
  - `playwright.config.ts`
  - `package.json`
  - `.github/workflows/ci.yml`
- Goal:
  - Catch accidental visual drift in key storefront entry points early.
- Acceptance:
  - Snapshot checks cover `/`, `/catalog`, `/product/[slug]` for target breakpoints.
  - CI fails on meaningful snapshot diffs.

### 17) Storefront performance budget guard
- Status: `completed` (Lighthouse perf runner for `/`, `/catalog`, `/product/[slug]` + CI budget gate for score/LCP/CLS/INP).
- Files:
  - `scripts/run-lighthouse-storefront-perf.sh`
  - `scripts/assert-lighthouse-storefront-perf.mjs`
  - `docs/storefront-performance-budgets.json`
  - `package.json`
  - `.github/workflows/ci.yml`
- Goal:
  - Keep storefront perf regressions visible before merge.
- Acceptance:
  - CI enforces per-route thresholds for performance score and core metrics.
  - Budget file is versioned and can be tuned explicitly.

## P4 (Conversion, current cycle)

### 18) Checkout mobile summary/CTA polish
- Status: `completed` (mobile sticky bottom summary + submit CTA, desktop CTA kept inline; checkout summary list constrained on small screens).
- Files:
  - `apps/web/app/checkout/page.tsx`
- Goal:
  - Keep the primary checkout action visible on mobile without long scroll.
  - Reduce friction between form completion and order submission.
- Acceptance:
  - Mobile viewport keeps total + submit control visible in a fixed bottom bar.
  - No viewport overflow/runtime errors on checkout in smoke run.

### 19) Checkout success conversion polish
- Status: `completed` (editorial success card with clear completion state, readable order id token, and conversion-first CTA order).
- Files:
  - `apps/web/app/checkout/success/page.tsx`
- Goal:
  - Make post-checkout state explicit and calm.
  - Keep users in storefront flow with clear next actions.
- Acceptance:
  - Success page clearly communicates completion and optional order id.
  - Primary action leads back to catalog, secondary action returns home.

### 20) Mobile bottom navigation (storefront)
- Status: `completed` (fixed bottom nav with 4 actions: home, catalog, cart, favorites; active state by route; cart opens drawer; hidden on admin and checkout flow).
- Files:
  - `apps/web/app/storefront-shell.tsx`
  - `apps/web/app/(components)/mobile-bottom-nav.tsx`
  - `apps/web/app/favorites/page.tsx`
  - `packages/ui/src/components/LayoutShell.tsx`
- Goal:
  - Give smartphone users persistent core navigation without returning to top header.
  - Match familiar tab-bar behavior for storefront browsing.
- Acceptance:
  - On mobile storefront pages, fixed bottom bar is visible with 4 labeled icons.
  - No overlap regressions with checkout fixed CTA and no admin-route leakage.

### 21) Favorites functional layer
- Status: `completed` (persistent favorites store + heart toggle on product cards + favorites listing page with quick-add/removal flow).
- Files:
  - `apps/web/store/favorites-store.ts`
  - `packages/ui/src/components/ProductCard.tsx`
  - `packages/ui/src/components/ProductGrid.tsx`
  - `apps/web/app/home-page-client.tsx`
  - `apps/web/app/catalog/catalog-page-client.tsx`
  - `apps/web/app/product/[slug]/product-page-client.tsx`
  - `apps/web/app/favorites/page.tsx`
  - `apps/web/app/favorites/favorites-page-client.tsx`
  - `scripts/storefront-smoke.mjs`
- Goal:
  - Turn bottom-nav "Избранное" into a real shopping flow, not a static stub.
  - Preserve selected products between sessions on the same device.
- Acceptance:
  - Product cards allow add/remove favorites via heart icon.
  - `/favorites` shows persisted items and supports quick add + remove.
  - Smoke route coverage includes `/favorites`.

### 22) Favorites analytics (admin read-only)
- Status: `completed` (API list/export + admin screen with filters by metric/sync_id/date and CSV export proxy).
- Files:
  - `apps/api/routers/metrics.py`
  - `apps/api/domain/order_store.py`
  - `apps/api/domain/models.py`
  - `apps/web/lib/api-client.ts`
  - `apps/web/app/admin/analytics/favorites/page.tsx`
  - `apps/web/app/admin/analytics/favorites/export/route.ts`
- Goal:
  - Give admin a read-only observability surface for favorites behavior.
- Acceptance:
  - `/admin/analytics/favorites` shows filtered events.
  - Export endpoint returns CSV for active filters.

### 23) Favorites sync-id personalization
- Status: `completed` (legacy `shared` removed; stable `anon-*` id persisted in localStorage + cookie with fallback generation).
- Files:
  - `apps/web/store/favorites-store.ts`
- Goal:
  - Move away from global `shared` sync namespace and keep per-browser stable sync identity.
- Acceptance:
  - New sessions get `anon-*` sync id.
  - Existing `shared` ids are migrated on init.

### 24) Favorites sync e2e coverage
- Status: `completed` (new flow test: home -> add favorite -> reload -> favorites + PDP heart assertion).
- Files:
  - `tests/e2e/favorites-sync.spec.ts`
- Goal:
  - Lock sync/favorite regressions in CI.
- Acceptance:
  - E2E asserts persistence after reload and PDP favorite state consistency.

## Local Validation Checklist (Before Any Push)
- `corepack pnpm --dir apps/web build` passes.
- `corepack pnpm smoke:storefront` passes.
- `corepack pnpm e2e:visual` passes.
- `corepack pnpm perf:storefront` passes.
- Open storefront at `http://127.0.0.1:3000`.
- Verify viewports: `390`, `768`, `1024`, `1280`.
- Hero checks:
  - text readability,
  - CTA visibility,
  - no merge with background focal point.
- Product grid checks:
  - card rhythm,
  - metadata noise level,
  - hover smoothness.
- No console errors in browser DevTools.

## Runbook (Local)
- API:
  - `make dev-api`
- Web (second terminal):
  - `CLIENT_ID=demo STORE_API_URL=http://127.0.0.1:8000 NEXT_PUBLIC_STORE_API_URL=http://127.0.0.1:8000 ADMIN_TOKEN=admin123 make dev-web`
  - `CLIENT_ID=demo STORE_API_URL=http://127.0.0.1:8000 NEXT_PUBLIC_STORE_API_URL=http://127.0.0.1:8000 NEXT_PUBLIC_ENABLE_SHARED_PRODUCT_TRANSITION=1 ADMIN_TOKEN=admin123 make dev-web`
  - or: `make dev-web-demo`
