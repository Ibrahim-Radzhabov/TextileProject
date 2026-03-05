# Agent Handoff: UI Neon Search (Top Nav)

Last updated: 2026-03-05 (MSK)

## Start point
- Branch: `main`
- Commit to start from: `00845490` (`chore: checkpoint current UI progress for cross-device work`)
- Repo: `https://github.com/Ibrahim-Radzhabov/TextileProject`

## What is already implemented
- Added animated expandable search/filter in top nav (home header, right side):
  - `apps/web/app/(components)/top-nav-search-filter.tsx`
  - `apps/web/app/(components)/top-nav-search-filter.module.css`
- Replaced old static search icon in shell:
  - `apps/web/app/storefront-shell.tsx`
- Catalog now reads `q` from URL and supports `open_filters=1` from top-nav search action:
  - `apps/web/app/catalog/catalog-page-client.tsx`
- Added/updated animated catalog filter input component:
  - `packages/ui/src/components/AnimatedFilterInput.tsx`
  - `packages/ui/src/index.ts`

## Current behavior
- On desktop home (`/`), top-nav search opens in expanded animated mode by default.
- Search submit routes to `/catalog?q=...`.
- Filter button routes to `/catalog?q=...&open_filters=1`.
- Animation uses theme-driven accents (`--color-accent`, `--color-accent-soft`), not hardcoded neon palette.

## User expectation gap (important)
- User expects effect closer to reference video: stronger and clearly visible animated perimeter/glow.
- Current implementation is improved, but may still need stronger visual parity (motion contrast and highlight passes).

## Recommended next actions (priority)
1. Tune top-nav neon effect to match reference 1:1:
   - Increase moving bright segments contrast (edge trace).
   - Add second fast highlight pass (short arc) on border ring.
   - Keep `prefers-reduced-motion` fallback static.
2. Add explicit mode token:
   - `balanced | vivid` for top-nav neon search (theme/config-driven).
3. Validate in real runtime (not build only):
   - `make dev` and hard refresh browser cache.
   - Check desktop + mobile behavior.

## Run locally
```bash
cd /Users/ibragimibragimov/Documents/TextileProject
CLIENT_ID=demo STORE_API_URL=http://127.0.0.1:8000 NEXT_PUBLIC_STORE_API_URL=http://127.0.0.1:8000 ADMIN_TOKEN=admin123 make dev
```

## Notes
- Do not commit local secrets (`apps/api/.env`).
- Ignore `.DS_Store` changes.
