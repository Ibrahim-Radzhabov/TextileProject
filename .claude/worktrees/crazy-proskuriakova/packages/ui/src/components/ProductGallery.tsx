"use client";

import * as React from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import type { ProductMedia } from "@store-platform/shared-types";
import { transitionQuick } from "../motion/presets";

export type ProductGalleryProps = {
  media: ProductMedia[];
  mainImageLayoutId?: string;
};

/* ─── Fullscreen Zoom Overlay ─── */

function ZoomOverlay({
  media,
  initialIndex,
  onClose,
  onPopStateClose
}: {
  media: ProductMedia[];
  initialIndex: number;
  onClose: () => void;
  onPopStateClose: () => void;
}) {
  const [index, setIndex] = React.useState(initialIndex);
  const [zoom, setZoom] = React.useState(false);
  const [origin, setOrigin] = React.useState({ x: 50, y: 50 });
  const imgRef = React.useRef<HTMLImageElement>(null);
  const item = media[index];

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, media.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };

    // Browser back button closes zoom
    window.history.pushState({ galleryZoom: true }, "");
    const onPopState = () => {
      onPopStateClose();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPopState);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPopState);
      document.body.style.overflow = "";
    };
  }, [media.length, onClose]);

  // Reset zoom when switching images
  React.useEffect(() => {
    setZoom(false);
  }, [index]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!zoom || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
  };

  const toggleZoom = (e: React.MouseEvent) => {
    if (!zoom) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setOrigin({ x, y });
    }
    setZoom((z) => !z);
  };

  if (!item) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 z-10 text-[13px] font-medium uppercase tracking-[0.1em] text-foreground/50 transition-colors hover:text-foreground"
      >
        Закрыть
      </button>

      {/* Counter */}
      {media.length > 1 && (
        <span className="absolute left-5 top-5 z-10 text-[13px] font-medium uppercase tracking-[0.1em] text-foreground/50">
          {index + 1} / {media.length}
        </span>
      )}

      {/* Prev / Next */}
      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            disabled={index === 0}
            className="absolute left-5 top-1/2 z-10 -translate-y-1/2 text-2xl text-foreground/30 transition-colors hover:text-foreground disabled:opacity-0"
            aria-label="Предыдущее фото"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(i + 1, media.length - 1))}
            disabled={index === media.length - 1}
            className="absolute right-5 top-1/2 z-10 -translate-y-1/2 text-2xl text-foreground/30 transition-colors hover:text-foreground disabled:opacity-0"
            aria-label="Следующее фото"
          >
            ›
          </button>
        </>
      )}

      {/* Background — click outside image to close */}
      <div
        className="absolute inset-0"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      />

      {/* Image with zoom */}
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden px-12 py-16"
        onClick={(e) => {
          // Click on padding area (outside img) → close
          if (e.target === e.currentTarget) {
            onClose();
            return;
          }
        }}
        onMouseMove={handleMouseMove}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          key={item.id}
          src={item.url}
          alt={item.alt}
          onClick={toggleZoom}
          className="max-h-full max-w-full object-contain transition-transform duration-300"
          style={{
            cursor: zoom ? "zoom-out" : "zoom-in",
            transform: zoom ? "scale(2.5)" : "scale(1)",
            transformOrigin: `${origin.x}% ${origin.y}%`
          }}
          draggable={false}
        />
      </div>

      {/* Bottom thumbnail strip */}
      {media.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {media.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={(e) => { e.stopPropagation(); setIndex(i); }}
              className={[
                "h-12 w-12 overflow-hidden border transition-all duration-200",
                i === index
                  ? "border-foreground/40 opacity-100"
                  : "border-transparent opacity-40 hover:opacity-70"
              ].join(" ")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Mobile Swipe Carousel ─── */

function MobileCarousel({
  media,
  onImageClick
}: {
  media: ProductMedia[];
  onImageClick: (index: number) => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const scrollLeft = el.scrollLeft;
        const itemWidth = el.clientWidth;
        const idx = Math.round(scrollLeft / itemWidth);
        setActiveIndex(Math.max(0, Math.min(idx, media.length - 1)));
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [media.length]);

  return (
    <div className="relative md:hidden">
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {media.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onImageClick(index)}
            className="relative aspect-[4/5] w-full flex-none snap-center"
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

      {/* Dots */}
      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {media.map((_, i) => (
            <span
              key={i}
              className={[
                "block h-1 rounded-full transition-all duration-300",
                i === activeIndex ? "w-4 bg-foreground/60" : "w-1 bg-foreground/20"
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Desktop Gallery (main + thumbs) ─── */

function DesktopGallery({
  media,
  mainImageLayoutId,
  onImageClick
}: {
  media: ProductMedia[];
  mainImageLayoutId?: string;
  onImageClick: (index: number) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const thumbContainerRef = React.useRef<HTMLDivElement>(null);
  const active = media[activeIndex];

  const scrollThumbIntoView = (idx: number) => {
    const container = thumbContainerRef.current;
    if (!container) return;
    const thumb = container.children[idx] as HTMLElement | undefined;
    thumb?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  const selectImage = (idx: number) => {
    setActiveIndex(idx);
    scrollThumbIntoView(idx);
  };

  if (!active) return null;

  return (
    <div className="hidden gap-3 md:grid md:grid-cols-[64px_1fr] lg:gap-4">
      {/* Vertical thumbnail strip */}
      <div
        ref={thumbContainerRef}
        className="flex max-h-[600px] flex-col gap-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Галерея товара: превью"
      >
        {media.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Фото ${i + 1}`}
            onClick={() => selectImage(i)}
            className={[
              "relative aspect-square w-full flex-none overflow-hidden border transition-all duration-200",
              i === activeIndex
                ? "border-foreground/30"
                : "border-transparent opacity-50 hover:opacity-80"
            ].join(" ")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <button
        type="button"
        onClick={() => onImageClick(activeIndex)}
        className="relative aspect-[4/5] w-full overflow-hidden"
        style={{ cursor: "zoom-in" }}
        aria-label="Увеличить фото"
        role="tabpanel"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={active.id}
            src={active.url}
            alt={active.alt}
            className="absolute inset-0 h-full w-full object-cover"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>

        {/* Zoom hint */}
        <span className="pointer-events-none absolute bottom-4 right-4 text-[11px] font-medium uppercase tracking-[0.1em] text-foreground/30">
          Увеличить
        </span>
      </button>
    </div>
  );
}

/* ─── Main Export ─── */

export const ProductGallery: React.FC<ProductGalleryProps> = ({ media, mainImageLayoutId }) => {
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const [zoomIndex, setZoomIndex] = React.useState(0);
  const closedViaPopStateRef = React.useRef(false);

  if (media.length === 0) return null;

  const openZoom = (index: number) => {
    closedViaPopStateRef.current = false;
    setZoomIndex(index);
    setZoomOpen(true);
  };

  const closeZoom = () => {
    setZoomOpen(false);
    // If closed via UI (not popstate), remove the history entry we pushed
    if (!closedViaPopStateRef.current) {
      window.history.back();
    }
  };

  return (
    <>
      <div aria-label="Галерея товара">
        <DesktopGallery
          media={media}
          mainImageLayoutId={mainImageLayoutId}
          onImageClick={openZoom}
        />
        <MobileCarousel
          media={media}
          onImageClick={openZoom}
        />
      </div>

      <AnimatePresence>
        {zoomOpen && (
          <ZoomOverlay
            media={media}
            initialIndex={zoomIndex}
            onClose={closeZoom}
            onPopStateClose={() => setZoomOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
