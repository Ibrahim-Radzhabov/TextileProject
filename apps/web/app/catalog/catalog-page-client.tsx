"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge, CatalogFilterSidebar, ProductGrid, Surface } from "@store-platform/ui";
import type { PageConfig, Product } from "@store-platform/shared-types";
import { useCartStore } from "@/store/cart-store";
import { enableSharedProductTransition } from "@/lib/feature-flags";
import { resolveCatalogViewPreset, type CatalogSort } from "@/lib/catalog-view-presets";
import { renderNonProductGridBlock } from "@/lib/page-block-renderers";

type CatalogPageClientProps = {
  page: PageConfig;
  products: Product[];
  allTags: string[];
};

const sortOptions: Array<{ value: CatalogSort; label: string }> = [
  { value: "recommended", label: "Рекомендовано" },
  { value: "price_asc", label: "Цена ↑" },
  { value: "price_desc", label: "Цена ↓" },
  { value: "name_asc", label: "Название A-Z" },
  { value: "name_desc", label: "Название Z-A" }
];

function formatMoney(amount: number | null, currency: string): string {
  if (amount === null) {
    return "—";
  }

  return amount.toLocaleString(undefined, {
    style: "currency",
    currency
  });
}

export function CatalogPageClient({ page, products, allTags }: CatalogPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addProduct } = useCartStore();
  const activePreset = useMemo(
    () => resolveCatalogViewPreset(searchParams.get("view"), allTags),
    [allTags, searchParams]
  );
  const [tagsFilter, setTagsFilter] = useState<string[]>(activePreset?.tags ?? []);
  const [sort, setSort] = useState<CatalogSort>(activePreset?.sort ?? "recommended");
  const lastPresetKeyRef = useRef<string | null>(activePreset?.key ?? null);

  useEffect(() => {
    const nextPresetKey = activePreset?.key ?? null;
    if (lastPresetKeyRef.current === nextPresetKey) {
      return;
    }

    lastPresetKeyRef.current = nextPresetKey;
    if (activePreset) {
      setTagsFilter(activePreset.tags);
      setSort(activePreset.sort);
      return;
    }

    setTagsFilter([]);
    setSort("recommended");
  }, [activePreset]);

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

  const selectedCount = tagsFilter.length;
  const featuredCount = useMemo(
    () => filteredProducts.filter((product) => product.isFeatured).length,
    [filteredProducts]
  );

  const firstRichText = page.blocks.find((block) => block.type === "rich-text");
  const priceRange = useMemo(() => {
    if (!filteredProducts.length) {
      return { min: null, max: null };
    }

    let min = filteredProducts[0].price.amount;
    let max = filteredProducts[0].price.amount;

    for (const product of filteredProducts) {
      const amount = product.price.amount;
      if (amount < min) {
        min = amount;
      }
      if (amount > max) {
        max = amount;
      }
    }

    return { min, max };
  }, [filteredProducts]);

  const currency = filteredProducts[0]?.price.currency ?? products[0]?.price.currency ?? "USD";

  const toggleTag = (tag: string) => {
    setTagsFilter((prev) => (prev.includes(tag) ? prev.filter((entry) => entry !== tag) : [...prev, tag]));
  };

  const clearActivePreset = () => {
    setTagsFilter([]);
    setSort("recommended");
    lastPresetKeyRef.current = null;

    const nextSearch = new URLSearchParams(searchParams.toString());
    nextSearch.delete("view");
    const nextQuery = nextSearch.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  };

  return (
    <div className="min-h-0 space-y-8 pb-10">
      <header className="relative overflow-hidden rounded-xl border border-border/45 bg-card/80 px-5 py-6 sm:px-7 sm:py-8">
        <div className="relative space-y-4">
          <div className="space-y-2">
            <h1 className="ui-title text-3xl sm:text-4xl">{page.title}</h1>
            {firstRichText?.type === "rich-text" && (
              <p className="ui-subtle max-w-2xl text-sm leading-relaxed sm:text-base">
                {firstRichText.content}
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/45 bg-card/55 px-3 py-3">
              <p className="ui-kicker">Товаров</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{filteredProducts.length}</p>
            </div>
            <div className="rounded-xl border border-border/45 bg-card/55 px-3 py-3">
              <p className="ui-kicker">Featured</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{featuredCount}</p>
            </div>
            <div className="rounded-xl border border-border/45 bg-card/55 px-3 py-3">
              <p className="ui-kicker">Диапазон цен</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {formatMoney(priceRange.min, currency)} - {formatMoney(priceRange.max, currency)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-7 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <Surface tone="ghost" className="rounded-xl px-4 py-3">
            <CatalogFilterSidebar
              availableTags={allTags}
              value={{ tags: tagsFilter }}
              onChange={(next) => setTagsFilter(next.tags)}
            />
          </Surface>
        </div>

        <div className="space-y-7">
          <div className="rounded-xl border border-border/45 bg-card/62 px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge tone="muted">Всего: {products.length}</Badge>
              <Badge tone="accent">По фильтру: {filteredProducts.length}</Badge>
              {selectedCount > 0 && <Badge tone="accent">Тегов: {selectedCount}</Badge>}
            </div>

            {activePreset && (
              <div
                className="mt-3 rounded-xl border border-border/45 bg-card/55 px-3 py-3"
                data-testid="catalog-preset-banner"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1" data-testid={`catalog-preset-${activePreset.key}`}>
                    <p className="ui-kicker">Preset</p>
                    <p className="text-sm font-medium tracking-tight">{activePreset.label}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{activePreset.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={clearActivePreset}
                    className="rounded-[10px] border border-border/60 px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground"
                    data-testid="catalog-preset-clear"
                  >
                    Сбросить preset
                  </button>
                </div>
              </div>
            )}

            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => {
                  const active = sort === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSort(option.value)}
                      className={[
                        "rounded-[10px] border px-3 py-1 text-[11px] transition-colors",
                        active
                          ? "border-border/75 bg-card/75 text-foreground"
                          : "border-border/55 text-muted-foreground hover:border-border/75 hover:text-foreground"
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <label className="flex items-center gap-2 lg:hidden">
                <span className="ui-kicker">Сортировка</span>
                <select
                  aria-label="Сортировка каталога"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as CatalogSort)}
                  className="h-8 rounded-md border border-border/65 bg-input/80 px-2 text-xs text-foreground shadow-inset outline-none transition-all duration-[var(--motion-fast)] focus:border-border/80 focus:ring-1 focus:ring-ring/70"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {allTags.slice(0, 12).map((tag) => {
                    const active = tagsFilter.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={[
                          "rounded-md border px-2 py-1 text-[11px] transition-colors",
                          active
                            ? "border-border/75 bg-card/75 text-foreground"
                            : "border-border/55 text-muted-foreground hover:border-border/75 hover:text-foreground"
                        ].join(" ")}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {page.blocks.map((block) => {
            if (block.type === "product-grid") {
              return (
                <motion.section
                  key={block.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-xl border border-border/45 bg-card/72 px-5 py-6 sm:px-6"
                >
                  <ProductGrid
                    title={block.title}
                    subtitle={block.subtitle}
                    products={filteredProducts}
                    onQuickAdd={(product) => addProduct(product.id)}
                    enableSharedTransition={enableSharedProductTransition}
                  />
                </motion.section>
              );
            }

            return renderNonProductGridBlock(block);
          })}
        </div>
      </div>
    </div>
  );
}
