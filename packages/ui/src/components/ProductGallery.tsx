"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const hasMultipleMedia = media.length > 1;
  const [activeId, setActiveId] = React.useState<string | null>(media[0]?.id ?? null);
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const [zoomActiveId, setZoomActiveId] = React.useState<string | null>(media[0]?.id ?? null);
  const thumbnailRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const zoomThumbnailRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const desktopImageRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const scrollLockYRef = React.useRef(0);
  const active = media.find((m) => m.id === activeId) ?? media[0];
  const activeIndex = active ? media.findIndex((item) => item.id === active.id) : -1;
  const activeLayoutId = active?.id === media[0]?.id ? mainImageLayoutId : undefined;
  const galleryLabel = "Галерея товара";
  const panelId = `product-gallery-panel-${media[0]?.id ?? "main"}`;
  const activeTabId = active ? `product-gallery-tab-${active.id}` : undefined;
  const desktopGridClass = hasMultipleMedia ? "md:grid-cols-2" : "md:grid-cols-1";
  const zoomActive = media.find((m) => m.id === zoomActiveId) ?? media[0];
  const zoomActiveIndex = zoomActive ? media.findIndex((item) => item.id === zoomActive.id) : -1;

  if (!hasMedia) {
    return null;
  }

  React.useEffect(() => {
    if (!activeId || !media.some((item) => item.id === activeId)) {
      setActiveId(media[0]?.id ?? null);
    }
  }, [activeId, media]);

  React.useEffect(() => {
    if (!zoomActiveId || !media.some((item) => item.id === zoomActiveId)) {
      setZoomActiveId(media[0]?.id ?? null);
    }
  }, [media, zoomActiveId]);

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

  React.useEffect(() => {
    if (!hasMultipleMedia || typeof window === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const leadEntry = visibleEntries[0];
        const nextId = leadEntry?.target.getAttribute("data-media-id");

        if (nextId) {
          setActiveId((current) => (current === nextId ? current : nextId));
        }
      },
      {
        threshold: [0.25, 0.45, 0.7],
        rootMargin: "-8% 0px -18% 0px"
      }
    );

    desktopImageRefs.current.forEach((node) => {
      if (node) {
        observer.observe(node);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [hasMultipleMedia, media]);

  React.useEffect(() => {
    if (!zoomOpen) {
      return;
    }

    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;
    const originalBodyLeft = document.body.style.left;
    const originalBodyRight = document.body.style.right;
    scrollLockYRef.current = window.scrollY;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollLockYRef.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setZoomOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      document.body.style.left = originalBodyLeft;
      document.body.style.right = originalBodyRight;
      window.scrollTo({ top: scrollLockYRef.current, behavior: "auto" });
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomOpen]);

  React.useEffect(() => {
    if (!zoomOpen || zoomActiveIndex < 0) {
      return;
    }

    const thumb = zoomThumbnailRefs.current[zoomActiveIndex];
    thumb?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  }, [prefersReducedMotion, zoomActiveIndex, zoomOpen]);

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

  const openZoom = (mediaId: string) => {
    setActiveId(mediaId);
    setZoomActiveId(mediaId);
    setZoomOpen(true);
  };

  const focusZoomThumbByIndex = (index: number) => {
    const target = zoomThumbnailRefs.current[index];
    if (target) {
      target.focus();
    }
  };

  const handleZoomKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (media.length <= 1) {
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (index + 1) % media.length;
      setZoomActiveId(media[nextIndex].id);
      focusZoomThumbByIndex(nextIndex);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = (index - 1 + media.length) % media.length;
      setZoomActiveId(media[nextIndex].id);
      focusZoomThumbByIndex(nextIndex);
      return;
    }
  };

  const goToPrevZoom = () => {
    if (media.length <= 1 || zoomActiveIndex < 0) {
      return;
    }

    const nextIndex = (zoomActiveIndex - 1 + media.length) % media.length;
    setZoomActiveId(media[nextIndex].id);
  };

  const goToNextZoom = () => {
    if (media.length <= 1 || zoomActiveIndex < 0) {
      return;
    }

    const nextIndex = (zoomActiveIndex + 1) % media.length;
    setZoomActiveId(media[nextIndex].id);
  };

  return (
    <div className="space-y-2.5 md:space-y-0">
      <div className="hidden md:block">
        <div
          className={`grid w-full md:gap-2 ${desktopGridClass}`}
          aria-label={galleryLabel}
        >
          {media.map((item, index) => (
            <div
              key={item.id}
              ref={(node) => {
                desktopImageRefs.current[index] = node;
              }}
              data-media-id={item.id}
              className="relative aspect-[5/7] overflow-hidden bg-card/12"
            >
              <button
                type="button"
                onClick={() => openZoom(item.id)}
                className="absolute inset-0 z-10 cursor-zoom-in"
                aria-label={`Открыть изображение ${index + 1} крупно`}
              />
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

      <AnimatePresence>
        {zoomOpen && zoomActive ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Просмотр изображений товара"
            className="fixed inset-0 z-[71] flex min-h-0 flex-col overflow-hidden overscroll-none bg-background"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
            onClick={() => setZoomOpen(false)}
          >
              <div
                className="shrink-0 flex items-center justify-between px-4 py-3 sm:px-5 lg:px-8"
                onClick={(event) => event.stopPropagation()}
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/76">
                  {String(zoomActiveIndex + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}
                </p>
                <button
                  type="button"
                  onClick={() => setZoomOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/72 transition-colors hover:text-foreground"
                  aria-label="Закрыть просмотр"
                >
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6 18 18" />
                    <path d="M18 6 6 18" />
                  </svg>
                </button>
              </div>

              <div
                className="flex min-h-0 flex-1 flex-col"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 pb-2 sm:px-5 lg:px-8">
                  <div className="relative h-full w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <motion.img
                      key={zoomActive.id}
                      src={zoomActive.url}
                      alt={zoomActive.alt}
                      className="h-full w-full object-contain"
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0.72, scale: 1.01 }}
                      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                      transition={transitionQuick}
                    />
                  </div>
                </div>

                {media.length > 1 ? (
                  <div className="shrink-0 border-t border-border/14 px-4 py-3 sm:px-5 lg:px-8">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
                        {media.map((item, index) => (
                          <button
                            key={item.id}
                            ref={(node) => {
                              zoomThumbnailRefs.current[index] = node;
                            }}
                            type="button"
                            onClick={() => setZoomActiveId(item.id)}
                            onKeyDown={(event) => handleZoomKeyDown(event, index)}
                            className={[
                              "relative h-20 w-16 flex-none overflow-hidden transition-all duration-200 lg:h-24 lg:w-[4.5rem]",
                              zoomActive?.id === item.id
                                ? "ring-1 ring-foreground/20"
                                : "opacity-82 hover:opacity-100",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            ].join(" ")}
                            aria-label={`Открыть изображение ${index + 1}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.url}
                              alt={item.alt}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>

                      <div className="hidden items-center gap-1.5 md:flex">
                        <button
                          type="button"
                          onClick={goToPrevZoom}
                          className="inline-flex h-10 w-10 items-center justify-center text-foreground/68 transition-colors hover:text-foreground disabled:cursor-default disabled:text-muted-foreground/38"
                          aria-label="Предыдущее изображение"
                          disabled={media.length <= 1}
                        >
                          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M15 6 9 12l6 6" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={goToNextZoom}
                          className="inline-flex h-10 w-10 items-center justify-center text-foreground/68 transition-colors hover:text-foreground disabled:cursor-default disabled:text-muted-foreground/38"
                          aria-label="Следующее изображение"
                          disabled={media.length <= 1}
                        >
                          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m9 6 6 6-6 6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
