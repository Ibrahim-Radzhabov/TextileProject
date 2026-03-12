"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ProductMedia } from "@store-platform/shared-types";
import { Surface } from "./Surface";
import { springSharedElement, transitionQuick } from "../motion/presets";

export type ProductGalleryProps = {
  media: ProductMedia[];
  mainImageLayoutId?: string;
};

export const ProductGallery: React.FC<ProductGalleryProps> = ({ media, mainImageLayoutId }) => {
  const prefersReducedMotion = useReducedMotion();
  const hasMedia = media.length > 0;
  const [activeId, setActiveId] = React.useState<string | null>(media[0]?.id ?? null);
  const thumbnailRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const active = media.find((m) => m.id === activeId) ?? media[0];
  const activeLayoutId = active?.id === media[0]?.id ? mainImageLayoutId : undefined;
  const galleryLabel = "Галерея товара";
  const panelId = `product-gallery-panel-${media[0]?.id ?? "main"}`;
  const activeTabId = active ? `product-gallery-tab-${active.id}` : undefined;

  if (!hasMedia) {
    return null;
  }

  const focusThumbByIndex = (index: number) => {
    const target = thumbnailRefs.current[index];
    if (target) {
      target.focus();
    }
  };

  const handleThumbKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (media.length <= 1) {
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (index + 1) % media.length;
      setActiveId(media[nextIndex].id);
      focusThumbByIndex(nextIndex);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = (index - 1 + media.length) % media.length;
      setActiveId(media[nextIndex].id);
      focusThumbByIndex(nextIndex);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveId(media[0].id);
      focusThumbByIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const lastIndex = media.length - 1;
      setActiveId(media[lastIndex].id);
      focusThumbByIndex(lastIndex);
    }
  };

  return (
    <div className="space-y-2.5 md:space-y-3">
      <div className="hidden grid-cols-2 gap-2 md:grid lg:gap-3" aria-label={galleryLabel}>
        {media.map((item, index) => (
          <Surface
            key={item.id}
            className="relative aspect-[3/4] overflow-hidden rounded-[4px] border border-border/30 bg-card/58"
          >
            {index === 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <motion.img
                layoutId={mainImageLayoutId}
                src={item.url}
                alt={item.alt}
                className="h-full w-full object-cover"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0.8, scale: 1.01 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                transition={springSharedElement}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.url}
                alt={item.alt}
                className="h-full w-full object-cover"
              />
            )}
          </Surface>
        ))}
      </div>

      <div className="grid gap-3 md:hidden">
        <Surface
          className="relative overflow-hidden rounded-xl border border-border/45 bg-card/82"
          role="tabpanel"
          id={panelId}
          aria-labelledby={activeTabId}
          aria-label={galleryLabel}
        >
          {active && (
            // eslint-disable-next-line @next/next/no-img-element
            <motion.img
              key={active.id}
              layoutId={activeLayoutId}
              src={active.url}
              alt={active.alt}
              className="h-full w-full max-h-[560px] object-cover"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0.6, scale: 1.02 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              transition={activeLayoutId ? springSharedElement : transitionQuick}
            />
          )}
        </Surface>

        {media.length > 1 && (
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            role="tablist"
            aria-label={`${galleryLabel}: превью`}
          >
            {media.map((item, index) => (
              <button
                key={item.id}
                type="button"
                ref={(node) => {
                  thumbnailRefs.current[index] = node;
                }}
                onClick={() => setActiveId(item.id)}
                onKeyDown={(event) => {
                  handleThumbKeyDown(event, index);
                }}
                role="tab"
                id={`product-gallery-tab-${item.id}`}
                aria-controls={panelId}
                aria-selected={active?.id === item.id}
                aria-label={`Превью ${index + 1}: ${item.alt}`}
                tabIndex={active?.id === item.id ? 0 : -1}
                className={[
                  "relative h-16 w-20 flex-none overflow-hidden rounded-[8px] border transition-all",
                  active?.id === item.id
                    ? "border-border/80 bg-card/84"
                    : "border-border/42 hover:border-border/75",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-testid={`product-gallery-thumb-${index + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.alt}
                  className="h-full w-full object-cover"
              />
            </button>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};
