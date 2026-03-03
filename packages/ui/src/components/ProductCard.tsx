"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Product } from "@store-platform/shared-types";
import { Button } from "./Button";
import { springSharedElement, springSnappy } from "../motion/presets";

export type ProductCardProps = {
  product: Product;
  onQuickAdd?: (product: Product) => void;
  enableSharedTransition?: boolean;
};

function formatMoney(amount: number, currency: string): string {
  return amount.toLocaleString(undefined, {
    style: "currency",
    currency
  });
}

function resolveMetadataValue(product: Product, preferredKeys: string[]): string | null {
  const metadata = product.metadata;
  if (!metadata) {
    return null;
  }

  const normalizedToOriginal = new Map<string, string>();
  for (const key of Object.keys(metadata)) {
    normalizedToOriginal.set(key.toLowerCase().trim(), key);
  }

  for (const preferredKey of preferredKeys) {
    const original = normalizedToOriginal.get(preferredKey.toLowerCase().trim());
    if (!original) {
      continue;
    }

    const rawValue = metadata[original];
    if (rawValue === undefined || rawValue === null) {
      continue;
    }
    return String(rawValue);
  }

  return null;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickAdd,
  enableSharedTransition = false
}) => {
  const prefersReducedMotion = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const spotlightRectRef = React.useRef<DOMRect | null>(null);
  const spotlightFrameRef = React.useRef<number | null>(null);
  const spotlightPositionRef = React.useRef({ x: 0, y: 0 });
  const primaryImage = product.media[0];
  const productHref = `/product/${encodeURIComponent(product.slug)}`;
  const sharedMediaLayoutId = enableSharedTransition ? `product-media-${product.id}` : undefined;
  const sharedTitleLayoutId = enableSharedTransition ? `product-title-${product.id}` : undefined;
  const titleId = `product-card-title-${product.id}`;
  const priceId = `product-card-price-${product.id}`;
  const hasComparePrice =
    product.compareAtPrice &&
    product.compareAtPrice.currency === product.price.currency &&
    product.compareAtPrice.amount > product.price.amount;
  const lightControl = resolveMetadataValue(product, ["Light control", "Затемнение"]);
  const fabric = resolveMetadataValue(product, ["Fabric", "Ткань", "Материал"]);
  const roomTag = (product.tags ?? []).find((tag) =>
    ["bedroom", "living-room", "office", "kids"].includes(tag)
  );

  const flushSpotlightPosition = () => {
    const root = rootRef.current;
    if (!root) {
      spotlightFrameRef.current = null;
      return;
    }

    root.style.setProperty("--spotlight-x", `${spotlightPositionRef.current.x}px`);
    root.style.setProperty("--spotlight-y", `${spotlightPositionRef.current.y}px`);
    spotlightFrameRef.current = null;
  };

  const handlePointerEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    spotlightRectRef.current = event.currentTarget.getBoundingClientRect();
  };

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = spotlightRectRef.current ?? event.currentTarget.getBoundingClientRect();
    spotlightRectRef.current = rect;
    spotlightPositionRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    if (spotlightFrameRef.current === null) {
      spotlightFrameRef.current = window.requestAnimationFrame(flushSpotlightPosition);
    }
  };

  const handlePointerLeave = () => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    root.style.setProperty("--spotlight-x", "50%");
    root.style.setProperty("--spotlight-y", "50%");
    spotlightRectRef.current = null;
    if (spotlightFrameRef.current !== null) {
      window.cancelAnimationFrame(spotlightFrameRef.current);
      spotlightFrameRef.current = null;
    }
  };

  React.useEffect(() => {
    return () => {
      if (spotlightFrameRef.current !== null) {
        window.cancelAnimationFrame(spotlightFrameRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      ref={rootRef}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      transition={springSnappy}
      onMouseEnter={handlePointerEnter}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className="group spotlight-card h-full"
      data-testid={`product-card-${product.slug}`}
    >
      <article className="relative flex h-full flex-col overflow-hidden rounded-[10px] bg-transparent">
        <div className="relative overflow-hidden">
          <a
            href={productHref}
            aria-label={`Открыть товар ${product.name}`}
            aria-describedby={`${titleId} ${priceId}`}
            className="absolute inset-0 z-10 rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />

          <div className="aspect-[4/5] overflow-hidden bg-card/20">
            {primaryImage && (
              <>
                {enableSharedTransition ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <motion.img
                    layoutId={sharedMediaLayoutId}
                    src={primaryImage.url}
                    alt={primaryImage.alt}
                    className="h-full w-full object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none group-hover:scale-[1.05] motion-reduce:scale-100"
                    transition={springSharedElement}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryImage.url}
                    alt={primaryImage.alt}
                    className="h-full w-full object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none group-hover:scale-[1.05] motion-reduce:scale-100"
                  />
                )}
              </>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background/48 via-background/20 to-transparent" />
          </div>

          {onQuickAdd && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-2 px-3 pb-3 opacity-0 transition-all duration-[var(--motion-normal)] ease-out motion-reduce:transition-none group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="pointer-events-auto rounded-[10px] border border-border/35 bg-card/66 p-2 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={productHref}
                    className="inline-flex h-8 items-center justify-center rounded-[8px] border border-border/50 px-2 text-xs text-muted-foreground transition-colors hover:border-border/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Подробнее
                  </a>
                  <Button
                    size="sm"
                    fullWidth
                    data-testid={`quick-add-${product.slug}`}
                    aria-label={`Добавить ${product.name} в корзину`}
                    onClick={() => onQuickAdd(product)}
                  >
                    В корзину
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative z-20 flex flex-1 flex-col gap-3 px-1 pb-1 pt-3 sm:px-2">
          <div className="space-y-1.5">
            {(roomTag || (product.badges && product.badges[0]?.label)) && (
              <p className="ui-kicker">
                {product.badges && product.badges[0]?.label ? product.badges[0].label : roomTag?.replace(/-/g, " ")}
              </p>
            )}
            {enableSharedTransition ? (
              <motion.p
                layoutId={sharedTitleLayoutId}
                id={titleId}
                className="ui-title line-clamp-1 text-[15px]"
                transition={springSharedElement}
              >
                {product.name}
              </motion.p>
            ) : (
              <p id={titleId} className="ui-title line-clamp-1 text-[15px]">{product.name}</p>
            )}
            {product.shortDescription && (
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground/95">{product.shortDescription}</p>
            )}
            {(fabric || lightControl || roomTag) && (
              <p className="ui-kicker text-[10px]">
                {roomTag ? `${roomTag.replace(/-/g, " ")} • ` : ""}
                {fabric ? `${fabric} • ` : ""}
                {lightControl ? `${lightControl} light control` : ""}
              </p>
            )}
          </div>

          <div className="mt-auto flex items-end justify-between gap-2">
            <div className="space-y-0.5">
              <p className="ui-kicker">Price</p>
              <p id={priceId} className="text-sm font-semibold text-foreground">
                {formatMoney(product.price.amount, product.price.currency)}
              </p>
              {hasComparePrice && product.compareAtPrice && (
                <p className="text-[11px] text-muted-foreground line-through">
                  {formatMoney(product.compareAtPrice.amount, product.compareAtPrice.currency)}
                </p>
              )}
            </div>
          </div>
        </div>
      </article>
    </motion.div>
  );
};
