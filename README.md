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
