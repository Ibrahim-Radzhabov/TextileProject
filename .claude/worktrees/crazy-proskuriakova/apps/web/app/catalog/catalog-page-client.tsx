"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductCard, transitionQuick } from "@store-platform/ui";
import type { PageConfig, Product } from "@store-platform/shared-types";
import { useCartStore } from "@/store/cart-store";
import { enableSharedProductTransition } from "@/lib/feature-flags";
import { resolveCatalogViewPreset, type CatalogSort } from "@/lib/catalog-view-presets";
import { renderNonProductGridBlock } from "@/lib/page-block-renderers";
/* CatalogNeonFilter removed — replaced with inline minimal search */

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

      <section className="space-y-4">
        {activePreset && (
          <div
            className="flex items-center justify-between gap-3 border-b border-border pb-4"
            data-testid="catalog-preset-banner"
          >
            <div className="space-y-1" data-testid={`catalog-preset-${activePreset.key}`}>
              <p className="text-sm font-medium text-foreground">{activePreset.label}</p>
              <p className="text-[12px] text-foreground/50">{activePreset.description}</p>
            </div>
            <button
              type="button"
              onClick={clearActivePreset}
              className="ui-button text-[11px] text-foreground/50 transition-colors hover:text-foreground"
              data-testid="catalog-preset-clear"
            >
              Сбросить
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 border-b border-foreground/10 pb-4">
          {/* Search input — minimal, borderless */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Поиск по названию, фактуре и тегам..."
              aria-label="Поиск товаров"
              className="w-full bg-transparent py-2 text-sm text-foreground placeholder:text-foreground/35 outline-none"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-xs tracking-[0.1em] uppercase text-foreground/40 transition-colors hover:text-foreground"
              >
                Очистить
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setShowTagFilters((prev) => !prev)}
            className={[
              "text-xs tracking-[0.1em] uppercase transition-colors",
              showTagFilters ? "text-foreground" : "text-foreground/50 hover:text-foreground"
            ].join(" ")}
          >
            Фильтры
          </button>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs tracking-[0.1em] uppercase text-foreground/50">Сортировать</span>
            <select
              aria-label="Сортировка каталога"
              value={sort}
              onChange={(event) => setSort(event.target.value as CatalogSort)}
              className="bg-transparent text-xs tracking-[0.06em] uppercase text-foreground outline-none cursor-pointer"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
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
            className="space-y-6"
          >
            {block.title && (
              <header>
                <h2 className="ui-title-display text-[clamp(1.5rem,3vw,2.5rem)]">{block.title}</h2>
              </header>
            )}

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="editorial"
                  enableSharedTransition={enableSharedProductTransition}
                />
              ))}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}
