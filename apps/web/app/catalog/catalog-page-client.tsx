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

type CategoryGroup = {
  title: string;
  tagMatchers: string[];
  products: Product[];
};

function groupProductsByCategory(products: Product[]): CategoryGroup[] {
  const categories: Array<{ title: string; tagMatchers: string[] }> = [
    { title: "Портьеры и шторы", tagMatchers: ["curtain", "blackout"] },
    { title: "Тюли и гардины", tagMatchers: ["tulle", "sheer", "voile", "organza", "batiste", "lace"] },
    { title: "Текстиль для интерьера", tagMatchers: ["throw", "cashmere", "jute", "burlap"] }
  ];

  const groups: CategoryGroup[] = categories.map((c) => ({ ...c, products: [] }));
  const other: Product[] = [];

  for (const product of products) {
    const tags = product.tags ?? [];
    let placed = false;
    for (const group of groups) {
      if (group.tagMatchers.some((t) => tags.includes(t))) {
        group.products.push(product);
        placed = true;
        break;
      }
    }
    if (!placed) {
      other.push(product);
    }
  }

  if (other.length > 0) {
    groups.push({ title: "Другое", tagMatchers: [], products: other });
  }

  return groups.filter((g) => g.products.length > 0);
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

      <section className="space-y-4 border-b border-border/20 pb-6">
        {activePreset && (
          <div
            className="flex items-center justify-between gap-3 py-2"
            data-testid="catalog-preset-banner"
          >
            <div className="space-y-0.5" data-testid={`catalog-preset-${activePreset.key}`}>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{activePreset.label}</p>
              <p className="text-xs text-muted-foreground/70">{activePreset.description}</p>
            </div>
            <button
              type="button"
              onClick={clearActivePreset}
              className="text-[11px] uppercase tracking-[0.1em] text-foreground/60 transition-colors hover:text-foreground"
              data-testid="catalog-preset-clear"
            >
              Сбросить
            </button>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center">
          <CatalogNeonFilter
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Поиск по названию, фактуре и тегам..."
            onFilterClick={() => setShowTagFilters((prev) => !prev)}
            filterActive={showTagFilters}
          />

          <select
            aria-label="Сортировка каталога"
            value={sort}
            onChange={(event) => setSort(event.target.value as CatalogSort)}
            className="h-10 w-full border-b border-border/30 bg-transparent px-0 text-[11px] uppercase tracking-[0.1em] text-foreground/80 outline-none transition-colors focus:border-foreground/40"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {showTagFilters && allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {allTags.map((tag) => {
              const active = tagsFilter.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setTagsFilter((prev) =>
                      active ? prev.filter((t) => t !== tag) : [...prev, tag]
                    )
                  }
                  className={[
                    "rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition-colors",
                    active
                      ? "border-foreground/30 bg-foreground text-background"
                      : "border-border/40 bg-card/60 text-foreground/70 hover:border-foreground/20 hover:text-foreground"
                  ].join(" ")}
                >
                  {tag}
                </button>
              );
            })}
            {tagsFilter.length > 0 && (
              <button
                type="button"
                onClick={() => setTagsFilter([])}
                className="rounded-full border border-border/40 px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
              >
                Сбросить
              </button>
            )}
          </div>
        )}
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
            className="space-y-6 pt-2"
          >
            {block.title && (
              <h2 className="font-serif text-[1.3rem] font-normal tracking-tight sm:text-[1.5rem]">{block.title}</h2>
            )}

            {/* Mobile + Desktop: grouped by category */}
            <div className="space-y-10">
              {groupProductsByCategory(filteredProducts).map((group) => (
                <div key={group.title} className="space-y-4">
                  <h3 className="text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    {group.title}
                    <span className="ml-2 text-[11px] text-muted-foreground/60">
                      {group.products.length}
                    </span>
                  </h3>

                  {/* Mobile: compact list */}
                  <div className="space-y-4 sm:hidden">
                    {group.products.map((product) => (
                      <a
                        key={product.id}
                        href={`/product/${encodeURIComponent(product.slug)}`}
                        className="flex items-center gap-4 border-b border-border/15 pb-4 last:border-0"
                      >
                        <div className="h-20 w-20 shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.media[0]?.url}
                            alt={product.media[0]?.alt ?? product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="font-serif text-[0.95rem] leading-tight text-foreground">
                            {product.name}
                          </p>
                          <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                            {formatMoney(product.price.amount, product.price.currency)}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>

                  {/* Desktop: editorial grid */}
                  <div className="hidden sm:block">
                    <div className="grid auto-rows-fr grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-3 xl:grid-cols-3 xl:gap-x-6 xl:gap-y-10">
                      {group.products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          variant="editorial"
                          onQuickAdd={(entry) => addProduct(entry.id)}
                          enableSharedTransition={enableSharedProductTransition}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}
