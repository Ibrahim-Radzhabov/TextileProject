"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatedFilterInput, Badge, ProductCard, transitionQuick } from "@store-platform/ui";
import type { PageConfig, Product } from "@store-platform/shared-types";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";
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

const CURRENCY_LOCALE = "ru-RU";

function formatMoney(amount: number | null, currency: string): string {
  if (amount === null) {
    return "—";
  }

  return amount.toLocaleString(CURRENCY_LOCALE, {
    style: "currency",
    currency
  });
}

export function CatalogPageClient({ page, products, allTags }: CatalogPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsValue = searchParams.toString();
  const { addProduct } = useCartStore();
  const favoriteProductIds = useFavoritesStore((state) => state.productIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleProduct);
  const activePreset = useMemo(
    () => resolveCatalogViewPreset(searchParams.get("view"), allTags),
    [allTags, searchParams]
  );
  const [tagsFilter, setTagsFilter] = useState<string[]>(activePreset?.tags ?? []);
  const [sort, setSort] = useState<CatalogSort>(activePreset?.sort ?? "recommended");
  const initialSearchValue = searchParams.get("q")?.trim() ?? "";
  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const [showTagFilters, setShowTagFilters] = useState(true);
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

  useEffect(() => {
    const params = new URLSearchParams(searchParamsValue);
    const nextQuery = params.get("q")?.trim() ?? "";
    setSearchValue((prev) => (prev === nextQuery ? prev : nextQuery));

    if (params.get("open_filters") === "1") {
      setShowTagFilters(true);
    }
  }, [searchParamsValue]);

  const filteredProducts = useMemo(() => {
    const searchQuery = searchValue.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const tags = product.tags ?? [];

      if (tagsFilter.length > 0 && !tagsFilter.some((tag) => tags.includes(tag))) {
        return false;
      }

      if (!searchQuery) {
        return true;
      }

      const haystack = [
        product.name,
        product.shortDescription ?? "",
        product.description ?? "",
        ...tags
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(searchQuery);
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
  }, [products, searchValue, sort, tagsFilter]);

  const selectedCount = tagsFilter.length;
  const featuredCount = useMemo(() => filteredProducts.filter((product) => product.isFeatured).length, [filteredProducts]);

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
    <div className="min-h-0 space-y-6 pb-10">
      <header className="rounded-md border border-border/34 bg-card/90 px-4 py-5 sm:px-6 sm:py-6">
        <div className="space-y-2">
          <h1 className="ui-title-display text-[clamp(2rem,4.4vw,3.2rem)] leading-[0.95]">{page.title}</h1>
          {firstRichText?.type === "rich-text" && (
            <p className="ui-subtle max-w-2xl text-sm sm:text-base">{firstRichText.content}</p>
          )}
        </div>
      </header>

      <section className="space-y-4 rounded-md border border-border/34 bg-card/90 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="muted">Всего: {products.length}</Badge>
          <Badge tone="accent">По фильтру: {filteredProducts.length}</Badge>
          {searchValue.trim().length > 0 && <Badge tone="accent">Поиск: {searchValue.trim()}</Badge>}
          {selectedCount > 0 && <Badge tone="accent">Тегов: {selectedCount}</Badge>}
          <Badge tone="muted">Featured: {featuredCount}</Badge>
          <Badge tone="muted">
            {formatMoney(priceRange.min, currency)} - {formatMoney(priceRange.max, currency)}
          </Badge>
        </div>

        {activePreset && (
          <div
            className="rounded-md border border-border/34 bg-card/72 px-3 py-3"
            data-testid="catalog-preset-banner"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1" data-testid={`catalog-preset-${activePreset.key}`}>
                <p className="ui-kicker">Preset</p>
                <p className="text-sm font-medium">{activePreset.label}</p>
                <p className="text-xs text-muted-foreground">{activePreset.description}</p>
              </div>
              <button
                type="button"
                onClick={clearActivePreset}
                className="rounded-[6px] border border-accent/70 bg-accent px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-accent/90"
                data-testid="catalog-preset-clear"
              >
                Сбросить
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
          <AnimatedFilterInput
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Поиск по названию, фактуре и тегам..."
            onFilterClick={() => setShowTagFilters((prev) => !prev)}
            filterActive={showTagFilters}
          />

          <label className="flex items-center gap-2">
            <span className="ui-kicker whitespace-nowrap">Сортировать</span>
            <select
              aria-label="Сортировка каталога"
              value={sort}
              onChange={(event) => setSort(event.target.value as CatalogSort)}
              className="h-9 w-full rounded-[6px] border border-border/55 bg-input/85 px-2.5 text-sm text-foreground outline-none transition-all duration-[var(--motion-fast)] focus:border-border/80 focus:ring-1 focus:ring-ring/60"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <AnimatePresence initial={false}>
          {showTagFilters && (
            <motion.div
              key="catalog-tags"
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={transitionQuick}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {allTags.slice(0, 14).map((tag) => {
                  const active = tagsFilter.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={[
                        "rounded-[6px] border px-2.5 py-1 text-[11px] transition-colors",
                        active
                          ? "border-accent/80 bg-accent text-white"
                          : "border-accent/70 bg-accent/90 text-white hover:bg-accent"
                      ].join(" ")}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {page.blocks.map((block) => {
        if (block.type !== "product-grid") {
          return renderNonProductGridBlock(block);
        }

        return (
          <motion.section
            key={block.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionQuick}
            className="space-y-4 rounded-md border border-border/34 bg-card/90 p-4 sm:p-5"
          >
            {(block.title || block.subtitle) && (
              <header className="space-y-1.5">
                {block.title && <h2 className="ui-title text-[1.45rem] sm:text-[1.7rem]">{block.title}</h2>}
                {block.subtitle && <p className="ui-subtle text-sm">{block.subtitle}</p>}
              </header>
            )}

            <div className="space-y-3 sm:hidden">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...transitionQuick, delay: 0.01 }}
                  className="rounded-[8px] border border-border/32 bg-card/92 p-2.5"
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.media[0]?.url}
                      alt={product.media[0]?.alt ?? product.name}
                      className="h-20 w-20 rounded-[6px] object-cover"
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <a
                        href={`/product/${encodeURIComponent(product.slug)}`}
                        className="ui-title line-clamp-2 text-[0.98rem]"
                      >
                        {product.name}
                      </a>
                      {product.shortDescription && (
                        <p className="line-clamp-2 text-xs text-muted-foreground/88">
                          {product.shortDescription}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[1.02rem] font-semibold text-foreground">
                        {formatMoney(product.price.amount, product.price.currency)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="hidden sm:block">
              <div className="grid auto-rows-fr grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickAdd={(entry) => addProduct(entry.id)}
                    enableSharedTransition={enableSharedProductTransition}
                    isFavorite={favoriteProductIds.includes(product.id)}
                    onToggleFavorite={(entry) => toggleFavorite(entry.id)}
                  />
                ))}
              </div>
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}
