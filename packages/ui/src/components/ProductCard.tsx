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
  variant?: "default" | "editorial" | "name-price";
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
  const isNamePrice = variant === "name-price";
  const primaryImage = product.media[0];
  const secondaryImage = product.media[1];
  const productHref = `/product/${encodeURIComponent(product.slug)}`;
  const sharedMediaLayoutId = enableSharedTransition ? `product-media-${product.id}` : undefined;
  const sharedTitleLayoutId = enableSharedTransition ? `product-title-${product.id}` : undefined;
  const titleId = `product-card-title-${product.id}`;
  const priceId = `product-card-price-${product.id}`;
  const canCrossfade = Boolean(primaryImage && secondaryImage && !prefersReducedMotion && !enableSharedTransition);
  const hasComparePrice =
    product.compareAtPrice &&
    product.compareAtPrice.currency === product.price.currency &&
    product.compareAtPrice.amount > product.price.amount;
  const roomTag = (product.tags ?? []).find((tag) => ["bedroom", "living-room", "office", "kids"].includes(tag));
  const overline = product.badges?.[0]?.label ?? roomTag?.replace(/-/g, " ");

  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : isEditorial ? undefined : { y: -2 }}
      transition={springSnappy}
      className="group h-full"
      data-testid={`product-card-${product.slug}`}
    >
      <article
        className={[
          "relative flex h-full min-h-0 flex-col",
          isEditorial
            ? "bg-transparent"
            : "overflow-hidden rounded-[8px] border border-border/32 bg-card/94"
        ].join(" ")}
      >
        <div className={["relative overflow-hidden", isEditorial ? "rounded-[8px]" : ""].join(" ")}>
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

          <div
            className={[
              "aspect-[4/5] overflow-hidden",
              isEditorial ? "rounded-[6px] bg-card/32" : "bg-muted/20"
            ].join(" ")}
          >
            {primaryImage && (
              <div className="relative h-full w-full">
                {secondaryImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={secondaryImage.url}
                    alt=""
                    aria-hidden="true"
                    className={[
                      "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                      canCrossfade
                        ? "opacity-0 scale-[1.035] group-hover:scale-100 group-hover:opacity-100"
                        : "opacity-0"
                    ].join(" ")}
                  />
                )}
                {enableSharedTransition ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <motion.img
                    layoutId={sharedMediaLayoutId}
                    src={primaryImage.url}
                    alt={primaryImage.alt}
                    className={[
                      "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                      canCrossfade
                        ? "opacity-100 group-hover:scale-[1.02] group-hover:opacity-0"
                        : "opacity-100 group-hover:scale-[1.03]"
                    ].join(" ")}
                    transition={springSharedElement}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryImage.url}
                    alt={primaryImage.alt}
                    className={[
                      "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                      canCrossfade
                        ? "opacity-100 group-hover:scale-[1.02] group-hover:opacity-0"
                        : "opacity-100 group-hover:scale-[1.03]"
                    ].join(" ")}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div
          className={[
            "relative z-20 flex flex-1 flex-col",
            isEditorial ? "gap-3 px-0 pb-1 pt-5" : "gap-2.5 p-3.5 sm:p-3.5"
          ].join(" ")}
        >
          <div className={isEditorial ? "space-y-2" : isNamePrice ? "space-y-1" : "space-y-1.5"}>
            {overline && !isNamePrice && (
              <p className={isEditorial ? "ui-meta" : "ui-kicker text-muted-foreground/78"}>
                {overline}
              </p>
            )}
            {enableSharedTransition ? (
              <motion.p
                layoutId={sharedTitleLayoutId}
                id={titleId}
                className={[
                  "line-clamp-2",
                  isEditorial
                    ? "ui-title-serif text-[1.38rem] leading-[1.02] text-foreground"
                    : isNamePrice
                      ? "ui-title-serif text-[1.24rem] leading-[1.06] text-foreground"
                      : "ui-title text-[1.04rem]"
                ].join(" ")}
                transition={springSharedElement}
              >
                {product.name}
              </motion.p>
            ) : (
              <p
                id={titleId}
                className={[
                  "line-clamp-2",
                  isEditorial
                    ? "ui-title-serif text-[1.38rem] leading-[1.02] text-foreground"
                    : isNamePrice
                      ? "ui-title-serif text-[1.24rem] leading-[1.06] text-foreground"
                      : "ui-title text-[1.04rem]"
                ].join(" ")}
              >
                {product.name}
              </p>
            )}
            {product.shortDescription && !isNamePrice && (
              <p
                className={[
                  "text-muted-foreground/86",
                  isEditorial
                    ? "line-clamp-2 text-[0.89rem] leading-relaxed"
                    : "line-clamp-2 text-[0.88rem] leading-relaxed"
                ].join(" ")}
              >
                {product.shortDescription}
              </p>
            )}
          </div>

          <div
            className={[
              "mt-auto flex items-end justify-between gap-2",
              isEditorial || isNamePrice ? "border-t border-border/20 pt-3" : "pt-1.5"
            ].join(" ")}
          >
            <div className="space-y-0.5">
              {!isEditorial && !isNamePrice && <p className="ui-label">Цена</p>}
              <p
                id={priceId}
                className={[
                  "font-semibold text-foreground",
                  isEditorial || isNamePrice ? "text-[1.2rem] tracking-tight" : "text-[1.12rem]"
                ].join(" ")}
              >
                {formatMoney(product.price.amount, product.price.currency)}
              </p>
              {hasComparePrice && product.compareAtPrice && !isNamePrice && (
                <p className="text-xs text-muted-foreground line-through">
                  {formatMoney(product.compareAtPrice.amount, product.compareAtPrice.currency)}
                </p>
              )}
            </div>
          </div>

          {onQuickAdd && (
            <Button
              asChild
              size="sm"
              fullWidth
              variant="primary"
              ripple
              className={[
                "relative z-20 rounded-[6px] border-border/45 bg-accent text-white transition-[transform,box-shadow,background-color] duration-300 hover:bg-accent/92 hover:shadow-soft-subtle",
                isEditorial ? "h-10 text-[0.87rem] sm:h-9" : "h-10 sm:h-9"
              ].join(" ")}
              data-testid={`product-details-${product.slug}`}
            >
              <a href={productHref} aria-label={`Подробнее о ${product.name}`}>
                Подробнее
              </a>
            </Button>
          )}
        </div>
      </article>
    </motion.div>
  );
};
