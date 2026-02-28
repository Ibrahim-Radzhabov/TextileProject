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
- `ADMIN_TOKEN` — optional token for protecting `/admin/*` pages in web middleware.
  - If set, open `/admin/login`, enter the token and middleware will store an httpOnly cookie for `/admin`.

Stripe:

- `STRIPE_SECRET_KEY` — secret key for Stripe; if not set, backend falls back to `integrations.stripe.secretKey` from client config.
- `STRIPE_WEBHOOK_SECRET` — webhook secret for `/webhooks/stripe`; if not set, backend falls back to `integrations.stripe.webhookSecret`.

Telegram:

- `TELEGRAM_BOT_TOKEN` — bot token; if not set, backend falls back to `integrations.telegram.botToken`.
- `TELEGRAM_CHAT_ID` — chat id; if not set, backend falls back to `integrations.telegram.chatId`.

Checkout persistence:

- `ORDER_DB_PATH` — optional path to SQLite file for persisted orders and idempotency keys.
  - Default: `apps/api/data/orders.sqlite3`

All env vars are read via `apps/api/config.py` (`Settings`).

---

### Running locally with Docker

The `infra/docker-compose.yml` file starts API and Web together:

```bash
cd infra
cp .env.example .env
docker compose up --build
```

Services:

- API: `http://localhost:8000`
- Web: `http://localhost:3000`

The compose file wires:

- `CLIENT_ID` for the API,
- `STORE_API_URL` (internal SSR URL) and `NEXT_PUBLIC_STORE_API_URL` (browser URL) for the web app,
- `ORDER_DB_PATH` to persisted API SQLite storage volume,
- optional `ADMIN_TOKEN` for `/admin/*`.

---

### Stripe & Telegram integrations (MVP)

- Checkout (`POST /checkout`) always:
  - recalculates cart totals,
  - persists order snapshot in SQLite,
  - supports idempotency via `Idempotency-Key` / `X-Idempotency-Key`,
  - logs order metadata.
- If Stripe is configured (env or `integrations.json`):
  - backend creates a Checkout Session,
  - returns `status: "redirect"` and `redirect_url` to the frontend,
  - uses `FRONTEND_ORIGIN` (or `http://localhost:3000`) to build success/cancel URLs,
  - sets order status to `paid` only after verified webhook event.

When Stripe is not configured or fails, checkout gracefully falls back to `status: "confirmed"` without redirects and sends Telegram order notification (if configured).

Additional endpoints:

- `GET /orders?status=&payment_state=&limit=&offset=` — list persisted orders with status/payment filters and pagination.
- `GET /orders/{order_id}` — get persisted order details.
- `GET /checkout/{order_id}` — fetch persisted order for current tenant.
- `POST /webhooks/stripe` — verifies Stripe signature, deduplicates by (`event_id`, `livemode`, `account`, `client_id`), updates order status (`paid` / `failed` / `cancelled`) and sends Telegram payment notification on `paid`.
- `GET /webhooks/audit?order_id=&processing_status=&limit=&offset=` — list Stripe webhook audit records.

---

### Admin panel auth

- `GET /admin/login` — login screen for token-based admin access.
- `POST /admin/logout` — clears admin cookie and returns to login.
- Middleware protects `/admin/*` routes and redirects unauthorized requests to `/admin/login?next=...`.
- `GET /admin/orders` supports combined lifecycle + payment filters (`payment_state`).

---

### Storefront order status

- `GET /order-status` — customer-facing status page by `order_id`.
- `GET /order-status?order_id=<uuid>` — resolves current order status and surfaces next action (for example, continue payment when status is `redirect`).

---

### E2E tests (Playwright)

From repo root:

```bash
pnpm e2e:install
pnpm e2e
```

What is covered:

- storefront pages render (`/` and `/catalog`) + checkout success UI (`/checkout/success`),
- API checkout contract (`POST /checkout`) with real order creation,
- admin flow (`/admin/login` -> orders list -> order details -> logout),
- integration between created order and admin visibility.

Playwright config auto-starts:

- API on `127.0.0.1:8000`,
- Web on `127.0.0.1:3000` with `ADMIN_TOKEN=e2e-admin`.

---

### Validating client configs

Use the helper script to validate a client:

```bash
pnpm validate-client demo
```

This ensures that `shop.json`, `theme.json`, `catalog.json`, `pages.json`, `seo.json` and `integrations.json` all conform to the shared schemas in `@store-platform/config-schema`.
