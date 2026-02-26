## store-platform

Config-driven, multi-tenant e-commerce storefront platform.

- Apps:
  - `apps/web` — Next.js 14 storefront (App Router, RSC, Tailwind, Framer Motion, Zustand).
  - `apps/api` — FastAPI backend (catalog, cart, order, webhooks).
- Packages:
  - `packages/ui` — shared React UI components.
  - `packages/shared-types` — shared TypeScript types (Product, Order, Configs).
  - `packages/config-schema` — JSON Schemas and validation helpers for client configs.
- Clients:
  - `clients/{CLIENT_ID}` — JSON config for each tenant (shop, theme, catalog, pages, seo, integrations).

The platform is fully driven by `clients/{CLIENT_ID}` configs and is designed for premium, minimalistic, highly animated storefronts.

---

### Client structure (`clients/{CLIENT_ID}`)

Each storefront (tenant) is configured via JSON files:

- `shop.json` — basic shop info (id, name, logo, locale, currency).
- `theme.json` — design tokens (colors, radii, shadows, typography, gradients).
- `catalog.json` — products, prices, media, tags, badges.
- `pages.json` — pages and blocks (hero, product-grid, rich-text, cta-strip).
- `seo.json` — default SEO (titleTemplate, defaultTitle, description, OG image).
- `integrations.json` — Stripe and Telegram configuration.

All configs are validated with Zod schemas from `@store-platform/config-schema`.

---

### Adding a new client

From the repo root:

```bash
pnpm init-client my-client-id
pnpm validate-client my-client-id
```

This will:

- clone `clients/demo` to `clients/my-client-id`;
- replace `"demo"` with `"my-client-id"` where appropriate;
- validate all JSON files against the shared schemas.

To run API/web for a specific client, set:

- `CLIENT_ID=my-client-id` for the API (FastAPI),
- `STORE_CLIENT_ID=my-client-id` for the web app (Next.js),
- `NEXT_PUBLIC_STORE_API_URL` for the web app to point at the API URL.

---

### Environment variables

Core:

- `CLIENT_ID` — current tenant id for the API (used to pick `clients/{CLIENT_ID}`).
- `STORE_CLIENT_ID` — current tenant id for the web app.
- `NEXT_PUBLIC_STORE_API_URL` — base URL of the API for the web app.
- `FRONTEND_ORIGIN` / `frontend_origin` — origin of the web app, used for CORS and Stripe redirect URLs.

Stripe:

- `STRIPE_SECRET_KEY` — secret key for Stripe; if not set, backend falls back to `integrations.stripe.secretKey` from client config.
- `STRIPE_WEBHOOK_SECRET` — optional webhook secret; reserved for future use in `/webhooks/stripe`.

Telegram:

- `TELEGRAM_BOT_TOKEN` — bot token; if not set, backend falls back to `integrations.telegram.botToken`.
- `TELEGRAM_CHAT_ID` — chat id; if not set, backend falls back to `integrations.telegram.chatId`.

All env vars are read via `apps/api/config.py` (`Settings`).

---

### Running locally with Docker

The `infra/docker-compose.yml` file starts API and Web together:

```bash
cd infra
docker compose up --build
```

Services:

- API: `http://localhost:8000`
- Web: `http://localhost:3000`

The compose file wires:

- `CLIENT_ID` for the API,
- `STORE_CLIENT_ID` and `NEXT_PUBLIC_STORE_API_URL` for the web app.

---

### Stripe & Telegram integrations (MVP)

- Checkout (`POST /checkout`) always:
  - recalculates cart totals,
  - logs order metadata,
  - sends Telegram notification (if configured).
- If Stripe is configured (env or `integrations.json`):
  - backend creates a Checkout Session,
  - returns `status: "redirect"` and `redirect_url` to the frontend,
  - uses `FRONTEND_ORIGIN` (or `http://localhost:3000`) to build success/cancel URLs.

When Stripe is not configured or fails, checkout gracefully falls back to `status: "confirmed"` without redirects.

---

### Validating client configs

Use the helper script to validate a client:

```bash
pnpm validate-client demo
```

This ensures that `shop.json`, `theme.json`, `catalog.json`, `pages.json`, `seo.json` and `integrations.json` all conform to the shared schemas in `@store-platform/config-schema`.

