"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Badge,
  Button,
  FavoriteToggleButton,
  ProductCard,
  Surface,
  springSharedElement
} from "@store-platform/ui";
import type { Product } from "@store-platform/shared-types";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { enableSharedProductTransition } from "@/lib/feature-flags";
import ProductGalleryLightbox from "./product-gallery-lightbox";

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

type ProductColorOption = {
  id: string;
  label: string;
  tone: string;
  mediaIds: string[];
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

const colorToneClassByKey: Record<string, string> = {
  ivory: "bg-[#ebe6dc]",
  pearl: "bg-[#ede6d9]",
  linen: "bg-[#d5c6ad]",
  sand: "bg-[#c4b296]",
  taupe: "bg-[#9f8d78]",
  graphite: "bg-[#5a544e]",
  noir: "bg-[#272626]",
  black: "bg-[#1f1f1f]",
  white: "bg-[#f3efe7]",
};

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

function parseColorOptions(product: Product): ProductColorOption[] {
  const rawColorOptions = product.metadata?.colorOptions;
  if (!Array.isArray(rawColorOptions)) {
    return [];
  }

  const options: ProductColorOption[] = [];

  for (const rawOption of rawColorOptions) {
    if (!rawOption || Array.isArray(rawOption) || typeof rawOption !== "object") {
      continue;
    }

    const id = typeof rawOption.id === "string" ? rawOption.id.trim() : "";
    const label = typeof rawOption.label === "string" ? rawOption.label.trim() : "";
    const tone = typeof rawOption.tone === "string" ? rawOption.tone.trim().toLowerCase() : "";
    const mediaIds = Array.isArray(rawOption.mediaIds)
      ? rawOption.mediaIds
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.trim())
          .filter(Boolean)
      : [];

    if (!id || !label || !tone || mediaIds.length === 0) {
      continue;
    }

    options.push({ id, label, tone, mediaIds });
  }

  return options;
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
  const [isLeadExpanded, setIsLeadExpanded] = useState(false);
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
  const mediaLookup = useMemo(
    () => new Map(product.media.map((item) => [item.id, item])),
    [product.media]
  );
  const colorOptions = useMemo(() => parseColorOptions(product), [product]);
  const resolvedColorOptions = useMemo(() => {
    return colorOptions
      .map((option) => {
        const mediaIds = option.mediaIds.filter((mediaId) => mediaLookup.has(mediaId));
        return mediaIds.length > 0 ? { ...option, mediaIds } : null;
      })
      .filter((option): option is ProductColorOption => option !== null);
  }, [colorOptions, mediaLookup]);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(
    resolvedColorOptions[0]?.id ?? null
  );
  const selectedColorOption = useMemo(() => {
    if (resolvedColorOptions.length === 0) {
      return null;
    }

    return (
      resolvedColorOptions.find((option) => option.id === selectedColorId) ?? resolvedColorOptions[0]
    );
  }, [resolvedColorOptions, selectedColorId]);
  const selectedColorMedia = useMemo(() => {
    if (!selectedColorOption) {
      return product.media;
    }

    const selectedMedia = selectedColorOption.mediaIds
      .map((mediaId) => mediaLookup.get(mediaId))
      .filter((item): item is Product["media"][number] => Boolean(item));
    return selectedMedia.length > 0 ? selectedMedia : product.media;
  }, [selectedColorOption, mediaLookup, product.media]);
  const galleryMedia = useMemo(() => {
    if (!selectedColorOption) {
      return product.media;
    }

    if (selectedColorMedia.length > 1) {
      return selectedColorMedia;
    }

    if (selectedColorMedia.length === 1) {
      const leadMedia = selectedColorMedia[0];
      const fallbackMedia = product.media.filter((item) => item.id !== leadMedia.id);
      return [leadMedia, ...fallbackMedia];
    }

    return product.media;
  }, [selectedColorOption, product.media, selectedColorMedia]);
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
  const compositionMeta =
    fabricMeta ??
    metadataLookup.get("composition") ??
    metadataLookup.get("состав") ??
    metadataLookup.get("material") ??
    null;
  const leadSource = productPageLead ?? product.description ?? product.shortDescription ?? "";
  const leadIsCollapsible = leadSource.length > 220;
  const leadPreview = leadIsCollapsible ? `${leadSource.slice(0, 220).trimEnd()}…` : leadSource;

  useEffect(() => {
    if (resolvedColorOptions.length === 0) {
      if (selectedColorId !== null) {
        setSelectedColorId(null);
      }
      return;
    }

    if (!selectedColorId || !resolvedColorOptions.some((option) => option.id === selectedColorId)) {
      setSelectedColorId(resolvedColorOptions[0].id);
    }
  }, [resolvedColorOptions, selectedColorId]);

  useEffect(() => {
    return () => {
      if (addPulseTimeoutRef.current) {
        clearTimeout(addPulseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setIsLeadExpanded(false);
  }, [leadSource]);

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
    <div className="space-y-8 pb-[calc(10.75rem+env(safe-area-inset-bottom))] md:relative md:left-1/2 md:w-[min(1520px,calc(100vw-2rem))] md:-translate-x-1/2 md:space-y-10 md:pb-10 lg:w-[min(1560px,calc(100vw-3rem))]">
      <div className="grid gap-7 sm:gap-8 md:grid-cols-[minmax(0,1fr)_21.5rem] md:gap-2 lg:gap-3 xl:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-4 md:space-y-0"
        >
          <ProductGalleryLightbox
            key={`${product.id}:${selectedColorOption?.id ?? "default"}`}
            media={galleryMedia}
            mainImageLayoutId={sharedMediaLayoutId}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.04 }}
          className="space-y-5 md:sticky md:top-24 md:w-full md:max-w-[21.5rem] md:justify-self-end md:self-start md:space-y-6"
        >
          <Surface
            tone="subtle"
            className="relative overflow-hidden rounded-[18px] border-border/24 bg-card/72 px-4 py-5 shadow-none sm:px-6 sm:py-6 md:rounded-[14px]"
          >
            <div className="relative z-10 space-y-5">
              <header className="space-y-3.5 pb-1 md:space-y-4 md:pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    {sharedTitleLayoutId ? (
                      <motion.h1
                        layoutId={sharedTitleLayoutId}
                        transition={springSharedElement}
                        id={productTitleId}
                        className="ui-title-serif text-[2rem] leading-none sm:text-4xl"
                      >
                        {product.name}
                      </motion.h1>
                    ) : (
                      <h1 id={productTitleId} className="ui-title-serif text-[2rem] leading-none sm:text-4xl">{product.name}</h1>
                    )}
                    {product.shortDescription && (
                      <p className="ui-subtle text-sm leading-relaxed sm:text-base">{product.shortDescription}</p>
                    )}
                    {compositionMeta && (
                      <p className="ui-kicker text-[11px] text-muted-foreground/90">{compositionMeta}</p>
                    )}
                  </div>

                  <FavoriteToggleButton
                    onClick={() => toggleFavorite(product.id)}
                    active={isCurrentProductFavorite}
                    addLabel={`Добавить ${product.name} в избранное`}
                    removeLabel={`Убрать ${product.name} из избранного`}
                    placement="inline"
                    testId="pdp-toggle-favorite"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-medium tracking-tight">{priceFormatted}</span>
                    {discountPercent && discountPercent > 0 && <Badge tone="muted">-{discountPercent}%</Badge>}
                  </div>
                  {comparePriceFormatted && (
                    <p className="mt-1 text-xs text-muted-foreground line-through">{comparePriceFormatted}</p>
                  )}
                </div>

                {product.badges && product.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {product.badges.map((badge) => (
                      <Badge key={badge.id} tone="muted">{badge.label}</Badge>
                    ))}
                  </div>
                )}
              </header>

              <section
                className="space-y-4 border-t border-border/42 pt-4"
                role="region"
                aria-label="Покупка товара"
              >
                {resolvedColorOptions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="ui-kicker">Цвет</p>
                      {selectedColorOption && (
                        <p className="text-xs text-muted-foreground">{selectedColorOption.label}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {resolvedColorOptions.map((option) => {
                        const isActive = selectedColorOption?.id === option.id;
                        const toneClass = colorToneClassByKey[option.tone] ?? "bg-card";

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedColorId(option.id)}
                            className={[
                              "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors md:h-9 md:w-9",
                              isActive
                                ? "border-foreground/38 bg-card/90"
                                : "border-border/35 bg-card/52 hover:border-border/62"
                            ].join(" ")}
                            aria-pressed={isActive}
                            aria-label={`Выбрать цвет ${option.label}`}
                          >
                            <span
                              className={[
                                "h-[18px] w-[18px] rounded-full border border-border/55 md:h-4 md:w-4",
                                toneClass
                              ].join(" ")}
                              aria-hidden="true"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {resolvedColorOptions.length === 0 && swatches.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="ui-kicker">Оттенки</p>
                    <div className="flex flex-wrap gap-2">
                      {swatches.map((swatch) => (
                        <span
                          key={swatch.id}
                          className="inline-flex items-center gap-2 rounded-full border border-border/45 bg-card/70 px-2.5 py-1 text-xs text-foreground/88"
                        >
                          <span className={`h-3.5 w-3.5 rounded-full border border-border/55 ${swatch.toneClass}`} aria-hidden="true" />
                          <span>{swatch.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <motion.div
                  initial={false}
                  animate={addedPulse ? { scale: [1, 1.01, 1] } : { scale: 1 }}
                  transition={{ duration: 0.32 }}
                  className="pt-1"
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
              </section>

              <section className="space-y-2 border-t border-border/42 pt-4">
                <p className="ui-kicker">Сервис</p>
                <a
                  href={sampleRequestActionHref}
                  className="inline-flex items-center gap-2 text-sm underline decoration-border/70 underline-offset-4 transition-colors hover:text-foreground/80"
                >
                  Запросить образцы ткани
                </a>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Консультация по посадке, светопропусканию и размеру карниза.
                </p>
              </section>

              {leadSource && (
                <section className="space-y-2 border-t border-border/42 pt-4">
                  <p className="ui-kicker">Описание</p>
                  <p className="ui-subtle text-sm leading-relaxed">
                    {isLeadExpanded ? leadSource : leadPreview}
                  </p>
                  {leadIsCollapsible && (
                    <button
                      type="button"
                      className="text-xs font-medium text-muted-foreground underline decoration-border/70 underline-offset-4 transition-colors hover:text-foreground"
                      onClick={() => setIsLeadExpanded((value) => !value)}
                    >
                      {isLeadExpanded ? "Свернуть" : "Читать дальше"}
                    </button>
                  )}
                </section>
              )}

              <section
                className="overflow-hidden border-t border-border/42 pt-1 [&_summary::-webkit-details-marker]:hidden"
                aria-label="Дополнительная информация"
              >
                <details open className="border-b border-border/38">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-medium">
                    Детали изделия
                    <span aria-hidden="true" className="text-xs text-muted-foreground">▾</span>
                  </summary>
                  <div className="space-y-2 pb-4">
                    {metadataEntries.length > 0 ? (
                      metadataEntries.map((entry) => (
                        <div key={entry.key} className="flex items-start justify-between gap-3 text-sm">
                          <span className="text-muted-foreground">{entry.label}</span>
                          <span className="text-right text-foreground">{entry.value}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Точные параметры добавляются перед запуском коллекции.</p>
                    )}
                  </div>
                </details>

                <details className="border-b border-border/38">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-medium">
                    Размер и посадка
                    <span aria-hidden="true" className="text-xs text-muted-foreground">▾</span>
                  </summary>
                  <div className="space-y-2 pb-4 text-sm leading-relaxed text-muted-foreground">
                    <p>Полнота складок: ориентир 1.8x-2.2x от ширины карниза.</p>
                    {panelWidthMeta && <p>Ширина одной панели: {panelWidthMeta}.</p>}
                    {lightControlMeta && <p>Уровень затемнения: {lightControlMeta}.</p>}
                    {recommendedPanels && (
                      <p>
                        Пример: для карниза {exampleCorniceWidthCm} см обычно нужно около {recommendedPanels} панелей.
                      </p>
                    )}
                  </div>
                </details>

                <details className="border-b border-border/38">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-medium">
                    Доставка и оплата
                    <span aria-hidden="true" className="text-xs text-muted-foreground">▾</span>
                  </summary>
                  <div className="space-y-2 pb-4 text-sm leading-relaxed text-muted-foreground">
                    <p>Отправка в течение 1-3 рабочих дней после подтверждения заказа.</p>
                    <p>Оплата банковской картой, по счету или через персонального менеджера.</p>
                  </div>
                </details>

                <details>
                  <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-medium">
                    Возврат и поддержка
                    <span aria-hidden="true" className="text-xs text-muted-foreground">▾</span>
                  </summary>
                  <div className="space-y-2 pb-4 text-sm leading-relaxed text-muted-foreground">
                    <p>Возврат готовых изделий в течение 14 дней, при сохранении товарного вида.</p>
                    {productPageSupport.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {productPageSupport.map((text) => (
                          <p key={text.id}>{text.content}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              </section>
            </div>
          </Surface>
        </motion.div>
      </div>

      <motion.div
        className="fixed inset-x-3 bottom-[calc(4.55rem+env(safe-area-inset-bottom))] z-40 rounded-[16px] border border-border/48 bg-card/94 px-3 py-3 shadow-soft backdrop-blur-xl md:hidden"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.08 }}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-[11px] uppercase tracking-[0.16em] text-muted-foreground/80">
              {product.name}
            </p>
            <p className="ui-kicker">Итого</p>
            <p className="text-[1.05rem] font-semibold tracking-tight text-foreground">{priceFormatted}</p>
            {comparePriceFormatted && (
              <p className="text-[11px] text-muted-foreground line-through">{comparePriceFormatted}</p>
            )}
          </div>
          <Button
            fullWidth
            size="sm"
            ripple
            className="h-12 flex-1 rounded-[10px] px-4"
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
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
