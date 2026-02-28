import * as React from "react";
import { motion } from "framer-motion";
import type { Product } from "@store-platform/shared-types";
import { Button } from "./Button";
import { Surface } from "./Surface";

export type ProductCardProps = {
  product: Product;
  onQuickAdd?: (product: Product) => void;
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickAdd }) => {
  const primaryImage = product.media[0];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="group h-full"
      data-testid={`product-card-${product.slug}`}
    >
      <Surface className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-soft-subtle">
        <div className="relative overflow-hidden">
          <div className="aspect-[4/3] overflow-hidden">
            {primaryImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryImage.url}
                alt={primaryImage.alt}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
            )}
          </div>
          {product.badges && product.badges.length > 0 && (
            <div className="pointer-events-none absolute left-3 top-3 flex gap-1">
              {product.badges.map((badge) => (
                <span
                  key={badge.id}
                  className="rounded-full bg-accent-soft/70 px-2 py-0.5 text-[11px] font-medium text-accent"
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}
          {onQuickAdd && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full px-3 pb-3 transition-transform duration-300 ease-out group-hover:translate-y-0">
              <div className="pointer-events-auto">
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
        <div className="flex flex-1 flex-col gap-2 px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <p className="line-clamp-1 text-sm font-medium tracking-tight">
                {product.name}
              </p>
              {product.shortDescription && (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {product.shortDescription}
                </p>
              )}
            </div>
            <div className="text-right text-sm font-medium">
              {product.price.amount.toLocaleString(undefined, {
                style: "currency",
                currency: product.price.currency
              })}
            </div>
          </div>
        </div>
      </Surface>
    </motion.div>
  );
};
