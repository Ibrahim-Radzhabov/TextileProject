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

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickAdd }) => {
  const primaryImage = product.media[0];
  const productHref = `/product/${encodeURIComponent(product.slug)}`;
  const hasComparePrice =
    product.compareAtPrice &&
    product.compareAtPrice.currency === product.price.currency &&
    product.compareAtPrice.amount > product.price.amount;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      className="group h-full"
      data-testid={`product-card-${product.slug}`}
    >
      <Surface
        tone="subtle"
        className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface-soft"
      >
        <div className="relative overflow-hidden">
          <a
            href={productHref}
            aria-label={`Открыть товар ${product.name}`}
            className="absolute inset-0 z-10 rounded-none"
          />
          <div className="aspect-[4/3] overflow-hidden">
            {primaryImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryImage.url}
                alt={primaryImage.alt}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
            )}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/58 via-background/8 to-transparent opacity-0 transition-opacity duration-[var(--motion-normal)] group-hover:opacity-100" />
          {product.badges && product.badges.length > 0 && (
            <div className="pointer-events-none absolute left-3 top-3 z-20 flex gap-1">
              {product.badges.map((badge) => (
                <Badge key={badge.id} tone="accent">
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
          {onQuickAdd && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-3 px-3 pb-3 opacity-0 transition-all duration-[var(--motion-normal)] ease-out group-hover:translate-y-0 group-hover:opacity-100">
              <div className="pointer-events-auto space-y-2">
                <a
                  href={productHref}
                  className="inline-flex h-8 w-full items-center justify-center rounded-md border border-border/60 bg-surface-soft/90 px-2 text-xs text-foreground backdrop-blur-sm transition-colors hover:border-accent/55 hover:bg-surface-strong"
                >
                  Подробнее
                </a>
                <Button
                  size="sm"
                  fullWidth
                  data-testid={`quick-add-${product.slug}`}
                  onClick={() => onQuickAdd(product)}
                >
                  Быстрый заказ
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="relative z-20 flex flex-1 flex-col gap-2 px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <p className="line-clamp-1 text-sm font-semibold tracking-tight">
                {product.name}
              </p>
              {product.shortDescription && (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {product.shortDescription}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Price</p>
              <p className="text-sm font-semibold text-foreground">
                {product.price.amount.toLocaleString(undefined, {
                  style: "currency",
                  currency: product.price.currency
                })}
              </p>
              {hasComparePrice && product.compareAtPrice && (
                <p className="text-[11px] text-muted-foreground line-through">
                  {product.compareAtPrice.amount.toLocaleString(undefined, {
                    style: "currency",
                    currency: product.compareAtPrice.currency
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      </Surface>
    </motion.div>
  );
};
