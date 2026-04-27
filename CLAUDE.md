# Textile Studio — Project Identity & Design Brief

## What this project is

Textile Studio is a **premium textile e-commerce storefront** — an online atelier for curated, high-end fabrics (silk, linen, voile, organza, velvet). The brand targets interior designers, fashion ateliers, and discerning private buyers who value material quality over mass production.

**Reference tier:** Hermès, Aesop, COS, The Row, Arket — not Zara, not H&M, not Shopify default.

## Brand voice

- **Quiet confidence.** Never loud, never salesy. The product speaks for itself.
- **Material-first.** Every design decision should make the user *feel* the fabric through the screen — texture, drape, weight.
- **Curated, not comprehensive.** This is a boutique, not a marketplace. Fewer items, more intention.
- **Russian-language primary** with potential for English. Tone: refined but warm, not cold or clinical.

## Design principles (in priority order)

1. **Breathing room above all.** Generous whitespace is the #1 luxury signal. When in doubt, add more space. 80-120px between homepage sections. 24-32px grid gaps. Let content float in space.

2. **Restraint over spectacle.** No neon glows, no rotating gradients, no bouncy animations. Luxury motion is barely perceptible — 200-300ms fades, subtle scale shifts (1.02-1.04x), gentle opacity transitions. If an animation draws attention to itself, it's too much.

3. **Typographic discipline.** Two fonts maximum: Manrope (sans-serif, UI) + Lora (serif, display/editorial). No exceptions. Body line-height 1.65+. Generous letter-spacing on kickers (0.08em+). Tight tracking on display heads (-0.02em).

4. **Warm neutral palette.** Ivory/parchment base (#F6F4F1 family), deep warm brown foreground (#221C18 family). All colors through semantic tokens — never hardcoded values in components.

5. **Photography-driven.** The product photography IS the design. Code should frame images, not compete with them. Blur-up loading (LQIP), proper aspect ratios (4:5 for cards, mixed for editorial), Next.js `<Image>` everywhere.

6. **Mobile-first, but desktop-optimized.** Mobile should feel like holding a lookbook. Desktop should feel like walking through a showroom. No cluttered bottom bars — keep mobile minimal.

## Technical architecture

```
apps/web/                    — Next.js 14+ App Router storefront
  app/
    storefront-shell.tsx     — orchestrates header, sidebar, mobile actions
    home-page-client.tsx     — homepage with hero, editorial rail, product grid
    product/[slug]/
      product-page-client.tsx — PDP with gallery, info panel, cart
      product-gallery-lightbox.tsx — lightbox dialog shell
    (components)/
      mobile-bottom-nav.tsx  — persistent bottom nav on mobile
  lib/
    theme-variants.ts        — cookie-based theme switching

packages/ui/                 — shared component library
  src/components/
    ProductGallery.tsx       — gallery + zoom/pan/lightbox logic (unified)
    TopNav.tsx               — responsive navigation bar
    Button.tsx               — button with ripple effect
    Surface.tsx              — glass-morphism container
    ProductCard.tsx          — product card with crossfade
    AnimatedDock.tsx         — bottom nav icon dock
  src/motion/
    presets.ts               — centralized motion vocabulary

packages/config-schema/      — Zod-validated store config schema
clients/demo/                — demo store fixture data (pages.json, products)
```

## Key design decisions (do not change without discussion)

- **Mobile header:** menu (left) → brand (center) → search (right). No favorites/cart icons — those live in bottom nav only.
- **Shared-return animation** for product viewer is desktop-only. Mobile skips it to avoid geometry instability.
- **Zoom/pan logic** is unified inside ProductGallery.tsx, not split across components.
- **Color tokens** use RGB-channel approach: `rgb(var(--color-xxx) / <alpha>)` for alpha compositing.
- **Motion presets** are centralized in `packages/ui/src/motion/presets.ts`. All animations reference these.
- **`prefers-reduced-motion`** is respected across all CSS modules and JS.

## When writing new code

- Use semantic color tokens (`text-foreground`, `bg-background`, `text-muted-foreground`), never raw hex/rgba
- Use Tailwind utility classes, with CSS modules for complex animations
- Use Next.js `<Image>` for all imagery, with blur placeholder
- Animations: max 300ms duration, ease `[0.16, 1, 0.3, 1]`, minimal scale/opacity changes
- Spacing: use the higher end of Tailwind scale. When choosing between `gap-4` and `gap-6`, choose `gap-6`
- Typography: use `.ui-*` utility classes from globals.css for consistent type hierarchy
- Test at 390px, 768px, and 1440px breakpoints
- Run `corepack pnpm --dir packages/ui exec tsc --noEmit` and `corepack pnpm --dir apps/web exec tsc --noEmit` before committing

## What 10/10 looks like

The site should feel like opening a physical lookbook from a Milanese textile house:
- Slow, deliberate pacing — you scroll through the collection, you don't skim it
- Photography dominates every viewport — code is invisible infrastructure
- Interactions are so subtle they feel inevitable, not designed
- The warm ivory background feels like holding linen paper
- Typography reads like a well-set editorial spread
- Loading is seamless — no layout shifts, no flash of unstyled content, images bloom gently from blur

**The highest compliment is when someone says "this doesn't feel like a website."**

## Dev commands

```bash
make dev                           # start API + web servers
corepack pnpm --dir apps/web exec tsc --noEmit    # typecheck web
corepack pnpm --dir packages/ui exec tsc --noEmit  # typecheck UI lib
```

## Adding new products to the catalog

Products live in `clients/demo/catalog.json`. Each product must follow this structure:

```json
{
  "id": "p-unique",
  "slug": "kebab-case-unique",
  "name": "Product name",
  "description": "Full description for PDP.",
  "shortDescription": "One line for product card (2 lines max).",
  "price": { "currency": "USD", "amount": 299.0 },
  "compareAtPrice": { "currency": "USD", "amount": 349.0 },
  "badges": [{ "id": "b1", "label": "New", "tone": "accent" }],
  "tags": ["drape", "linen", "bedroom"],
  "media": [
    { "id": "m1", "url": "/demo/photo1.jpeg", "alt": "Descriptive Russian alt text — material + scene + color" },
    { "id": "m1-detail", "url": "/demo/photo2.jpeg", "alt": "Close-up detail alt text" }
  ],
  "isFeatured": false,
  "isActive": true,
  "metadata": {
    "Light control": "95-100%",
    "Fabric": "Linen blend",
    "Width panel": "150 cm",
    "Care": "Dry clean",
    "colorOptions": [
      { "id": "p1-ivory", "label": "Ivory Linen", "tone": "ivory", "mediaIds": ["m1", "m1-detail"] }
    ]
  }
}
```

**Rules:**
- `id` and `slug` must be unique across all products. Slug must be kebab-case.
- `price` and `compareAtPrice` must use the same `currency`. `compareAtPrice` must be greater than `price`.
- `media` — always include **two images** (primary + detail/hover). The second image is used for the crossfade hover effect on product cards. Without it, crossfade does not work.
- `alt` texts must be descriptive in Russian: material + use case + color. Never use filenames or generic words like "photo".
- `tags` control three things:
  - **SEO page title** on PDP: use type tags — `drape`, `tulle`, `blackout`, `velvet`, `linen`, `day-night`, `sheer`, `dimout`, `jacquard`, `acoustic`
  - **Overline label** in product cards: use room tags — `bedroom`, `living-room`, `office`, `kids`
  - **"You may also like" related products**: products sharing at least one tag appear as related on each other's PDP (max 4 shown). Always share at least one tag with similar products.
  - Tag `featured` hides the overline in cards.
- `shortDescription` appears in the product card body (truncated to 2 lines) and in the meta description — keep it under 120 characters.
- `badges.tone`: `accent` (highlighted), `neutral` (muted), `critical` (sale/urgent).
- `isActive: false` marks the product as OutOfStock in Schema.org structured data.
- `metadata.colorOptions[].tone` should match one of the swatch keys in `product-page-client.tsx` (`linen`, `jacquard`, `velvet`, `blackout`, `sheer`, `tulle`) for a named swatch color, or any other string for a neutral fallback.
- `metadata.colorOptions[].mediaIds` must reference valid `media[].id` values within the same product.

**After adding products**, run:
```bash
corepack pnpm --dir apps/web exec tsc --noEmit
```

## Files to not commit

- `.tmp_zoom_*.mjs` — temporary debug scripts
- `apps/web/tsconfig.tsbuildinfo` — build artifact
- `AUDIT-REPORT.md` — internal audit notes
- `DESIGN-AUDIT.md` — design audit (this file's companion)
