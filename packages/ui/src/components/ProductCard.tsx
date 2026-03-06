"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Product } from "@store-platform/shared-types";
import { Button } from "./Button";
import { FavoriteToggleButton } from "./FavoriteToggleButton";
import { springSharedElement, springSnappy } from "../motion/presets";

export type ProductCardProps = {
  product: Product;
  onQuickAdd?: (product: Product) => void;
  enableSharedTransition?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (product: Product) => void;
  variant?: "default" | "editorial";
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
  onToggleFavorite,
  variant = "default"
}) => {
  const prefersReducedMotion = useReducedMotion();
  const isEditorial = variant === "editorial";
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
      whileHover={prefersReducedMotion ? undefined : { y: isEditorial ? -1 : -2 }}
      transition={springSnappy}
      className="group h-full"
      data-testid={`product-card-${product.slug}`}
    >
      <article
        className={[
          "relative flex h-full flex-col overflow-hidden rounded-[8px] bg-card/94",
          isEditorial ? "border border-border/26" : "border border-border/32"
        ].join(" ")}
      >
        <div className="relative overflow-hidden">
          <a
            href={productHref}
            aria-label={`Открыть товар ${product.name}`}
            aria-describedby={`${titleId} ${priceId}`}
            className="absolute inset-0 z-10 rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />

          {onToggleFavorite && (
            <FavoriteToggleButton
              testId={`favorite-toggle-${product.slug}`}
              active={isFavorite}
              addLabel={`Добавить ${product.name} в избранное`}
              removeLabel={`Убрать ${product.name} из избранного`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleFavorite(product);
              }}
            />
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

        <div className={["relative z-20 flex flex-1 flex-col p-3 sm:p-3.5", isEditorial ? "gap-2" : "gap-2.5"].join(" ")}>
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
                className={[
                  "ui-title line-clamp-1",
                  isEditorial ? "text-[1.08rem] leading-tight" : "text-[1.04rem]"
                ].join(" ")}
                transition={springSharedElement}
              >
                {product.name}
              </motion.p>
            ) : (
              <p
                id={titleId}
                className={[
                  "ui-title line-clamp-1",
                  isEditorial ? "text-[1.08rem] leading-tight" : "text-[1.04rem]"
                ].join(" ")}
              >
                {product.name}
              </p>
            )}
            {product.shortDescription && (
              <p
                className={[
                  "text-muted-foreground/86",
                  isEditorial ? "line-clamp-1 text-[0.85rem] leading-relaxed" : "line-clamp-2 text-[0.88rem] leading-relaxed"
                ].join(" ")}
              >
                {product.shortDescription}
              </p>
            )}
          </div>

          <div className={["mt-auto flex items-end justify-between gap-2", isEditorial ? "pt-1" : "pt-1.5"].join(" ")}>
            <div className="space-y-0.5">
              {!isEditorial && <p className="ui-label">Цена</p>}
              <p
                id={priceId}
                className={[
                  "font-semibold text-foreground",
                  isEditorial ? "text-[1.2rem] tracking-tight" : "text-[1.12rem]"
                ].join(" ")}
              >
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
              variant="primary"
              ripple
              className={[
                "relative z-20 rounded-[6px] border-border/45 bg-accent text-white hover:bg-accent/92",
                isEditorial ? "h-9 text-[0.86rem]" : "h-9"
              ].join(" ")}
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
