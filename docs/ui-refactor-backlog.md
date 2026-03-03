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
- Files:
  - `clients/demo/pages.json`
  - `apps/web/public/...` (if local media assets are added)
- Goal:
  - Replace demo flower clip with textile-specific loop.
  - Add mobile-specific crop/focal composition.
- Acceptance:
  - Brand-media fit for curtains/tulle.
  - No awkward loop reset feeling.

### 9) Shared element transitions (grid -> PDP)
- Files:
  - `packages/ui/src/components/ProductCard.tsx`
  - `apps/web/app/product/[slug]/product-page-client.tsx`
- Goal:
  - Premium continuity between list and product page.
- Acceptance:
  - Transition feels coherent and not distracting.

## Local Validation Checklist (Before Any Push)
- `corepack pnpm --dir apps/web build` passes.
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
