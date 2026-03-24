"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import type { ProductMedia } from "@store-platform/shared-types";
import { Surface } from "./Surface";

export type ProductGalleryProps = {
  media: ProductMedia[];
};

type Size = {
  width: number;
  height: number;
};

type Point = {
  x: number;
  y: number;
};

type ZoomFrame = {
  fitWidth: number;
  fitHeight: number;
  zoomMultiplier: number;
  canMagnify: boolean;
};

const MIN_MODAL_ZOOM_MULTIPLIER = 1.6;
const MAX_MODAL_ZOOM_MULTIPLIER = 2.45;
const ZOOM_DRAG_THRESHOLD = 6;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const ProductGallery: React.FC<ProductGalleryProps> = ({ media }) => {
  const prefersReducedMotion = useReducedMotion();
  const hasMedia = media.length > 0;
  const hasMultipleMedia = media.length > 1;
  const [activeId, setActiveId] = React.useState<string | null>(media[0]?.id ?? null);
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const [zoomActiveId, setZoomActiveId] = React.useState<string | null>(media[0]?.id ?? null);
  const [zoomMagnified, setZoomMagnified] = React.useState(false);
  const [zoomOffset, setZoomOffset] = React.useState<Point>({ x: 0, y: 0 });
  const [zoomDragging, setZoomDragging] = React.useState(false);
  const [hasFinePointer, setHasFinePointer] = React.useState(false);
  const [zoomCursorVisible, setZoomCursorVisible] = React.useState(false);
  const [zoomCursorPosition, setZoomCursorPosition] = React.useState<Point>({ x: 0, y: 0 });
  const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null);
  const [zoomStageSize, setZoomStageSize] = React.useState<Size | null>(null);
  const [zoomImageNaturalSizes, setZoomImageNaturalSizes] = React.useState<Record<string, Size>>({});
  const thumbnailRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const desktopImageRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const zoomStageRef = React.useRef<HTMLDivElement | null>(null);
  const zoomDialogRef = React.useRef<HTMLDivElement | null>(null);
  const zoomFrameRef = React.useRef<HTMLDivElement | null>(null);
  const zoomTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const zoomCurrentOffsetRef = React.useRef<Point>({ x: 0, y: 0 });
  const zoomTargetOffsetRef = React.useRef<Point>({ x: 0, y: 0 });
  const zoomPanFrameRef = React.useRef<number | null>(null);
  const zoomCloseTimerRef = React.useRef<number | null>(null);
  const scrollLockYRef = React.useRef(0);
  const suppressZoomClickRef = React.useRef(false);
  const zoomDragRef = React.useRef<{
    active: boolean;
    moved: boolean;
    startX: number;
    startY: number;
    startOffset: Point;
  }>({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    startOffset: { x: 0, y: 0 },
  });

  const active = media.find((item) => item.id === activeId) ?? media[0];
  const activeIndex = active ? media.findIndex((item) => item.id === active.id) : -1;
  const galleryLabel = "Галерея товара";
  const panelId = `product-gallery-panel-${media[0]?.id ?? "main"}`;
  const activeTabId = active ? `product-gallery-tab-${active.id}` : undefined;
  const desktopGridClass = hasMultipleMedia ? "md:grid-cols-2" : "md:grid-cols-1";
  const zoomActive = media.find((item) => item.id === zoomActiveId) ?? media[0];
  const zoomActiveIndex = zoomActive ? media.findIndex((item) => item.id === zoomActive.id) : -1;
  const zoomNaturalSize = zoomActive ? zoomImageNaturalSizes[zoomActive.id] : undefined;
  const backdropTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.16, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
  const chromeTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.14, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.08 };
  const frameTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };


  const setZoomImageNaturalSize = React.useCallback((mediaId: string, image: HTMLImageElement) => {
    const nextWidth = image.naturalWidth;
    const nextHeight = image.naturalHeight;

    if (!nextWidth || !nextHeight) {
      return;
    }

    setZoomImageNaturalSizes((current) => {
      const prev = current[mediaId];
      if (prev?.width === nextWidth && prev?.height === nextHeight) {
        return current;
      }

      return {
        ...current,
        [mediaId]: {
          width: nextWidth,
          height: nextHeight,
        },
      };
    });
  }, []);

  const zoomFrame = React.useMemo<ZoomFrame | null>(() => {
    if (!zoomNaturalSize || !zoomStageSize?.width || !zoomStageSize?.height) {
      return null;
    }

    const fitScale = Math.min(
      zoomStageSize.width / zoomNaturalSize.width,
      zoomStageSize.height / zoomNaturalSize.height,
      1
    );

    const fitWidth = Math.max(1, Math.round(zoomNaturalSize.width * fitScale));
    const fitHeight = Math.max(1, Math.round(zoomNaturalSize.height * fitScale));
    const naturalZoomMultiplier = fitScale > 0 ? 1 / fitScale : 1;
    const zoomMultiplier = Math.max(
      MIN_MODAL_ZOOM_MULTIPLIER,
      Math.min(MAX_MODAL_ZOOM_MULTIPLIER, naturalZoomMultiplier)
    );
    const canMagnify = zoomMultiplier > 1.02;

    return {
      fitWidth,
      fitHeight,
      zoomMultiplier,
      canMagnify,
    };
  }, [zoomNaturalSize, zoomStageSize]);

  const setZoomOffsetImmediate = React.useCallback((nextOffset: Point) => {
    zoomCurrentOffsetRef.current = nextOffset;
    zoomTargetOffsetRef.current = nextOffset;
    setZoomOffset(nextOffset);
  }, []);

  const setZoomTargetOffset = React.useCallback((nextOffset: Point) => {
    zoomTargetOffsetRef.current = nextOffset;
  }, []);

  const resetZoomInteraction = React.useCallback(() => {
    setZoomMagnified(false);
    setZoomOffsetImmediate({ x: 0, y: 0 });
    setZoomDragging(false);
    setZoomCursorVisible(false);
    suppressZoomClickRef.current = false;
    zoomDragRef.current = {
      active: false,
      moved: false,
      startX: 0,
      startY: 0,
      startOffset: { x: 0, y: 0 },
    };
  }, [setZoomOffsetImmediate]);

  const clampZoomOffset = React.useCallback(
    (nextOffset: Point, nextZoomScale: number) => {
      if (!zoomFrame) {
        return { x: 0, y: 0 };
      }

      const maxX = Math.max(0, (zoomFrame.fitWidth * nextZoomScale - zoomFrame.fitWidth) / 2);
      const maxY = Math.max(0, (zoomFrame.fitHeight * nextZoomScale - zoomFrame.fitHeight) / 2);

      return {
        x: clamp(nextOffset.x, -maxX, maxX),
        y: clamp(nextOffset.y, -maxY, maxY),
      };
    },
    [zoomFrame]
  );

  const zoomMode = zoomMagnified ? "zoom" : "fit";
  const currentZoomScale = zoomMode === "zoom" ? zoomFrame?.zoomMultiplier ?? 1 : 1;

  React.useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  React.useEffect(() => {
    return () => {
      if (zoomCloseTimerRef.current !== null) {
        window.clearTimeout(zoomCloseTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const syncFinePointer = () => {
      setHasFinePointer(mediaQuery.matches);
    };

    syncFinePointer();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncFinePointer);
      return () => {
        mediaQuery.removeEventListener("change", syncFinePointer);
      };
    }

    mediaQuery.addListener(syncFinePointer);
    return () => {
      mediaQuery.removeListener(syncFinePointer);
    };
  }, []);

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
    if (activeIndex < 0) {
      return;
    }

    thumbnailRefs.current[activeIndex]?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [activeIndex, prefersReducedMotion]);

  React.useEffect(() => {
    if (!hasMultipleMedia || typeof window === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);
        const leadEntry = visibleEntries[0];
        const nextId = leadEntry?.target.getAttribute("data-media-id");

        if (nextId) {
          setActiveId((current) => (current === nextId ? current : nextId));
        }
      },
      {
        threshold: [0.25, 0.45, 0.7],
        rootMargin: "-8% 0px -18% 0px",
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

  const goToPrevZoom = React.useCallback(() => {
    if (media.length <= 1 || zoomActiveIndex < 0) {
      return;
    }

    const nextIndex = (zoomActiveIndex - 1 + media.length) % media.length;
    resetZoomInteraction();
    setZoomActiveId(media[nextIndex].id);
  }, [media, resetZoomInteraction, zoomActiveIndex]);

  const goToNextZoom = React.useCallback(() => {
    if (media.length <= 1 || zoomActiveIndex < 0) {
      return;
    }

    const nextIndex = (zoomActiveIndex + 1) % media.length;
    resetZoomInteraction();
    setZoomActiveId(media[nextIndex].id);
  }, [media, resetZoomInteraction, zoomActiveIndex]);

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
        resetZoomInteraction();
        setZoomOpen(false);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrevZoom();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNextZoom();
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
  }, [goToNextZoom, goToPrevZoom, resetZoomInteraction, zoomOpen]);

  React.useEffect(() => {
    if (!zoomOpen || typeof window === "undefined") {
      return;
    }

    const stage = zoomStageRef.current;
    if (!stage) {
      return;
    }

    const readStageSize = () => {
      const styles = window.getComputedStyle(stage);
      const paddingX = (Number.parseFloat(styles.paddingLeft) || 0) + (Number.parseFloat(styles.paddingRight) || 0);
      const paddingY = (Number.parseFloat(styles.paddingTop) || 0) + (Number.parseFloat(styles.paddingBottom) || 0);

      setZoomStageSize({
        width: Math.max(0, stage.clientWidth - paddingX),
        height: Math.max(0, stage.clientHeight - paddingY),
      });
    };

    readStageSize();
    window.addEventListener("resize", readStageSize);

    const observer = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => {
          readStageSize();
        })
      : null;

    observer?.observe(stage);

    return () => {
      window.removeEventListener("resize", readStageSize);
      observer?.disconnect();
    };
  }, [zoomOpen]);

  React.useEffect(() => {
    if (!zoomOpen || !zoomActive || typeof window === "undefined") {
      return;
    }

    if (zoomImageNaturalSizes[zoomActive.id]) {
      return;
    }

    const image = new window.Image();
    image.src = zoomActive.url;

    const apply = () => {
      setZoomImageNaturalSize(zoomActive.id, image);
    };

    if (image.complete) {
      apply();
      return;
    }

    image.addEventListener("load", apply);
    return () => {
      image.removeEventListener("load", apply);
    };
  }, [setZoomImageNaturalSize, zoomActive, zoomImageNaturalSizes, zoomOpen]);

  React.useEffect(() => {
    if (!zoomMagnified) {
      return;
    }

    setZoomOffsetImmediate(clampZoomOffset(zoomCurrentOffsetRef.current, currentZoomScale));
  }, [clampZoomOffset, currentZoomScale, setZoomOffsetImmediate, zoomFrame?.fitHeight, zoomFrame?.fitWidth, zoomMagnified]);

  React.useEffect(() => {
    if (!zoomOpen || zoomMode !== "zoom" || !hasFinePointer || prefersReducedMotion) {
      if (zoomPanFrameRef.current !== null) {
        window.cancelAnimationFrame(zoomPanFrameRef.current);
        zoomPanFrameRef.current = null;
      }
      return;
    }

    const tick = () => {
      const target = clampZoomOffset(zoomTargetOffsetRef.current, currentZoomScale);
      const current = zoomCurrentOffsetRef.current;
      const next = {
        x: Math.abs(target.x - current.x) < 0.24 ? target.x : current.x + (target.x - current.x) * 0.16,
        y: Math.abs(target.y - current.y) < 0.24 ? target.y : current.y + (target.y - current.y) * 0.16,
      };

      zoomCurrentOffsetRef.current = next;
      setZoomOffset((previous) =>
        Math.abs(previous.x - next.x) < 0.01 && Math.abs(previous.y - next.y) < 0.01 ? previous : next
      );
      zoomPanFrameRef.current = window.requestAnimationFrame(tick);
    };

    zoomPanFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (zoomPanFrameRef.current !== null) {
        window.cancelAnimationFrame(zoomPanFrameRef.current);
        zoomPanFrameRef.current = null;
      }
    };
  }, [clampZoomOffset, currentZoomScale, hasFinePointer, prefersReducedMotion, zoomMode, zoomOpen]);

  React.useEffect(() => {
    if (!zoomOpen) {
      setZoomCursorVisible(false);
    }
  }, [zoomOpen]);

  React.useEffect(() => {
    if (!zoomOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      zoomDialogRef.current?.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [zoomOpen]);


  const focusThumbByIndex = (index: number) => {
    thumbnailRefs.current[index]?.focus();
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

  const openZoom = (mediaId: string, trigger?: HTMLButtonElement | null) => {
    if (zoomCloseTimerRef.current !== null) {
      window.clearTimeout(zoomCloseTimerRef.current);
      zoomCloseTimerRef.current = null;
    }

    zoomTriggerRef.current = trigger ?? null;
    trigger?.blur();
    setActiveId(mediaId);
    setZoomActiveId(mediaId);
    resetZoomInteraction();
    setZoomOpen(true);
  };

  const closeZoom = React.useCallback(() => {
    if (zoomCloseTimerRef.current !== null) {
      window.clearTimeout(zoomCloseTimerRef.current);
      zoomCloseTimerRef.current = null;
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    resetZoomInteraction();
    setZoomOpen(false);
  }, [resetZoomInteraction]);

  const handleZoomImageClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();

      if (suppressZoomClickRef.current) {
        suppressZoomClickRef.current = false;
        return;
      }

      if (!zoomFrame?.canMagnify) {
        return;
      }

      if (zoomMagnified) {
        setZoomMagnified(false);
        setZoomOffsetImmediate({ x: 0, y: 0 });
        return;
      }

      const frame = zoomFrameRef.current;
      if (!frame) {
        setZoomMagnified(true);
        return;
      }

      const rect = frame.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      const deltaX = localX - rect.width / 2;
      const deltaY = localY - rect.height / 2;
      const nextScale = zoomFrame.zoomMultiplier;


      setZoomMagnified(true);
      setZoomOffsetImmediate(
        clampZoomOffset(
          {
            x: -deltaX * (nextScale - 1),
            y: -deltaY * (nextScale - 1),
          },
          nextScale
        )
      );
    },
    [clampZoomOffset, setZoomOffsetImmediate, zoomFrame, zoomMagnified]
  );

  const handleZoomMouseMove = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (hasFinePointer) {
        setZoomCursorVisible(true);
        setZoomCursorPosition({ x: event.clientX, y: event.clientY });
      }

      if (zoomMode !== "zoom" || !hasFinePointer || !zoomFrame) {
        return;
      }

      const frame = zoomFrameRef.current;
      if (!frame) {
        return;
      }

      const rect = frame.getBoundingClientRect();
      const px = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const py = clamp((event.clientY - rect.top) / rect.height, 0, 1);

      const maxX = Math.max(0, (zoomFrame.fitWidth * currentZoomScale - zoomFrame.fitWidth) / 2);
      const maxY = Math.max(0, (zoomFrame.fitHeight * currentZoomScale - zoomFrame.fitHeight) / 2);

      setZoomTargetOffset(
        clampZoomOffset(
          {
            x: (0.5 - px) * maxX * 2,
            y: (0.5 - py) * maxY * 2,
          },
          currentZoomScale
        )
      );
    },
    [clampZoomOffset, currentZoomScale, hasFinePointer, setZoomTargetOffset, zoomFrame, zoomMode]
  );

  const handleZoomMouseEnter = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!hasFinePointer) {
        return;
      }

      setZoomCursorPosition({ x: event.clientX, y: event.clientY });
      setZoomCursorVisible(true);
    },
    [hasFinePointer]
  );

  const handleZoomMouseLeave = React.useCallback(() => {
    setZoomCursorVisible(false);
  }, []);

  const handleZoomPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (zoomMode !== "zoom" || event.pointerType === "mouse") {
        return;
      }

      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);

      setZoomDragging(true);
      zoomDragRef.current = {
        active: true,
        moved: false,
        startX: event.clientX,
        startY: event.clientY,
        startOffset: zoomOffset,
      };
    },
    [zoomMode, zoomOffset]
  );

  const handleZoomPointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!zoomDragRef.current.active || zoomMode !== "zoom" || event.pointerType === "mouse") {
        return;
      }

      const deltaX = event.clientX - zoomDragRef.current.startX;
      const deltaY = event.clientY - zoomDragRef.current.startY;

      if (Math.abs(deltaX) > ZOOM_DRAG_THRESHOLD || Math.abs(deltaY) > ZOOM_DRAG_THRESHOLD) {
        zoomDragRef.current.moved = true;
      }

      setZoomOffsetImmediate(
        clampZoomOffset(
          {
            x: zoomDragRef.current.startOffset.x + deltaX,
            y: zoomDragRef.current.startOffset.y + deltaY,
          },
          currentZoomScale
        )
      );
    },
    [clampZoomOffset, currentZoomScale, setZoomOffsetImmediate, zoomMode]
  );

  const handleZoomPointerUp = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!zoomDragRef.current.active) {
      return;
    }

    if (zoomDragRef.current.moved) {
      suppressZoomClickRef.current = true;
    }

    zoomDragRef.current.active = false;
    setZoomDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const canMagnify = zoomFrame?.canMagnify ?? false;
  const zoomDialog = zoomOpen && zoomActive ? (
    <motion.div
      key="product-gallery-lightbox"
      ref={zoomDialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр изображений товара"
      tabIndex={-1}
      className="fixed inset-0 z-[71] overflow-hidden overscroll-none bg-[rgba(247,243,236,0.998)]"
      onClick={closeZoom}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-[rgba(247,243,236,0.998)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={backdropTransition}
      />

      <div className="relative flex min-h-0 h-full flex-col overflow-hidden">
        <motion.div
          className="shrink-0 flex items-center justify-between px-4 py-1.5 sm:px-4 lg:px-6"
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -2 }}
          transition={chromeTransition}
          onClick={(event) => event.stopPropagation()}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/76">
            {String(zoomActiveIndex + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}
          </p>
          <div />
        </motion.div>

        <div className="relative min-h-0 flex-1">
        <div
          ref={zoomStageRef}
          className="relative h-full overflow-hidden px-2 pb-1 sm:px-3 lg:px-4"
          style={{ touchAction: zoomMode === "zoom" && !hasFinePointer ? "none" : "auto" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              ref={zoomFrameRef}
              className={[
                "relative overflow-hidden bg-card/8",
                hasFinePointer && (canMagnify || zoomMode === "zoom") ? "cursor-none" : "",
              ].join(" ")}
              onClick={handleZoomImageClick}
              onMouseEnter={handleZoomMouseEnter}
              onMouseLeave={handleZoomMouseLeave}
              onMouseMove={handleZoomMouseMove}
              onPointerDown={handleZoomPointerDown}
              onPointerMove={handleZoomPointerMove}
              onPointerUp={handleZoomPointerUp}
              onPointerCancel={handleZoomPointerUp}
              style={
                zoomFrame
                  ? {
                      width: `${zoomFrame.fitWidth}px`,
                      height: `${zoomFrame.fitHeight}px`,
                    }
                  : undefined
              }
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              transition={frameTransition}
            >
              <motion.img
                src={zoomActive.url}
                alt={zoomActive.alt}
                draggable={false}
                onLoad={(event) => {
                  setZoomImageNaturalSize(zoomActive.id, event.currentTarget);
                }}
                className="block h-full w-full select-none object-contain"
                style={{
                  cursor: hasFinePointer && (canMagnify || zoomMode === "zoom") ? "none" : "default",
                  transformOrigin: "center center",
                  willChange: "transform",
                  pointerEvents: "none",
                }}
                initial={false}
                animate={{
                  x: zoomOffset.x,
                  y: zoomOffset.y,
                  scale: currentZoomScale,
                }}
                transition={zoomDragging || prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 32, mass: 0.9 }}
              />
            </motion.div>
          </div>
        </div>

        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4 sm:bottom-5"
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
          transition={chromeTransition}
        >
          <div
            className="pointer-events-auto flex items-center gap-2.5"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={goToPrevZoom}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/14 bg-background/96 text-foreground/86 shadow-[0_10px_22px_rgba(18,18,18,0.07)] transition-all hover:-translate-y-0.5 hover:text-foreground disabled:cursor-default disabled:opacity-32 disabled:hover:translate-y-0 sm:h-12 sm:w-12"
              aria-label="Предыдущее изображение"
              disabled={media.length <= 1}
            >
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 6 9 12l6 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={closeZoom}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/14 bg-background/97 text-foreground/88 shadow-[0_12px_26px_rgba(18,18,18,0.08)] transition-all hover:-translate-y-0.5 hover:text-foreground sm:h-14 sm:w-14"
              aria-label="Закрыть просмотр"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6 18 18" />
                <path d="M18 6 6 18" />
              </svg>
            </button>

            <button
              type="button"
              onClick={goToNextZoom}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/14 bg-background/96 text-foreground/86 shadow-[0_10px_22px_rgba(18,18,18,0.07)] transition-all hover:-translate-y-0.5 hover:text-foreground disabled:cursor-default disabled:opacity-32 disabled:hover:translate-y-0 sm:h-12 sm:w-12"
              aria-label="Следующее изображение"
              disabled={media.length <= 1}
            >
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          </div>
        </motion.div>

      </div>
      </div>

      {hasFinePointer && (canMagnify || zoomMode === "zoom") ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-[72] flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-foreground/18 bg-background/90 text-foreground/92 shadow-[0_10px_24px_rgba(18,18,18,0.06)]"
          initial={false}
          animate={{
            opacity: zoomCursorVisible ? 1 : 0,
            x: zoomCursorPosition.x,
            y: zoomCursorPosition.y,
            scale: zoomCursorVisible ? (zoomMode === "zoom" ? 1.02 : 1) : 0.96,
          }}
          transition={
            zoomDragging || prefersReducedMotion
              ? { duration: 0 }
              : {
                  x: { duration: 0 },
                  y: { duration: 0 },
                  opacity: { duration: 0.1 },
                  scale: { type: "spring", stiffness: 520, damping: 36, mass: 0.45 },
                }
          }
        >
          <span className="relative block h-3.5 w-3.5 opacity-95">
            {zoomMode === "fit" ? (
              <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
            ) : null}
            <span className="absolute left-[2px] right-[2px] top-1/2 h-px -translate-y-1/2 bg-current" />
          </span>
        </motion.div>
      ) : null}
    </motion.div>
  ) : null;

  if (!hasMedia) {
    return null;
  }

  return (
    <>
      <div className="space-y-2.5 md:space-y-0">
      <div className="hidden md:block">
        <div className={`grid w-full md:gap-2 ${desktopGridClass}`} aria-label={galleryLabel}>
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
                onClick={(event) => openZoom(item.id, event.currentTarget)}
                className="absolute inset-0 z-10 cursor-zoom-in"
                aria-label={`Открыть изображение ${index + 1} крупно`}
              />
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.alt}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
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
            {active ? (
              <>
                <button
                  type="button"
                  onClick={(event) => openZoom(active.id, event.currentTarget)}
                  className="absolute inset-0 z-10 cursor-zoom-in"
                  aria-label={`Открыть изображение ${activeIndex + 1} крупно`}
                />
                <div className="absolute inset-0 overflow-hidden rounded-[20px]">
                  <img
                    src={active.url}
                    alt={active.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </>
            ) : null}

            {media.length > 1 && activeIndex >= 0 ? (
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
                <span className="rounded-full border border-border/40 bg-card/82 px-2.5 py-1 text-[11px] font-medium tracking-[0.18em] text-foreground/84 backdrop-blur-md">
                  {String(activeIndex + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}
                </span>
              </div>
            ) : null}
          </div>
        </Surface>

        {media.length > 1 ? (
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
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                ].join(" ")}
                data-testid={`product-gallery-thumb-${index + 1}`}
              >
                <img
                  src={item.url}
                  alt={item.alt}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {portalRoot
        ? createPortal(
            zoomOpen ? (
              <AnimatePresence
                initial={false}
              >
                {zoomDialog}
              </AnimatePresence>
            ) : (
              zoomDialog
            ),
            portalRoot
          )
        : null}
      </div>
    </>
  );
};
