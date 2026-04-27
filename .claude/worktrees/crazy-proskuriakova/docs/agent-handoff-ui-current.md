# Agent Handoff: Current UI Milestone (Storefront)

## Start Point
- Branch: `main`
- Start commit: `b41bb399`
- Message: `refactor(web): remove horizontal scroll from hero and home showcase`

## Completed Tasks
- [x] Hero video updated in public assets (`textile-loop-desktop.mp4`, `textile-loop-mobile.mp4`)
- [x] Hero IA v2 implemented (config-driven `contentPlacement`: `overlay` / `below`)
- [x] Removed horizontal scroll from hero video
- [x] Removed horizontal showcase section for product cards on home
- [x] Catalog UX v2: sticky mini-bar with presets (`rail=all|new|bestsellers|day-night|blackout`)
- [x] Editorial adjustments for catalog cards and filters
- [x] PDP premium v2:
  - [x] shared favorite animation on PDP
  - [x] swatches block
  - [x] service highlights block
  - [x] sticky mobile CTA for add-to-cart
- [x] Mobile polish pass for Home + Catalog + PDP
- [x] Mobile navigation variant 1 finalized:
  - [x] bottom nav remains primary shopping rail,
  - [x] drawer switched to service/contact/legal only (no duplicate catalog/favorites links).
- [x] Storefront contact layer moved to config-driven `shop` fields (`contacts`, `supportLinks`, `socialLinks`, `primaryCta`) with shell + PDP integration.
- [x] Header/footer drawer QA expanded for `390 / 430 / 768` breakpoints.
- [x] `apps/web` build passes

## Relevant Files
- Home:
  - `apps/web/app/home-page-client.tsx`
  - `apps/web/app/(components)/hero-pinned-video.tsx` (now static media wrapper, no horizontal scroll)
- Catalog:
  - `apps/web/app/catalog/catalog-page-client.tsx`
- PDP:
  - `apps/web/app/product/[slug]/product-page-client.tsx`
- UI primitives:
  - `packages/ui/src/components/ProductCard.tsx`
  - `packages/ui/src/components/FavoriteToggleButton.tsx`
  - `packages/ui/src/components/favorite-toggle-button.module.css`
- Global tokens:
  - `apps/web/app/globals.css`

## What Was Removed
- Deleted: `apps/web/app/(components)/pinned-horizontal-showcase.tsx`

## Important Local-Only Files (Do Not Commit)
- `apps/api/.env`
- `.DS_Store` files
- Optional local media copies:
  - `apps/web/public/demo/hero/hero_var1.mp4`
  - `apps/web/public/demo/hero/textile-loop-desktop.bak.mp4`
  - `apps/web/public/demo/hero/textile-loop-mobile.bak.mp4`

## Where Next Agent Should Continue
1. Final visual QA on real devices (Desktop + iPhone/Android) for:
   - hero readability,
   - catalog mini-bar behavior,
   - PDP sticky mobile CTA overlap with bottom nav.
2. Decide whether to keep or simplify mini-bar preset logic (`rail`) for analytics/SEO URLs.
3. Replace demo contact values in `clients/demo/shop.json` with production brand contacts/socials before public launch.
