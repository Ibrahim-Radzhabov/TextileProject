"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion
} from "framer-motion";
import { HeroMedia, type HeroMediaConfig } from "@store-platform/ui";

/* ── constants ─────────────────────────────────────────────── */
const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;
const EASE_SOFT = [0.25, 0.46, 0.45, 0.94] as const;

/* stagger delays for text reveal */
const STAGGER_TITLE = 0.3;
const STAGGER_LINKS = 0.5;
const STAGGER_LINK_STEP = 0.1;
const STAGGER_CTA = 0.8;
const STAGGER_INTRO = 1.0;

/* scroll-linked expansion: hero starts framed, expands to full bleed */
const FRAME_INSET_START = 2.5; /* % inset on left/right at scroll=0 */
const FRAME_INSET_TOP = 0; /* no top inset */
const FRAME_BORDER_RADIUS_START = 8; /* px, rounded corners at start */
const EXPAND_END = 0.35; /* full bleed reached at 35% of viewport scrolled */

/* scroll fadeout for text overlay */
const FADEOUT_START = 0.08;
const FADEOUT_END = 0.45;

/* ── helpers ───────────────────────────────────────────────── */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/* ── types ─────────────────────────────────────────────────── */
export type HeroVideoEditorialProps = {
  media: HeroMediaConfig;
  title: string;
  cardTitle?: string;
  cardLinks?: Array<{ label: string; href: string; subtitle?: string }>;
  primaryCta?: { label: string; href: string };
  introText?: string;
  revealContent?: React.ReactNode;
  desktopBreakout?: boolean;
  className?: string;
};

/* ── component ─────────────────────────────────────────────── */
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
  const prefersReducedMotion = useReducedMotion();
  const heroRef = React.useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = React.useState({
    /* expansion */
    insetX: FRAME_INSET_START,
    borderRadius: FRAME_BORDER_RADIUS_START,
    /* text fadeout */
    textOpacity: 1,
    textY: 0
  });

  /* ── unified scroll handler: expansion + fadeout ── */
  React.useEffect(() => {
    if (prefersReducedMotion || typeof window === "undefined") return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = heroRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const scrolled = -rect.top / vh;

        /* expansion: 0→EXPAND_END maps to inset→0 */
        const expandProgress = easeOutCubic(clamp(scrolled / EXPAND_END, 0, 1));
        const insetX = FRAME_INSET_START * (1 - expandProgress);
        const borderRadius = FRAME_BORDER_RADIUS_START * (1 - expandProgress);

        /* text fadeout */
        const fadeProgress = clamp(
          (scrolled - FADEOUT_START) / (FADEOUT_END - FADEOUT_START),
          0,
          1
        );

        setScrollState({
          insetX,
          borderRadius,
          textOpacity: 1 - fadeProgress,
          textY: -fadeProgress * 40
        });
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [prefersReducedMotion]);

  const hasCardContent = Boolean(
    cardTitle || (cardLinks && cardLinks.length > 0) || primaryCta
  );

  /* ── shared text overlay ── */
  const renderOverlayContent = (isMobile: boolean) => {
    if (!hasCardContent) return null;

    const baseDuration = prefersReducedMotion ? 0.15 : 0.7;
    const baseDelay = (d: number) => (prefersReducedMotion ? 0 : d);

    return (
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center pb-8 sm:pb-12 lg:pb-16"
        style={
          !isMobile && !prefersReducedMotion
            ? { opacity: scrollState.textOpacity, y: scrollState.textY }
            : undefined
        }
      >
        <div className="pointer-events-auto text-center">
          {/* title / season */}
          {cardTitle && (
            <motion.p
              className="font-display text-lg tracking-wide text-foreground sm:text-xl lg:text-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: baseDuration,
                delay: baseDelay(STAGGER_TITLE),
                ease: EASE_PREMIUM
              }}
            >
              {cardTitle}
            </motion.p>
          )}

          {/* navigation links */}
          {cardLinks && cardLinks.length > 0 && (
            <div className="mt-5 flex items-center gap-8 sm:mt-6 lg:mt-8">
              {cardLinks.map((link, i) => (
                <motion.a
                  key={link.href + link.label}
                  href={link.href}
                  className="text-sm tracking-[0.14em] uppercase text-foreground/70 transition-colors duration-300 hover:text-foreground sm:text-[13px]"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: baseDuration,
                    delay: baseDelay(STAGGER_LINKS + i * STAGGER_LINK_STEP),
                    ease: EASE_PREMIUM
                  }}
                >
                  — {link.label} —
                </motion.a>
              ))}
            </div>
          )}

          {/* CTA */}
          {primaryCta && (
            <motion.div
              className="mt-6 sm:mt-8"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: baseDuration,
                delay: baseDelay(STAGGER_CTA),
                ease: EASE_PREMIUM
              }}
            >
              <a
                href={primaryCta.href}
                className="inline-block border-b border-foreground/40 pb-0.5 text-xs tracking-[0.16em] uppercase text-foreground/80 transition-all duration-300 hover:border-foreground hover:text-foreground sm:text-[11px]"
              >
                {primaryCta.label}
              </a>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  /* ── intro text block below hero ── */
  const renderIntroBlock = () => {
    if (!introText) return null;

    return (
      <motion.div
        className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: prefersReducedMotion ? 0.2 : 0.6,
          delay: prefersReducedMotion ? 0 : STAGGER_INTRO,
          ease: EASE_SOFT
        }}
      >
        <p className="ui-subtle mx-auto max-w-2xl text-center text-sm leading-relaxed sm:text-base">
          {introText}
        </p>
      </motion.div>
    );
  };

  /* ── mobile hero ── */
  const renderMobile = () => (
    <section className="relative md:hidden">
      <motion.div
        className="relative isolate overflow-hidden"
        style={{ height: "85svh", minHeight: "480px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0.2 : 0.8, ease: EASE_SOFT }}
      >
        <div className={`absolute inset-0 ${prefersReducedMotion ? "" : "hero-ken-burns"}`}>
          <HeroMedia
            media={media}
            title={title}
            defaultOverlayOpacity={0.12}
            overlayClassName="bg-gradient-to-t from-white/50 via-white/10 to-transparent"
            assetClassName="h-full w-full object-cover"
          />
        </div>
        {renderOverlayContent(true)}
      </motion.div>
    </section>
  );

  /* ── desktop hero ── */
  const renderDesktop = () => {
    /* clip-path for scroll-linked expansion */
    const clipInset = prefersReducedMotion
      ? "inset(0 0 0 0)"
      : `inset(${FRAME_INSET_TOP}px ${scrollState.insetX.toFixed(3)}% 0 ${scrollState.insetX.toFixed(3)}%)`;
    const radius = prefersReducedMotion ? 0 : scrollState.borderRadius;

    const scene = (
      <section ref={heroRef} className="relative">
        <motion.div
          className="relative isolate overflow-hidden"
          style={{
            height: "100svh",
            minHeight: "600px",
            clipPath: clipInset,
            borderRadius: `${radius.toFixed(2)}px`
          }}
          initial={{ opacity: 0, scale: 1.01 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: prefersReducedMotion ? 0.2 : 1.0, ease: EASE_SOFT }}
        >
          {/* video/image with Ken Burns zoom */}
          <div className={`absolute inset-0 ${prefersReducedMotion ? "" : "hero-ken-burns"}`}>
            <HeroMedia
              media={media}
              title={title}
              defaultOverlayOpacity={0.08}
              overlayClassName="bg-gradient-to-t from-white/50 via-white/10 to-transparent"
            />
          </div>

          {/* overlay content with scroll fadeout */}
          {renderOverlayContent(false)}
        </motion.div>
      </section>
    );

    if (desktopBreakout) {
      return (
        <div className="relative hidden md:block md:left-1/2 md:w-screen md:-translate-x-1/2">
          {scene}
        </div>
      );
    }

    return (
      <div className="relative hidden md:block">
        {scene}
      </div>
    );
  };

  return (
    <div
      className={[
        "relative isolate overflow-visible",
        className ?? ""
      ].filter(Boolean).join(" ")}
    >
      {renderMobile()}
      {renderDesktop()}
      {renderIntroBlock()}
    </div>
  );
}
