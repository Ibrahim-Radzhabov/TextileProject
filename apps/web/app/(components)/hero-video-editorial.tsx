"use client";

import * as React from "react";
import {
  motion,
  useInView,
  useReducedMotion
} from "framer-motion";
import { HeroMedia, type HeroMediaConfig } from "@store-platform/ui";

const EASE_SOFT = [0.25, 0.46, 0.45, 0.94] as const;
const DURATION_ENTER = 0.95;
const CARD_DELAY = 0.22;
const WIDTH_PROGRESS_MAX = 1;
const HEIGHT_PROGRESS_MAX = 1;
const PARALLAX_MAX_X = 0;
const PARALLAX_MAX_Y = 0;
const PARALLAX_MAX_SCALE = 1.001;
const REVEAL_OFFSET = 22;
const FRAME_START_INSET_PERCENT = 5;
const FRAME_START_OFFSET_VH = 0.18;
const FRAME_EXTRA_SCROLL_VH = 0.28;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

function easeInOutSine(progress: number): number {
  return -(Math.cos(Math.PI * progress) - 1) / 2;
}

export type HeroVideoEditorialProps = {
  media: HeroMediaConfig;
  title: string;
  cardTitle?: string;
  cardLinks?: Array< { label: string; href: string; subtitle?: string }>;
  primaryCta?: { label: string; href: string };
  introText?: string;
  revealContent?: React.ReactNode;
  desktopBreakout?: boolean;
  className?: string;
};

export function HeroVideoEditorial({
  media,
  title,
  cardTitle,
  cardLinks,
  primaryCta,
  introText,
  revealContent,
  desktopBreakout = false,
  className
}: HeroVideoEditorialProps): JSX.Element {
  const desktopScrollRef = React.useRef<HTMLDivElement>(null);
  const desktopFrameRef = React.useRef<HTMLElement>(null);
  const introRef = React.useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [desktopProgress, setDesktopProgress] = React.useState(0);

  const updateDesktopProgress = React.useCallback(() => {
    if (typeof window === "undefined") {
      setDesktopProgress(0);
      return;
    }
    const wrapper = desktopScrollRef.current;
    if (!wrapper) {
      setDesktopProgress(0);
      return;
    }

    const viewportHeight = window.innerHeight;
    const wrapperRect = wrapper.getBoundingClientRect();
    const stickySpan = Math.max(
      wrapper.offsetHeight - viewportHeight + viewportHeight * FRAME_EXTRA_SCROLL_VH,
      1
    );
    const next = clamp(
      (viewportHeight * FRAME_START_OFFSET_VH - wrapperRect.top) / stickySpan,
      0,
      1
    );
    setDesktopProgress((prev) => (Math.abs(prev - next) < 0.001 ? prev : next));
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    let frame = 0;

    const requestMeasure = () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        updateDesktopProgress();
      });
    };

    const requestProgress = () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        updateDesktopProgress();
      });
    };

    requestMeasure();
    window.addEventListener("scroll", requestProgress, { passive: true });
    window.addEventListener("resize", requestMeasure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestProgress);
      window.removeEventListener("resize", requestMeasure);
    };
  }, [updateDesktopProgress]);
  const widthProgress = prefersReducedMotion ? 1 : easeInOutSine(clamp(desktopProgress / WIDTH_PROGRESS_MAX, 0, 1));
  const heightProgress = prefersReducedMotion ? 1 : easeInOutSine(clamp(desktopProgress / HEIGHT_PROGRESS_MAX, 0, 1));
  const mediaHeight = prefersReducedMotion ? "82svh" : `${lerp(82, 81.15, heightProgress).toFixed(3)}svh`;
  const mediaWidth = "100%";
  const frameInset = prefersReducedMotion ? 0 : lerp(FRAME_START_INSET_PERCENT, 0, widthProgress);
  const parallaxX = prefersReducedMotion ? 0 : lerp(0, PARALLAX_MAX_X, widthProgress);
  const parallaxY = prefersReducedMotion ? 0 : lerp(0, PARALLAX_MAX_Y, heightProgress);
  const parallaxScale = prefersReducedMotion ? 1 : lerp(1, PARALLAX_MAX_SCALE, widthProgress);
  const revealProgress = prefersReducedMotion ? 1 : clamp((desktopProgress - 0.28) / (0.54 - 0.28), 0, 1);
  const revealOpacity = prefersReducedMotion ? 1 : revealProgress;
  const revealY = prefersReducedMotion ? 0 : lerp(REVEAL_OFFSET, 0, revealProgress);

  const isIntroInView = useInView(introRef, { once: true, amount: 0.2 });

  const hasCardContent = Boolean(cardTitle || (cardLinks && cardLinks.length > 0) || primaryCta);
  const hasRevealContent = Boolean(revealContent);
  const hasMobileOverlapCard = hasCardContent || hasRevealContent;
  const stickySceneClassName = hasRevealContent
    ? "relative min-h-[118svh] sm:min-h-[124svh] lg:min-h-[134svh]"
    : "relative";

  const renderIntroBlock = () => {
    if (!introText) {
      return null;
    }

    return (
      <motion.div
        ref={introRef}
        className="border-t border-border/30 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9"
        initial={false}
        animate={{
          opacity: isIntroInView ? 1 : 0,
          y: isIntroInView ? 0 : 24
        }}
        transition={{
          duration: prefersReducedMotion ? 0.25 : 0.6,
          ease: EASE_SOFT
        }}
      >
        <p className="ui-subtle max-w-2xl text-sm leading-relaxed sm:text-base">
          {introText}
        </p>
      </motion.div>
    );
  };

  const renderDesktopScene = (sceneClassName: string) => (
    <section className={sceneClassName}>
      <div className={stickySceneClassName}>
        <div className="sticky top-0 flex min-h-svh items-start justify-center">
          <motion.section
            ref={desktopFrameRef}
            className="relative isolate overflow-hidden rounded-[2px] lg:rounded-none"
            style={{ height: mediaHeight, width: mediaWidth }}
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: DURATION_ENTER, ease: EASE_SOFT }}
          >
            <motion.div
              className="absolute inset-0 origin-center"
              style={{
                clipPath: `inset(0 ${frameInset.toFixed(3)}% 0 ${frameInset.toFixed(3)}%)`,
                x: parallaxX,
                y: parallaxY,
                scale: parallaxScale
              }}
            >
              <HeroMedia
                media={media}
                title={title}
                defaultOverlayOpacity={0.06}
                overlayClassName="bg-background/8"
              />
            </motion.div>

            {hasCardContent && (
              <motion.div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 sm:px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0.2 : 0.5,
                  delay: CARD_DELAY,
                  ease: EASE_SOFT
                }}
              >
                <div className="-mb-6 pointer-events-auto w-[min(92vw,320px)] rounded-xl border border-border/30 bg-card/98 px-4 py-4 shadow-soft-subtle backdrop-blur-sm sm:w-[300px] sm:px-5 sm:py-5 lg:w-[320px]">
                  {cardTitle && (
                    <p className="ui-title-serif text-base leading-tight text-foreground sm:text-[1.05rem]">
                      {cardTitle}
                    </p>
                  )}
                  {cardLinks && cardLinks.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {cardLinks.map((link) => (
                        <li key={link.href + link.label}>
                          <a
                            href={link.href}
                            className="flex flex-col rounded-lg border border-border/25 bg-card/60 px-3 py-2.5 transition-colors hover:border-border/45 hover:bg-card/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            <span className="text-sm font-medium text-foreground">
                              {link.label}
                            </span>
                            {link.subtitle && (
                              <span className="mt-0.5 text-xs text-muted-foreground">
                                {link.subtitle}
                              </span>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  {primaryCta && (
                    <a
                      href={primaryCta.href}
                      className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-accent/70 bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {primaryCta.label}
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </motion.section>
        </div>

        {hasRevealContent && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center px-3 sm:bottom-8 sm:px-4"
            style={{ opacity: revealOpacity, y: revealY }}
          >
            <div className="pointer-events-auto w-full max-w-[min(92vw,36rem)]">
              {revealContent}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );

  return (
    <div className={["relative isolate overflow-visible rounded-md", className ?? ""].filter(Boolean).join(" ")}>
      <section
        className={[
          "relative md:hidden",
          hasMobileOverlapCard ? (hasCardContent ? "pb-28" : "pb-16") : ""
        ].filter(Boolean).join(" ")}
      >
        <motion.section
          className="relative isolate overflow-hidden rounded-[2px] bg-transparent"
          initial={{ opacity: 0, y: 18, scale: 0.992 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: prefersReducedMotion ? 0.2 : 0.55, ease: EASE_SOFT }}
        >
          <div className="relative min-h-[58svh] overflow-hidden">
            <HeroMedia
              media={media}
              title={title}
              defaultOverlayOpacity={0.06}
              overlayClassName="bg-background/8"
              assetClassName="h-full w-full object-cover"
            />

            {hasCardContent && (
              <motion.div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0.2 : 0.4,
                  delay: CARD_DELAY,
                  ease: EASE_SOFT
                }}
              >
                <div className="-mb-6 pointer-events-auto w-[min(92vw,320px)] rounded-xl border border-border/30 bg-card/98 px-4 py-4 shadow-soft-subtle backdrop-blur-sm">
                  {cardTitle && (
                    <p className="ui-title-serif text-base leading-tight text-foreground">
                      {cardTitle}
                    </p>
                  )}
                  {cardLinks && cardLinks.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {cardLinks.map((link) => (
                        <li key={link.href + link.label}>
                          <a
                            href={link.href}
                            className="flex flex-col rounded-lg border border-border/25 bg-card/60 px-3 py-2.5 transition-colors hover:border-border/45 hover:bg-card/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            <span className="text-sm font-medium text-foreground">
                              {link.label}
                            </span>
                            {link.subtitle && (
                              <span className="mt-0.5 text-xs text-muted-foreground">
                                {link.subtitle}
                              </span>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  {primaryCta && (
                    <a
                      href={primaryCta.href}
                      className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-accent/70 bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {primaryCta.label}
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>

        {hasMobileOverlapCard && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 translate-y-[44%]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.2 : 0.42, delay: 0.12, ease: EASE_SOFT }}
          >
            {hasCardContent ? (
              <div className="pointer-events-auto w-[min(92vw,320px)] rounded-xl border border-border/30 bg-card/98 px-4 py-4 shadow-soft-subtle backdrop-blur-sm">
                {cardTitle && (
                  <p className="ui-title-serif text-base leading-tight text-foreground">
                    {cardTitle}
                  </p>
                )}
                {cardLinks && cardLinks.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {cardLinks.map((link) => (
                      <li key={link.href + link.label}>
                        <a
                          href={link.href}
                          className="flex flex-col rounded-lg border border-border/25 bg-card/60 px-3 py-2.5 transition-colors hover:border-border/45 hover:bg-card/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          <span className="text-sm font-medium text-foreground">
                            {link.label}
                          </span>
                          {link.subtitle && (
                            <span className="mt-0.5 text-xs text-muted-foreground">
                              {link.subtitle}
                            </span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {primaryCta && (
                  <a
                    href={primaryCta.href}
                    className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-accent/70 bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {primaryCta.label}
                  </a>
                )}
                {hasRevealContent && (
                  <div className="mt-4 border-t border-border/22 pt-4">
                    {revealContent}
                  </div>
                )}
              </div>
            ) : (
              <div className="pointer-events-auto w-full max-w-[min(92vw,36rem)]">
                {revealContent}
              </div>
            )}
          </motion.div>
        )}
      </section>

      {desktopBreakout ? (
        <div
          ref={desktopScrollRef}
          className="relative hidden md:block md:left-1/2 md:w-screen md:-translate-x-1/2 md:px-2 lg:px-3 xl:px-4"
        >
          {renderDesktopScene("relative")}
        </div>
      ) : (
        <div ref={desktopScrollRef} className="relative hidden md:block">
          {renderDesktopScene("relative")}
        </div>
      )}

      {renderIntroBlock()}
    </div>
  );
}
