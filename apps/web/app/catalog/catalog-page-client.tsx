"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductCard, transitionQuick } from "@store-platform/ui";
import type { PageConfig, Product } from "@store-platform/shared-types";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { enableSharedProductTransition } from "@/lib/feature-flags";
import { resolveCatalogViewPreset, type CatalogSort } from "@/lib/catalog-view-presets";
import { renderNonProductGridBlock } from "@/lib/page-block-renderers";
import { CatalogNeonFilter } from "@/components/catalog-neon-filter";

type CatalogPageClientProps = {
  page: PageConfig;
  products: Product[];
  allTags: string[];
};

type MiniRailKey = "all" | "new" | "bestsellers" | "day-night" | "blackout";

type MiniRailPreset = {
  key: MiniRailKey;
  label: string;
  description: string;
  predicate?: (product: Product) => boolean;
};

const sortOptions: Array<{ value: CatalogSort; label: string }> = [
  { value: "recommended", label: "Рекомендовано" },
  { value: "price_asc", label: "Цена ↑" },
  { value: "price_desc", label: "Цена ↓" },
  { value: "name_asc", label: "Название A-Z" },
  { value: "name_desc", label: "Название Z-A" }
];

const CURRENCY_LOCALE = "ru-RU";

const miniRailPresets: MiniRailPreset[] = [
  {
    key: "all",
    label: "Все позиции",
    description: "Весь каталог без дополнительных ограничений."
  },
  {
    key: "new",
    label: "Новинки",
    description: "Свежие поступления и новые фактуры.",
    predicate: (product) => (product.badges ?? []).some((badge) => badge.label.toLowerCase().includes("new"))
  },
  {
    key: "bestsellers",
    label: "Бестселлеры",
    description: "Самые востребованные позиции и флагманские модели.",
    predicate: (product) =>
      product.isFeatured || (product.badges ?? []).some((badge) => badge.label.toLowerCase().includes("best"))
  },
  {
    key: "day-night",
    label: "Day-Night",
    description: "Сценарии комбинированного света на день и вечер.",
    predicate: (product) => (product.tags ?? []).includes("day-night")
  },
  {
    key: "blackout",
    label: "Blackout",
    description: "Плотные решения для максимального затемнения.",
    predicate: (product) => (product.tags ?? []).includes("blackout")
  }
];

function isMiniRailKey(value: string | null): value is MiniRailKey {
  return miniRailPresets.some((preset) => preset.key === value);
}

function resolveMiniRailPreset(key: MiniRailKey): MiniRailPreset {
  return miniRailPresets.find((preset) => preset.key === key) ?? miniRailPresets[0];
}

function resolveTagFilters(rawValue: string | null, availableTags: string[]): string[] {
  if (!rawValue) {
    return [];
  }

  const availableTagSet = new Set(availableTags);
  return rawValue
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry, index, collection) => entry.length > 0 && availableTagSet.has(entry) && collection.indexOf(entry) === index);
}

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
  const queryTags = useMemo(
    () => resolveTagFilters(searchParams.get("tags"), allTags),
    [allTags, searchParams]
  );
  const queryTagsKey = queryTags.join("|");
  const initialMiniRailValue = searchParams.get("rail");
  const initialMiniRail: MiniRailKey = isMiniRailKey(initialMiniRailValue) ? initialMiniRailValue : "all";
  const [tagsFilter, setTagsFilter] = useState<string[]>(activePreset?.tags ?? queryTags);
  const [sort, setSort] = useState<CatalogSort>(activePreset?.sort ?? "recommended");
  const initialSearchValue = searchParams.get("q")?.trim() ?? "";
  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const [showTagFilters, setShowTagFilters] = useState(true);
  const [miniRail, setMiniRail] = useState<MiniRailKey>(initialMiniRail);
  const lastPresetKeyRef = useRef<string | null>(activePreset?.key ?? null);

  useEffect(() => {
    const nextPresetKey = activePreset?.key ?? null;
    if (lastPresetKeyRef.current === nextPresetKey) {
      if (!activePreset) {
        setTagsFilter((prev) => {
          if (prev.join("|") === queryTagsKey) {
            return prev;
          }

          return queryTags;
        });
      }
      return;
    }

    lastPresetKeyRef.current = nextPresetKey;
    if (activePreset) {
      setTagsFilter(activePreset.tags);
      setSort(activePreset.sort);
      return;
    }

    setTagsFilter(queryTags);
    setSort("recommended");
  }, [activePreset, queryTags, queryTagsKey]);

  useEffect(() => {
    const params = new URLSearchParams(searchParamsValue);
    const nextQuery = params.get("q")?.trim() ?? "";
    setSearchValue((prev) => (prev === nextQuery ? prev : nextQuery));
    const nextMiniRailValue = params.get("rail");
    const nextMiniRail: MiniRailKey = isMiniRailKey(nextMiniRailValue) ? nextMiniRailValue : "all";
    setMiniRail((prev) => (prev === nextMiniRail ? prev : nextMiniRail));

    if (params.get("open_filters") === "1") {
      setShowTagFilters(true);
    }
  }, [searchParamsValue]);

  const filteredProducts = useMemo(() => {
    const searchQuery = searchValue.trim().toLowerCase();
    const activeMiniRailPreset = resolveMiniRailPreset(miniRail);
    const filtered = products.filter((product) => {
      const tags = product.tags ?? [];

      if (tagsFilter.length > 0 && !tagsFilter.some((tag) => tags.includes(tag))) {
        return false;
      }

      if (activeMiniRailPreset.predicate && !activeMiniRailPreset.predicate(product)) {
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
  }, [miniRail, products, searchValue, sort, tagsFilter]);

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
    <div className="min-h-0 space-y-5 pb-10">
      <h1 className="sr-only">{page.title}</h1>

      <section className="space-y-3.5 rounded-md border border-border/34 bg-card/90 p-4 sm:space-y-4 sm:p-5">
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

        <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center sm:gap-3">
          <CatalogNeonFilter
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Поиск по названию, фактуре и тегам..."
            onFilterClick={() => setShowTagFilters((prev) => !prev)}
            filterActive={showTagFilters}
          />

          <label className="flex items-center gap-2 rounded-[10px] border border-border/36 bg-card/64 px-3 py-2 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
            <span className="ui-kicker whitespace-nowrap text-[10px]">Сортировать</span>
            <select
              aria-label="Сортировка каталога"
              value={sort}
              onChange={(event) => setSort(event.target.value as CatalogSort)}
              className="h-9 w-full rounded-[8px] border border-border/45 bg-input/86 px-2.5 text-sm text-foreground outline-none transition-all duration-[var(--motion-fast)] focus:border-border/80 focus:ring-1 focus:ring-ring/60"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

      </section>

      {page.blocks.map((block) => {
        if (block.type === "rich-text") {
          return null;
        }

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
            {block.title && (
              <header className="space-y-1.5">
                <h2 className="ui-title text-[1.45rem] sm:text-[1.7rem]">{block.title}</h2>
              </header>
            )}

            <div className="space-y-3 sm:hidden">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...transitionQuick, delay: 0.01 }}
                  className="rounded-[14px] border border-border/30 bg-card/94 p-3.5 shadow-soft-subtle"
                >
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.media[0]?.url}
                      alt={product.media[0]?.alt ?? product.name}
                      className="h-[6rem] w-[6rem] rounded-[10px] object-cover"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <a
                        href={`/product/${encodeURIComponent(product.slug)}`}
                        className="ui-title-serif line-clamp-2 text-[1.12rem] leading-[1.05] text-foreground"
                      >
                        {product.name}
                      </a>
                      {product.shortDescription && (
                        <p className="line-clamp-2 text-[0.82rem] leading-relaxed text-muted-foreground/78">
                          {product.shortDescription}
                        </p>
                      )}
                      <p className="text-[1rem] font-semibold tracking-tight text-foreground">
                        {formatMoney(product.price.amount, product.price.currency)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="hidden sm:block">
              <div className="grid auto-rows-fr grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-8 xl:grid-cols-4 xl:gap-x-6 xl:gap-y-9">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="editorial"
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
