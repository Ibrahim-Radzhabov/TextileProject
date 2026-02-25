"use client";

import { Hero, ProductGrid } from "@store-platform/ui";
import type { HeroBlock, PageConfig, ProductGridBlock } from "@store-platform/shared-types";
import { useCartStore } from "@/store/cart-store";
import { useStorefrontConfig } from "./storefront-shell";

function resolveHomePage(pages: PageConfig[]): PageConfig | null {
  if (!pages.length) return null;
  return pages.find((p) => p.kind === "home" || p.slug === "/") ?? pages[0];
}

export default function HomePage() {
  const config = useStorefrontConfig();
  const { addProduct } = useCartStore();

  if (!config) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 animate-pulse rounded bg-muted/40" />
        <div className="h-48 animate-pulse rounded-3xl bg-muted/30" />
      </div>
    );
  }

  const homePage = resolveHomePage(config.pages);
  if (!homePage) {
    return null;
  }

  return (
    <div className="space-y-10">
      {homePage.blocks.map((block) => {
        if (block.type === "hero") {
          const hero = block as HeroBlock;
          return (
            <Hero
              key={hero.id}
              eyebrow={hero.eyebrow}
              title={hero.title}
              subtitle={hero.subtitle}
              primaryCta={hero.primaryCta}
              secondaryCta={hero.secondaryCta}
            />
          );
        }

        if (block.type === "product-grid") {
          const grid = block as ProductGridBlock;
          const products = config.catalog.products.filter((p) => {
            if (grid.filter?.featured && !p.isFeatured) return false;
            if (grid.filter?.tags && grid.filter.tags.length > 0) {
              const tags = p.tags ?? [];
              if (!grid.filter.tags.some((tag) => tags.includes(tag))) {
                return false;
              }
            }
            return true;
          });

          return (
            <section
              key={grid.id}
              id={grid.id === "home-featured" ? "featured" : undefined}
              className="space-y-4"
            >
              <ProductGrid
                title={grid.title}
                subtitle={grid.subtitle}
                products={products}
                onQuickAdd={(product) => addProduct(product.id)}
              />
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}


