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
  isFavorite?: boolean;
  onToggleFavorite?: (product: Product) => void;
};

const CURRENCY_LOCALE = "ru-RU";

function formatMoney(amount: number, currency: string): string {
  return amount.toLocaleString(CURRENCY_LOCALE, {
    style: "currency",
    currency
  });
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickAdd,
  enableSharedTransition = false,
  isFavorite = false,
  onToggleFavorite
}) => {
  const prefersReducedMotion = useReducedMotion();
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
  const roomTag = (product.tags ?? []).find((tag) => ["bedroom", "living-room", "office", "kids"].includes(tag));
  const overline = product.badges?.[0]?.label ?? roomTag?.replace(/-/g, " ");

  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      transition={springSnappy}
      className="group h-full"
      data-testid={`product-card-${product.slug}`}
    >
      <article className="relative flex h-full flex-col overflow-hidden rounded-[8px] border border-border/32 bg-card/92">
        <div className="relative overflow-hidden">
          <a
            href={productHref}
            aria-label={`Открыть товар ${product.name}`}
            aria-describedby={`${titleId} ${priceId}`}
            className="absolute inset-0 z-10 rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleFavorite(product);
              }}
              aria-label={isFavorite ? `Убрать ${product.name} из избранного` : `Добавить ${product.name} в избранное`}
              className={[
                "absolute right-2 top-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:right-2.5 sm:top-2.5",
                isFavorite
                  ? "border-border/75 bg-card/88 text-foreground"
                  : "border-border/55 bg-card/72 text-muted-foreground hover:border-border/70 hover:text-foreground"
              ].join(" ")}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
                fill={isFavorite ? "currentColor" : "none"}
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 20.2C8.8 17.7 5 14.6 5 10.6C5 8.4 6.7 6.8 8.8 6.8C10.1 6.8 11.3 7.4 12 8.4C12.7 7.4 13.9 6.8 15.2 6.8C17.3 6.8 19 8.4 19 10.6C19 14.6 15.2 17.7 12 20.2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          <div className="aspect-[4/5] overflow-hidden bg-muted/20">
            {primaryImage && (
              <>
                {enableSharedTransition ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <motion.img
                    layoutId={sharedMediaLayoutId}
                    src={primaryImage.url}
                    alt={primaryImage.alt}
                    className="h-full w-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none group-hover:scale-[1.03] motion-reduce:scale-100"
                    transition={springSharedElement}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryImage.url}
                    alt={primaryImage.alt}
                    className="h-full w-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none group-hover:scale-[1.03] motion-reduce:scale-100"
                  />
                )}
              </>
            )}
          </div>
        </div>

        <div className="relative z-20 flex flex-1 flex-col gap-2.5 p-3 sm:p-3.5">
          <div className="space-y-1.5">
            {overline && (
              <p className="ui-kicker text-muted-foreground/78">
                {overline}
              </p>
            )}
            {enableSharedTransition ? (
              <motion.p
                layoutId={sharedTitleLayoutId}
                id={titleId}
                className="ui-title line-clamp-1 text-[1.04rem]"
                transition={springSharedElement}
              >
                {product.name}
              </motion.p>
            ) : (
              <p id={titleId} className="ui-title line-clamp-1 text-[1.04rem]">{product.name}</p>
            )}
            {product.shortDescription && (
              <p className="line-clamp-2 text-[0.88rem] leading-relaxed text-muted-foreground/86">
                {product.shortDescription}
              </p>
            )}
          </div>

          <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
            <div className="space-y-0.5">
              <p className="ui-label">Цена</p>
              <p id={priceId} className="text-[1.12rem] font-semibold text-foreground">
                {formatMoney(product.price.amount, product.price.currency)}
              </p>
              {hasComparePrice && product.compareAtPrice && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatMoney(product.compareAtPrice.amount, product.compareAtPrice.currency)}
                </p>
              )}
            </div>
          </div>

          {onQuickAdd && (
            <Button
              size="sm"
              fullWidth
              variant="secondary"
              className="relative z-20 h-9 rounded-[6px] border-border/45 bg-accent text-white hover:bg-accent/92"
              data-testid={`quick-add-${product.slug}`}
              aria-label={`Добавить ${product.name} в корзину`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onQuickAdd(product);
              }}
            >
              В корзину
            </Button>
          )}
        </div>
      </article>
    </motion.div>
  );
};
