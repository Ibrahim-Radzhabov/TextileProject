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
  const activeIndex = active ? media.findIndex((item) => item.id === active.id) : -1;
  const activeLayoutId = active?.id === media[0]?.id ? mainImageLayoutId : undefined;
  const galleryLabel = "Галерея товара";
  const panelId = `product-gallery-panel-${media[0]?.id ?? "main"}`;
  const activeTabId = active ? `product-gallery-tab-${active.id}` : undefined;

  if (!hasMedia) {
    return null;
  }

  React.useEffect(() => {
    if (!activeId || !media.some((item) => item.id === activeId)) {
      setActiveId(media[0]?.id ?? null);
    }
  }, [activeId, media]);

  React.useEffect(() => {
    const activeIndex = media.findIndex((item) => item.id === active?.id);
    if (activeIndex < 0) {
      return;
    }

    const activeThumb = thumbnailRefs.current[activeIndex];
    activeThumb?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  }, [active?.id, media, prefersReducedMotion]);

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
      <div className="hidden flex-col gap-5 md:flex xl:gap-6" aria-label={galleryLabel}>
        {media.map((item, index) => (
          <div key={item.id} className="relative aspect-[4/5] overflow-hidden bg-card/18">
            {index === 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <motion.img
                layoutId={mainImageLayoutId}
                src={item.url}
                alt={item.alt}
                className="absolute inset-0 h-full w-full object-cover"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0.72, scale: 1.01 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                transition={mainImageLayoutId ? springSharedElement : transitionQuick}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.url}
                alt={item.alt}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:hidden">
        <Surface
          className="relative overflow-hidden rounded-[20px] border border-border/45 bg-card/84 shadow-soft"
          role="tabpanel"
          id={panelId}
          aria-labelledby={activeTabId}
          aria-label={galleryLabel}
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px]">
            {active && (
              // eslint-disable-next-line @next/next/no-img-element
              <motion.img
                key={active.id}
                layoutId={activeLayoutId}
                src={active.url}
                alt={active.alt}
                className="absolute inset-0 h-full w-full object-cover"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0.6, scale: 1.02 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                transition={activeLayoutId ? springSharedElement : transitionQuick}
              />
            )}

            {media.length > 1 && activeIndex >= 0 ? (
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
                <span className="rounded-full border border-border/40 bg-card/82 px-2.5 py-1 text-[11px] font-medium tracking-[0.18em] text-foreground/84 backdrop-blur-md">
                  {String(activeIndex + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}
                </span>
              </div>
            ) : null}
          </div>
        </Surface>

        {media.length > 1 && (
          <div
            className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1.5"
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
                  "relative h-20 w-24 flex-none snap-start overflow-hidden rounded-[12px] border transition-all duration-200",
                  active?.id === item.id
                    ? "translate-y-[-1px] border-foreground/30 bg-card/90 shadow-soft"
                    : "border-border/38 bg-card/62 hover:border-border/72",
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
