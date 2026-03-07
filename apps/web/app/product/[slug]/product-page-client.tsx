"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Badge,
  Button,
  FavoriteToggleButton,
  ProductCard,
  ProductGallery,
  Surface,
  springSharedElement
} from "@store-platform/ui";
import type { Product } from "@store-platform/shared-types";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { enableSharedProductTransition } from "@/lib/feature-flags";

type ProductPageClientProps = {
  product: Product;
  related: Product[];
  productPageTexts: Array<{
    id: string;
    content: string;
  }>;
  sampleRequestHref: string;
};

const CURRENCY_LOCALE = "ru-RU";

function formatMoney(amount: number, currency: string): string {
  return amount.toLocaleString(CURRENCY_LOCALE, {
    style: "currency",
    currency
  });
}

function normalizeMetaLabel(label: string): string {
  return label
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeMetaKey(label: string): string {
  return label
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase();
}

function withSampleRequestSubject(href: string): string {
  if (!href.startsWith("mailto:")) {
    return href;
  }

  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}subject=Запрос%20образцов%20ткани`;
}

type ProductSwatch = {
  id: string;
  label: string;
  toneClass: string;
};

const swatchByTag: Record<string, { label: string; toneClass: string }> = {
  linen: { label: "Linen Sand", toneClass: "bg-[#cdbda9]" },
  jacquard: { label: "Jacquard Pearl", toneClass: "bg-[#d8d2c9]" },
  velvet: { label: "Velvet Graphite", toneClass: "bg-[#4e4944]" },
  blackout: { label: "Noir Blackout", toneClass: "bg-[#252729]" },
  sheer: { label: "Sheer Pearl", toneClass: "bg-[#f2efe8]" },
  tulle: { label: "Tulle Ivory", toneClass: "bg-[#ece7db]" },
  "day-night": { label: "Day-Night Mix", toneClass: "bg-[#9a866d]" }
};

const serviceHighlights = [
  {
    id: "swatches",
    title: "Образцы ткани",
    description: "Отправим подборку оттенков перед заказом."
  },
  {
    id: "consultation",
    title: "Консультация",
    description: "Поможем с шириной, складками и световым сценарием."
  },
  {
    id: "warranty",
    title: "Гарантия пошива",
    description: "Поддержка после установки и корректировка посадки."
  }
] as const;

function deriveSwatches(product: Product, fabricMeta: string | null): ProductSwatch[] {
  const resolved: ProductSwatch[] = [];
  const used = new Set<string>();
  const tags = product.tags ?? [];

  for (const tag of tags) {
    const preset = swatchByTag[tag];
    if (!preset || used.has(preset.label)) {
      continue;
    }

    used.add(preset.label);
    resolved.push({
      id: `swatch-${tag}`,
      label: preset.label,
      toneClass: preset.toneClass
    });
  }

  if (fabricMeta) {
    const normalized = fabricMeta.toLowerCase();
    for (const [tag, preset] of Object.entries(swatchByTag)) {
      if (!normalized.includes(tag) || used.has(preset.label)) {
        continue;
      }

      used.add(preset.label);
      resolved.push({
        id: `swatch-meta-${tag}`,
        label: preset.label,
        toneClass: preset.toneClass
      });
    }
  }

  if (resolved.length === 0) {
    resolved.push(
      { id: "swatch-default-ivory", label: "Soft Ivory", toneClass: "bg-[#ebe6dc]" },
      { id: "swatch-default-taupe", label: "Warm Taupe", toneClass: "bg-[#9f8d78]" }
    );
  }

  return resolved.slice(0, 4);
}

export function ProductPageClient({
  product,
  related,
  productPageTexts,
  sampleRequestHref
}: ProductPageClientProps) {
  const { addProduct, isPricing } = useCartStore();
  const favoriteProductIds = useFavoritesStore((state) => state.productIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleProduct);
  const isCurrentProductFavorite = favoriteProductIds.includes(product.id);
  const [isAdding, setIsAdding] = useState(false);
  const [addedPulse, setAddedPulse] = useState(false);
  const addPulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const priceFormatted = formatMoney(product.price.amount, product.price.currency);
  const productTitleId = `product-title-${product.id}`;
  const sharedMediaLayoutId = enableSharedProductTransition ? `product-media-${product.id}` : undefined;
  const sharedTitleLayoutId = enableSharedProductTransition ? `product-title-${product.id}` : undefined;
  const compareAtPrice = product.compareAtPrice;
  const hasComparePrice =
    !!compareAtPrice &&
    compareAtPrice.currency === product.price.currency &&
    compareAtPrice.amount > product.price.amount;

  const comparePriceFormatted = hasComparePrice
    ? formatMoney(compareAtPrice.amount, compareAtPrice.currency)
    : null;

  const discountPercent = hasComparePrice
    ? Math.round(((compareAtPrice.amount - product.price.amount) / compareAtPrice.amount) * 100)
    : null;

  const metadataEntries = useMemo(
    () =>
      Object.entries(product.metadata ?? {})
        .filter(([, value]) => typeof value === "string" || typeof value === "number" || typeof value === "boolean")
        .slice(0, 4)
        .map(([key, value]) => ({
          key,
          label: normalizeMetaLabel(key),
          value: String(value),
        })),
    [product.metadata]
  );
  const metadataLookup = useMemo(() => {
    const lookup = new Map<string, string>();
    for (const [key, value] of Object.entries(product.metadata ?? {})) {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        lookup.set(normalizeMetaKey(key), String(value));
      }
    }
    return lookup;
  }, [product.metadata]);
  const fabricMeta = metadataLookup.get("fabric") ?? metadataLookup.get("ткань") ?? null;
  const lightControlMeta = metadataLookup.get("light control") ?? metadataLookup.get("затемнение") ?? null;
  const panelWidthMeta = metadataLookup.get("width panel") ?? metadataLookup.get("ширина панели") ?? null;
  const swatches = useMemo(() => deriveSwatches(product, fabricMeta), [fabricMeta, product]);
  const panelWidthCm = useMemo(() => {
    if (!panelWidthMeta) {
      return null;
    }

    const match = panelWidthMeta.replace(",", ".").match(/(\d+(?:\.\d+)?)/);
    if (!match) {
      return null;
    }

    const parsed = Number.parseFloat(match[1]);
    return Number.isFinite(parsed) ? parsed : null;
  }, [panelWidthMeta]);
  const exampleCorniceWidthCm = 250;
  const recommendedTotalWidthCm = Math.round(exampleCorniceWidthCm * 2);
  const recommendedPanels =
    panelWidthCm && panelWidthCm > 0
      ? Math.max(2, Math.ceil(recommendedTotalWidthCm / panelWidthCm))
      : null;

  const productPageLead = productPageTexts[0]?.content;
  const productPageSupport = productPageTexts.slice(1);
  const sampleRequestActionHref = withSampleRequestSubject(sampleRequestHref);

  useEffect(() => {
    return () => {
      if (addPulseTimeoutRef.current) {
        clearTimeout(addPulseTimeoutRef.current);
      }
    };
  }, []);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addProduct(product.id);
      setAddedPulse(true);
      if (addPulseTimeoutRef.current) {
        clearTimeout(addPulseTimeoutRef.current);
      }
      addPulseTimeoutRef.current = setTimeout(() => {
        setAddedPulse(false);
      }, 1200);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-10 pb-[calc(10rem+env(safe-area-inset-bottom))] md:pb-10">
      <div className="grid gap-7 sm:gap-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-5"
        >
          <ProductGallery media={product.media} mainImageLayoutId={sharedMediaLayoutId} />

          {product.description && (
            <Surface tone="subtle" className="space-y-2 rounded-xl px-5 py-6 sm:px-6">
              <p className="ui-kicker">Описание</p>
              <p className="ui-subtle text-sm leading-relaxed">{product.description}</p>
            </Surface>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.04 }}
          className="space-y-6 md:sticky md:top-24 md:self-start"
        >
          <Surface tone="elevated" className="relative overflow-hidden rounded-xl px-5 py-6 sm:px-6">
            <div className="relative z-10 space-y-5">
              <header className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {product.isFeatured && <Badge tone="accent">Featured</Badge>}
                  {(product.tags ?? []).slice(0, 3).map((tag) => (
                    <Badge key={tag} tone="muted">#{tag}</Badge>
                  ))}
                </div>

                {sharedTitleLayoutId ? (
                  <motion.h1
                    layoutId={sharedTitleLayoutId}
                    transition={springSharedElement}
                    id={productTitleId}
                    className="ui-title-serif text-3xl sm:text-4xl"
                  >
                    {product.name}
                  </motion.h1>
                ) : (
                  <h1 id={productTitleId} className="ui-title-serif text-3xl sm:text-4xl">{product.name}</h1>
                )}

                {product.shortDescription && (
                  <p className="ui-subtle text-sm leading-relaxed sm:text-base">{product.shortDescription}</p>
                )}

                {productPageLead && (
                  <p className="ui-subtle rounded-xl border border-border/45 bg-card/52 px-4 py-3 text-sm leading-relaxed">
                    {productPageLead}
                  </p>
                )}
              </header>

              <div
                className="rounded-xl border border-border/45 bg-card/62 px-4 py-4"
                role="region"
                aria-label="Покупка товара"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="ui-kicker">Цена</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-2xl font-medium tracking-tight">{priceFormatted}</span>
                      {discountPercent && discountPercent > 0 && <Badge tone="muted">-{discountPercent}%</Badge>}
                    </div>
                    {comparePriceFormatted && (
                      <p className="mt-1 text-xs text-muted-foreground line-through">{comparePriceFormatted}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <FavoriteToggleButton
                      onClick={() => toggleFavorite(product.id)}
                      active={isCurrentProductFavorite}
                      addLabel={`Добавить ${product.name} в избранное`}
                      removeLabel={`Убрать ${product.name} из избранного`}
                      placement="inline"
                      testId="pdp-toggle-favorite"
                    />

                    {product.badges && product.badges.length > 0 && (
                      <div className="flex flex-wrap justify-end gap-1">
                        {product.badges.map((badge) => (
                          <Badge key={badge.id} tone="muted">{badge.label}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <motion.div
                  initial={false}
                  animate={addedPulse ? { scale: [1, 1.01, 1] } : { scale: 1 }}
                  transition={{ duration: 0.32 }}
                  className="mt-3"
                >
                  <Button
                    fullWidth
                    ripple
                    data-testid="pdp-add-to-cart"
                    aria-label={`Добавить ${product.name} в корзину`}
                    aria-busy={isAdding || isPricing}
                    onClick={() => {
                      void handleAddToCart();
                    }}
                    disabled={isAdding || isPricing}
                  >
                    {isAdding || isPricing ? "Добавление..." : "Добавить в корзину"}
                  </Button>
                </motion.div>
              </div>

              <div className="space-y-3 rounded-xl border border-border/45 bg-card/52 px-4 py-4">
                <div className="space-y-1">
                  <p className="ui-kicker">Подбор размера и плотности</p>
                  <p className="text-sm font-medium tracking-tight">Гайд для окна и карниза</p>
                </div>
                <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                  <li>Полнота складок: ориентир 1.8x-2.2x от ширины карниза.</li>
                  {panelWidthMeta && <li>Ширина одной панели: {panelWidthMeta}.</li>}
                  {lightControlMeta && <li>Уровень затемнения: {lightControlMeta}.</li>}
                  {fabricMeta && <li>Фактура: {fabricMeta}.</li>}
                  {recommendedPanels && (
                    <li>
                      Пример: для карниза {exampleCorniceWidthCm} см обычно нужно около {recommendedPanels} панелей.
                    </li>
                  )}
                </ul>
              </div>

              <div className="space-y-3 rounded-xl border border-border/45 bg-card/52 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="ui-kicker">Swatches</p>
                    <p className="text-sm font-medium tracking-tight">Образцы и оттенки ткани</p>
                    <p className="ui-subtle text-xs">Подберем оттенок к вашему интерьеру перед заказом.</p>
                  </div>
                  <a
                    href={sampleRequestActionHref}
                    className="inline-flex h-8 shrink-0 items-center rounded-[8px] border border-border/52 bg-card/70 px-2.5 text-xs font-medium transition-colors hover:border-border/70 hover:bg-card/90"
                  >
                    Запросить
                  </a>
                </div>
                <div className="flex flex-wrap gap-2">
                  {swatches.map((swatch) => (
                    <button
                      key={swatch.id}
                      type="button"
                      className="group inline-flex items-center gap-2 rounded-full border border-border/45 bg-card/78 px-2.5 py-1.5 text-xs transition-colors hover:border-border/70 hover:bg-card/92"
                      aria-label={`Образец ${swatch.label}`}
                    >
                      <span className={`h-4 w-4 rounded-full border border-border/55 ${swatch.toneClass}`} aria-hidden="true" />
                      <span className="text-foreground/88">{swatch.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-3">
                {serviceHighlights.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border/42 bg-card/52 px-3.5 py-3"
                  >
                    <p className="ui-kicker">{item.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>

              {metadataEntries.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {metadataEntries.map((entry) => (
                    <div
                      key={entry.key}
                      className="rounded-xl border border-border/45 bg-card/55 px-3 py-2.5"
                    >
                      <p className="ui-kicker">{entry.label}</p>
                      <p className="mt-1 text-xs font-medium text-foreground">{entry.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {productPageSupport.length > 0 && (
                <div className="space-y-2 rounded-xl border border-border/45 bg-card/52 px-4 py-4">
                  {productPageSupport.map((text) => (
                    <p key={text.id} className="ui-subtle text-xs leading-relaxed sm:text-sm">
                      {text.content}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </Surface>
        </motion.div>
      </div>

      <motion.div
        className="fixed inset-x-3 bottom-[calc(4.4rem+env(safe-area-inset-bottom))] z-40 rounded-[12px] border border-border/48 bg-card/94 p-2.5 shadow-soft backdrop-blur-xl md:hidden"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.08 }}
      >
        <div className="flex items-center gap-2.5">
          <div className="min-w-0">
            <p className="ui-kicker">Итого</p>
            <p className="text-[1rem] font-semibold tracking-tight text-foreground">{priceFormatted}</p>
            {comparePriceFormatted && (
              <p className="text-[11px] text-muted-foreground line-through">{comparePriceFormatted}</p>
            )}
          </div>
          <Button
            fullWidth
            size="sm"
            ripple
            className="h-11 flex-1 rounded-[8px]"
            aria-label={`Добавить ${product.name} в корзину`}
            aria-busy={isAdding || isPricing}
            onClick={() => {
              void handleAddToCart();
            }}
            disabled={isAdding || isPricing}
          >
            {isAdding || isPricing ? "Добавление..." : "В корзину"}
          </Button>
        </div>
      </motion.div>

      {related.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="ui-kicker">С этим сочетается</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {related.map((candidate) => (
              <div key={candidate.id} className="min-w-[220px] max-w-[240px] flex-1">
                <ProductCard
                  product={candidate}
                  onQuickAdd={(next) => void addProduct(next.id)}
                  isFavorite={favoriteProductIds.includes(candidate.id)}
                  onToggleFavorite={(next) => toggleFavorite(next.id)}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
