# Agent Context — TextileProject

## Project Location
`/Users/ibragimibragimov/Documents/Мои проекты/TextileProject`

**CRITICAL:** The path contains Cyrillic characters (`Мои проекты`). Always quote the path in bash commands, e.g.:
```bash
cd "/Users/ibragimibragimov/Documents/Мои проекты/TextileProject"
```

## Stack
- **Web:** Next.js 14.2.5 (port 3000)
- **API:** FastAPI + Uvicorn (port 8000)
- **Monorepo:** pnpm + turbo (`apps/web`, `apps/api`, `packages/*`)
- **Data:** `clients/demo/catalog.json` (product catalog)

## Local Dev Setup

### Prerequisites
- Node.js + pnpm (use `corepack pnpm` if needed)
- Python `.venv` in project root (was recreated after broken shebang from old path)

### Start API
```bash
pnpm dev:api
```
If `uvicorn` is not found in PATH, use the venv directly:
```bash
.venv/bin/uvicorn apps.api.main:app --reload --port 8000
```

### Start Web
```bash
pnpm dev:web
```
Runs `turbo dev --filter=web` on port 3000.

### Start Both
```bash
pnpm dev
```

## Critical Notes

1. **Port 3000 conflicts** — check `lsof -i :3000` and kill stale node processes before starting web dev server.
2. **Background tasks** — When starting servers via agent tools, use `nohup ... > log 2>&1 &` and `disown`. Do NOT rely on Shell `run_in_background=true` (60s timeout kills processes).
3. **Python venv** — The old `.venv` had absolute shebangs pointing to a non-existent Python path. It was recreated. Always prefer `.venv/bin/uvicorn` if `uvicorn` is missing globally.
4. **Catalog data** — Product images are served from `apps/web/public/demo/`. The API reads `clients/demo/catalog.json`.
5. **No persistent memory** — If this session ends, the agent will not remember any fixes, file edits, or runtime state. All knowledge must be re-read from this file and the codebase.

## Recent History (last session)
- Removed 30 dummy products with SVG-only placeholder images from `catalog.json`.
- Added 18 real products (p34–p51) mapped to PNG photos in `public/demo/`.
- Current catalog: 21 products (p1, p6, product-tyul-batist, p34–p51).
- Icons restyled to thin stroke (Loro Piana style): search, bookmark, bag.
- Catalog tag filter UI fixed in `catalog-page-client.tsx`.
