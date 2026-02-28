"use client";

import { useMemo, useState } from "react";
import { Badge, CatalogFilterSidebar, ProductGrid, Surface } from "@store-platform/ui";
import type { PageConfig, Product } from "@store-platform/shared-types";
import { useCartStore } from "@/store/cart-store";
import { renderNonProductGridBlock } from "@/lib/page-block-renderers";

type CatalogPageClientProps = {
  page: PageConfig;
  products: Product[];
  allTags: string[];
};

export function CatalogPageClient({ page, products, allTags }: CatalogPageClientProps) {
  const { addProduct } = useCartStore();
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!tagsFilter.length) {
        return true;
      }

      const tags = product.tags ?? [];
      return tagsFilter.some((tag) => tags.includes(tag));
    });
  }, [products, tagsFilter]);

  return (
    <div className="min-h-0 space-y-7 pb-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{page.title}</h1>
        <div className="premium-divider" />
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge tone="muted">Всего: {products.length}</Badge>
          <Badge tone="accent">По фильтру: {filteredProducts.length}</Badge>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <div className="lg:sticky lg:top-20">
          <Surface tone="ghost" className="rounded-2xl px-4 py-3">
            <CatalogFilterSidebar
              availableTags={allTags}
              value={{ tags: tagsFilter }}
              onChange={(next) => setTagsFilter(next.tags)}
            />
          </Surface>
        </div>

        <div className="space-y-7">
          {page.blocks.map((block) => {
            if (block.type === "product-grid") {
              return (
                <ProductGrid
                  key={block.id}
                  title={block.title}
                  subtitle={block.subtitle}
                  products={filteredProducts}
                  onQuickAdd={(product) => addProduct(product.id)}
                />
              );
            }

            return renderNonProductGridBlock(block);
          })}
        </div>
      </div>
    </div>
  );
}
