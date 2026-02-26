"use client";

import { useState } from "react";
import { ProductGrid, CatalogFilterSidebar } from "@store-platform/ui";
import { useCartStore } from "@/store/cart-store";
import { useStorefrontConfig } from "../storefront-shell";

export default function CatalogPage() {
  const config = useStorefrontConfig();
  const { addProduct } = useCartStore();
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);

  if (!config) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-muted/40" />
        <div className="h-10 w-full animate-pulse rounded-2xl bg-muted/30" />
      </div>
    );
  }

  const page = config.pages.find((p) => p.kind === "catalog" || p.slug === "/catalog");
  const allTags = Array.from(
    new Set(
      config.catalog.products.flatMap((p) => p.tags ?? [])
    )
  );
  const hasFilteredResults =
    config.catalog.products.filter((p) => {
      if (!tagsFilter.length) return true;
      const tags = p.tags ?? [];
      return tagsFilter.some((t) => tags.includes(t));
    }).length > 0;

  return (
    <div className="min-h-0 space-y-6 pb-8">
      {page && (
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {page.title}
          </h1>
        </header>
      )}

      <CatalogFilterSidebar
        availableTags={allTags}
        value={{ tags: tagsFilter }}
        onChange={(next) => setTagsFilter(next.tags)}
      />

      {page?.blocks.map((block) => {
        if (block.type === "rich-text") {
          return (
            <p
              key={block.id}
              className="text-sm text-muted-foreground"
            >
              {block.content}
            </p>
          );
        }

        if (block.type === "product-grid") {
          const products = config.catalog.products.filter((p) => {
            if (!tagsFilter.length) return true;
            const tags = p.tags ?? [];
            return tagsFilter.some((t) => tags.includes(t));
          });
          return (
            <ProductGrid
              key={block.id}
              title={block.title}
              subtitle={block.subtitle}
              products={products}
              onQuickAdd={(product) => addProduct(product.id)}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

