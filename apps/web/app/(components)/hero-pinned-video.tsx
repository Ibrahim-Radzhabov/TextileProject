"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { HeroMedia, type HeroMediaConfig } from "@store-platform/ui";

type HeroPinnedVideoProps = {
  media: HeroMediaConfig;
  title: string;
};

export function HeroPinnedVideo({ media, title }: HeroPinnedVideoProps): JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [isMobileViewport, setIsMobileViewport] = React.useState(false);
  const [metrics, setMetrics] = React.useState({
    sectionHeight: 0,
    maxShift: 0
  });

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const query = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsMobileViewport(query.matches);

    update();
    query.addEventListener("change", update);
    return () => {
      query.removeEventListener("change", update);
    };
  }, []);

  const useStaticMode = prefersReducedMotion || isMobileViewport;

  const measure = React.useCallback(() => {
    if (!viewportRef.current || !trackRef.current || typeof window === "undefined") {
      return;
    }

    const viewportWidth = viewportRef.current.clientWidth;
    const trackWidth = trackRef.current.scrollWidth;
    const maxShift = Math.max(0, trackWidth - viewportWidth);
    const viewportHeight = window.innerHeight;
    const sectionHeight = Math.max(viewportHeight * 1.18, viewportHeight + maxShift * 1.04 + 120);

    setMetrics((prev) => {
      if (
        Math.abs(prev.sectionHeight - sectionHeight) < 1 &&
        Math.abs(prev.maxShift - maxShift) < 1
      ) {
        return prev;
      }

      return {
        sectionHeight,
        maxShift
      };
    });
  }, []);

  React.useEffect(() => {
    if (useStaticMode) {
      return;
    }

    const raf = window.requestAnimationFrame(measure);
    const handleResize = () => {
      measure();
    };

    window.addEventListener("resize", handleResize);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && viewportRef.current && trackRef.current) {
      observer = new ResizeObserver(() => {
        measure();
      });
      observer.observe(viewportRef.current);
      observer.observe(trackRef.current);
    }

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
    };
  }, [measure, useStaticMode]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 118,
    damping: 30,
    mass: 0.3
  });
  const trackX = useTransform(smoothProgress, [0, 1], [0, -metrics.maxShift]);

  if (useStaticMode) {
    return (
      <section className="relative isolate min-h-[360px] overflow-hidden rounded-md bg-card/80 sm:min-h-[470px] lg:min-h-[540px]">
        <HeroMedia
          media={media}
          title={title}
          defaultOverlayOpacity={0.04}
          overlayClassName="bg-background/8"
        />
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: metrics.sectionHeight > 0 ? `${metrics.sectionHeight}px` : "180vh" }}
    >
      <div className="sticky top-[4.2rem] h-[min(72vh,620px)] overflow-hidden rounded-md bg-card/80 sm:top-[4.8rem]">
        <div ref={viewportRef} className="relative h-full w-full overflow-hidden">
          <motion.div
            ref={trackRef}
            className="relative h-full w-[140vw] will-change-transform"
            style={{ x: trackX }}
          >
            <HeroMedia
              media={media}
              title={title}
              defaultOverlayOpacity={0.04}
              overlayClassName="bg-background/8"
              assetClassName="h-full w-full object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
