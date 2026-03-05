"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import type { Product } from "@store-platform/shared-types";

type PinnedHorizontalShowcaseProps = {
  products: Product[];
  title?: string;
  subtitle?: string;
};

const CURRENCY_LOCALE = "ru-RU";

function formatMoney(amount: number, currency: string): string {
  return amount.toLocaleString(CURRENCY_LOCALE, {
    style: "currency",
    currency
  });
}

function ShowcaseCard({ product }: { product: Product }): JSX.Element {
  const primaryImage = product.media[0];
  const overline = product.badges?.[0]?.label ?? product.tags?.[0]?.replace(/-/g, " ");

  return (
    <article className="group relative h-full min-w-[82vw] overflow-hidden rounded-[10px] border border-border/35 bg-card/86 sm:min-w-[58vw] lg:min-w-[42vw] xl:min-w-[34vw]">
      <a
        href={`/product/${encodeURIComponent(product.slug)}`}
        className="absolute inset-0 z-20"
        aria-label={`Открыть товар ${product.name}`}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/48 via-black/14 to-transparent" />

      <div className="h-full w-full overflow-hidden bg-muted/25">
        {primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryImage.url}
            alt={primaryImage.alt}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-muted/25 via-card/20 to-muted/15" />
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 space-y-1.5 px-4 pb-4 pt-8 text-white sm:px-5 sm:pb-5">
        {overline && <p className="ui-kicker text-white/78">{overline}</p>}
        <p className="ui-title-display line-clamp-2 text-[clamp(1.4rem,2.8vw,2.2rem)] leading-[0.98]">
          {product.name}
        </p>
        <p className="text-sm font-medium text-white/88">
          {formatMoney(product.price.amount, product.price.currency)}
        </p>
      </div>
    </article>
  );
}

export function PinnedHorizontalShowcase({
  products,
  title,
  subtitle
}: PinnedHorizontalShowcaseProps): JSX.Element | null {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [metrics, setMetrics] = React.useState({
    sectionHeight: 0,
    maxShift: 0
  });
  const showcaseProducts = products.slice(0, 7);

  const measure = React.useCallback(() => {
    if (!viewportRef.current || !trackRef.current || typeof window === "undefined") {
      return;
    }

    const viewportWidth = viewportRef.current.clientWidth;
    const trackWidth = trackRef.current.scrollWidth;
    const maxShift = Math.max(0, trackWidth - viewportWidth);
    const viewportHeight = window.innerHeight;
    const sectionHeight = Math.max(viewportHeight * 1.06, viewportHeight + maxShift * 0.86 + 132);

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
    if (prefersReducedMotion) {
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
  }, [measure, prefersReducedMotion, showcaseProducts.length]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 28,
    mass: 0.22
  });
  const trackX = useTransform(smoothProgress, [0, 1], [0, -metrics.maxShift]);
  const progressScale = useTransform(smoothProgress, [0, 1], [0, 1]);

  if (showcaseProducts.length < 3) {
    return null;
  }

  if (prefersReducedMotion) {
    return (
      <section className="space-y-4">
        {(title || subtitle) && (
          <header className="space-y-2">
            {title && <h2 className="ui-title-display ui-h2">{title}</h2>}
            {subtitle && <p className="ui-subtle max-w-3xl text-sm sm:text-base">{subtitle}</p>}
          </header>
        )}
        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex h-[52vh] min-h-[320px] gap-3 sm:h-[56vh] sm:min-h-[360px]">
            {showcaseProducts.map((product) => (
              <ShowcaseCard key={`showcase-static-${product.id}`} product={product} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: metrics.sectionHeight > 0 ? `${metrics.sectionHeight}px` : "210vh" }}
    >
      <div className="sticky top-[4.2rem] h-[min(78vh,640px)] overflow-hidden rounded-[12px] border border-border/35 bg-card/82 p-3 backdrop-blur-xl sm:top-[4.8rem] sm:p-4 lg:p-5">
        <div className="flex h-full flex-col">
          {(title || subtitle) && (
            <header className="space-y-1.5 pb-3">
              {title && <h2 className="ui-title-display text-[clamp(1.55rem,2.8vw,2.6rem)]">{title}</h2>}
              {subtitle && <p className="ui-subtle text-sm">{subtitle}</p>}
            </header>
          )}

          <div ref={viewportRef} className="relative flex-1 overflow-hidden">
            <motion.div
              ref={trackRef}
              className="flex h-full gap-3 will-change-transform sm:gap-4"
              style={{ x: trackX }}
            >
              {showcaseProducts.map((product) => (
                <ShowcaseCard key={`showcase-${product.id}`} product={product} />
              ))}
            </motion.div>
          </div>

          <div className="pt-3">
            <div className="h-[2px] w-full overflow-hidden rounded-full bg-border/42">
              <motion.div
                className="h-full origin-left rounded-full bg-accent"
                style={{ scaleX: progressScale }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
