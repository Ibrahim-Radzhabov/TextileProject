"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { Product } from "@store-platform/shared-types";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Surface } from "./Surface";

export type ProductCardProps = {
  product: Product;
  onQuickAdd?: (product: Product) => void;
};

function formatMoney(amount: number, currency: string): string {
  return amount.toLocaleString(undefined, {
    style: "currency",
    currency
  });
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickAdd }) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const primaryImage = product.media[0];
  const productHref = `/product/${encodeURIComponent(product.slug)}`;
  const hasComparePrice =
    product.compareAtPrice &&
    product.compareAtPrice.currency === product.price.currency &&
    product.compareAtPrice.amount > product.price.amount;

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const rect = root.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    root.style.setProperty("--spotlight-x", `${x}px`);
    root.style.setProperty("--spotlight-y", `${y}px`);
  };

  const handlePointerLeave = () => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    root.style.setProperty("--spotlight-x", "50%");
    root.style.setProperty("--spotlight-y", "50%");
  };

  return (
    <motion.div
      ref={rootRef}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className="group spotlight-card h-full"
      data-testid={`product-card-${product.slug}`}
    >
      <Surface tone="subtle" className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border/45 bg-card/80">
        <div className="relative overflow-hidden border-b border-border/35">
          <a
            href={productHref}
            aria-label={`Открыть товар ${product.name}`}
            className="absolute inset-0 z-10 rounded-none"
          />

          <div className="aspect-[4/5] overflow-hidden bg-card/40">
            {primaryImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryImage.url}
                alt={primaryImage.alt}
                className="h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.04]"
              />
            )}
          </div>

          {product.badges && product.badges.length > 0 && (
            <div className="pointer-events-none absolute left-3 top-3 z-20 flex gap-1">
              {product.badges.map((badge) => (
                <Badge key={badge.id} tone="muted">
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}

          {onQuickAdd && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-2 px-3 pb-3 opacity-0 transition-all duration-[var(--motion-normal)] ease-out group-hover:translate-y-0 group-hover:opacity-100">
              <div className="pointer-events-auto rounded-[10px] border border-border/45 bg-card/72 p-2 backdrop-blur-md">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={productHref}
                    className="inline-flex h-8 items-center justify-center rounded-[8px] border border-border/50 px-2 text-xs text-muted-foreground transition-colors hover:border-border/70 hover:text-foreground"
                  >
                    Подробнее
                  </a>
                  <Button
                    size="sm"
                    fullWidth
                    data-testid={`quick-add-${product.slug}`}
                    onClick={() => onQuickAdd(product)}
                  >
                    В корзину
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative z-20 flex flex-1 flex-col gap-3 px-4 py-4">
          <div className="space-y-1">
            <p className="line-clamp-1 text-sm font-medium tracking-tight">{product.name}</p>
            {product.shortDescription && (
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{product.shortDescription}</p>
            )}
          </div>

          <div className="mt-auto flex items-end justify-between gap-2">
            <div className="space-y-0.5">
              <p className="ui-kicker">Price</p>
              <p className="text-sm font-semibold text-foreground">
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
      </Surface>
    </motion.div>
  );
};
