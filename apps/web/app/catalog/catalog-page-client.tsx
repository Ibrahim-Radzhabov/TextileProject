"use client";

import { useMemo, useState } from "react";
import { CatalogFilterSidebar, ProductGrid } from "@store-platform/ui";
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
    <div className="min-h-0 space-y-6 pb-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{page.title}</h1>
      </header>

      <CatalogFilterSidebar
        availableTags={allTags}
        value={{ tags: tagsFilter }}
        onChange={(next) => setTagsFilter(next.tags)}
      />

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
  );
}
