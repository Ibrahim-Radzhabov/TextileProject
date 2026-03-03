"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Badge, Button, ProductCard, ProductGallery, Surface } from "@store-platform/ui";
import type { Product } from "@store-platform/shared-types";
import { useCartStore } from "@/store/cart-store";
import { enableSharedProductTransition } from "@/lib/feature-flags";

type ProductPageClientProps = {
  product: Product;
  related: Product[];
  productPageTexts: Array<{
    id: string;
    content: string;
  }>;
};

function formatMoney(amount: number, currency: string): string {
  return amount.toLocaleString(undefined, {
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

export function ProductPageClient({
  product,
  related,
  productPageTexts
}: ProductPageClientProps) {
  const { addProduct, isPricing } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [addedPulse, setAddedPulse] = useState(false);
  const addPulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const priceFormatted = formatMoney(product.price.amount, product.price.currency);
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
    <div className="space-y-10 pb-10">
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
                    transition={{ duration: 0.35 }}
                    className="ui-title-serif text-3xl sm:text-4xl"
                  >
                    {product.name}
                  </motion.h1>
                ) : (
                  <h1 className="ui-title-serif text-3xl sm:text-4xl">{product.name}</h1>
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

              <div className="rounded-xl border border-border/45 bg-card/62 px-4 py-4">
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

                  {product.badges && product.badges.length > 0 && (
                    <div className="flex flex-wrap justify-end gap-1">
                      {product.badges.map((badge) => (
                        <Badge key={badge.id} tone="muted">{badge.label}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                <motion.div
                  initial={false}
                  animate={addedPulse ? { scale: [1, 1.01, 1] } : { scale: 1 }}
                  transition={{ duration: 0.32 }}
                  className="mt-3"
                >
                  <Button
                    fullWidth
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

      {related.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="ui-kicker">С этим сочетается</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {related.map((candidate) => (
              <div key={candidate.id} className="min-w-[220px] max-w-[240px] flex-1">
                <ProductCard product={candidate} onQuickAdd={(next) => void addProduct(next.id)} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
