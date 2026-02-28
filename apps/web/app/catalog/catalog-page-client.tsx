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

type CatalogSort = "recommended" | "price_asc" | "price_desc" | "name_asc" | "name_desc";

export function CatalogPageClient({ page, products, allTags }: CatalogPageClientProps) {
  const { addProduct } = useCartStore();
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [sort, setSort] = useState<CatalogSort>("recommended");

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (!tagsFilter.length) {
        return true;
      }

      const tags = product.tags ?? [];
      return tagsFilter.some((tag) => tags.includes(tag));
    });

    if (sort === "recommended") {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      if (sort === "price_asc") {
        return a.price.amount - b.price.amount;
      }
      if (sort === "price_desc") {
        return b.price.amount - a.price.amount;
      }
      if (sort === "name_desc") {
        return b.name.localeCompare(a.name);
      }
      return a.name.localeCompare(b.name);
    });
  }, [products, sort, tagsFilter]);

  return (
    <div className="min-h-0 space-y-7 pb-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{page.title}</h1>
        <div className="premium-divider" />
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge tone="muted">Всего: {products.length}</Badge>
          <Badge tone="accent">По фильтру: {filteredProducts.length}</Badge>
          <label className="ml-auto flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Сортировка</span>
            <select
              aria-label="Сортировка каталога"
              value={sort}
              onChange={(event) => setSort(event.target.value as CatalogSort)}
              className="h-8 rounded-md border border-border/65 bg-input/80 px-2 text-xs text-foreground shadow-inset outline-none transition-all duration-[var(--motion-fast)] focus:border-accent/55 focus:ring-2 focus:ring-ring/60"
            >
              <option value="recommended">Рекомендовано</option>
              <option value="price_asc">Цена ↑</option>
              <option value="price_desc">Цена ↓</option>
              <option value="name_asc">Название A-Z</option>
              <option value="name_desc">Название Z-A</option>
            </select>
          </label>
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
