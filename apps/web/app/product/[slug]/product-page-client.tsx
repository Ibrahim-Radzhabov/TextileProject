"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Badge, Button, ProductCard, ProductGallery, Surface } from "@store-platform/ui";
import type { Product } from "@store-platform/shared-types";
import { useCartStore } from "@/store/cart-store";

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
    currency,
  });
}

function normalizeMetaLabel(label: string): string {
  return label
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ProductPageClient({
  product,
  related,
  productPageTexts,
}: ProductPageClientProps) {
  const { addProduct, isPricing } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [addedPulse, setAddedPulse] = useState(false);
  const addPulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const priceFormatted = formatMoney(product.price.amount, product.price.currency);
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
    <div className="space-y-10 pb-8">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <ProductGallery media={product.media} />

          {product.description && (
            <Surface tone="subtle" className="space-y-2 px-4 py-4 sm:px-5">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Описание</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            </Surface>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.04 }}
          className="space-y-5 md:sticky md:top-20 md:self-start"
        >
          <Surface tone="elevated" className="relative overflow-hidden px-4 py-5 sm:px-5 sm:py-6">
            <div className="pointer-events-none absolute inset-0 opacity-75">
              <div className="absolute -right-12 top-[-4rem] h-52 w-52 rounded-full bg-accent/25 blur-3xl" />
              <div className="absolute -left-8 bottom-[-5rem] h-52 w-52 rounded-full bg-foreground/10 blur-3xl" />
            </div>

            <div className="relative z-10 space-y-5">
              <header className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {product.isFeatured && <Badge tone="accent">Featured</Badge>}
                  {(product.tags ?? []).slice(0, 3).map((tag) => (
                    <Badge key={tag} tone="muted">#{tag}</Badge>
                  ))}
                </div>

                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>

                {product.shortDescription && (
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{product.shortDescription}</p>
                )}

                {productPageLead && (
                  <p className="rounded-xl border border-border/55 bg-card/35 px-3 py-2.5 text-sm leading-relaxed text-muted-foreground">
                    {productPageLead}
                  </p>
                )}
              </header>

              <div className="rounded-2xl border border-border/60 bg-card/40 px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Цена</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-2xl font-semibold tracking-tight">{priceFormatted}</span>
                      {discountPercent && discountPercent > 0 && <Badge tone="accent">-{discountPercent}%</Badge>}
                    </div>
                    {comparePriceFormatted && (
                      <p className="mt-1 text-xs text-muted-foreground line-through">{comparePriceFormatted}</p>
                    )}
                  </div>

                  {product.badges && product.badges.length > 0 && (
                    <div className="flex flex-wrap justify-end gap-1">
                      {product.badges.map((badge) => (
                        <Badge key={badge.id} tone="accent">{badge.label}</Badge>
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

              {metadataEntries.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {metadataEntries.map((entry) => (
                    <div
                      key={entry.key}
                      className="rounded-xl border border-border/50 bg-surface-soft/75 px-3 py-2"
                    >
                      <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{entry.label}</p>
                      <p className="mt-1 text-xs font-medium text-foreground">{entry.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {productPageSupport.length > 0 && (
                <div className="space-y-2 rounded-xl border border-border/50 bg-surface-soft/65 px-3 py-3">
                  {productPageSupport.map((text) => (
                    <p key={text.id} className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
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
            <h2 className="text-sm font-medium tracking-tight text-muted-foreground">С этим сочетается</h2>
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
