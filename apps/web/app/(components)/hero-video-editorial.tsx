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

/* scroll fadeout range (viewport fraction) */
const FADEOUT_START = 0.05; /* start fading when 5% scrolled past top */
const FADEOUT_END = 0.45; /* fully faded at 45% scrolled */

/* ── helpers ───────────────────────────────────────────────── */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
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
  const overlayRef = React.useRef<HTMLDivElement>(null);

  /* ── scroll-linked fadeout for overlay content ── */
  React.useEffect(() => {
    if (prefersReducedMotion || typeof window === "undefined") return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = heroRef.current;
        const overlay = overlayRef.current;
        if (!el || !overlay) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        /* progress: 0 = hero top at viewport top, 1 = hero bottom at viewport top */
        const scrolled = -rect.top / vh;
        const progress = clamp(
          (scrolled - FADEOUT_START) / (FADEOUT_END - FADEOUT_START),
          0,
          1
        );
        const opacity = 1 - progress;
        const y = -progress * 40; /* moves up 40px as it fades */
        overlay.style.opacity = String(opacity);
        overlay.style.transform = `translateY(${y}px)`;
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
        ref={!isMobile ? overlayRef : undefined}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center pb-8 sm:pb-12 lg:pb-16"
        style={
          !isMobile && !prefersReducedMotion
            ? { willChange: "opacity, transform" }
            : undefined
        }
      >
        <div className="pointer-events-auto text-center">
          {/* title / season */}
          {cardTitle && (
            <motion.p
              className="font-display text-lg tracking-wide text-white sm:text-xl lg:text-2xl"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.25)" }}
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

          {/* navigation links (Women / Men) */}
          {cardLinks && cardLinks.length > 0 && (
            <div className="mt-5 flex items-center gap-8 sm:mt-6 lg:mt-8">
              {cardLinks.map((link, i) => (
                <motion.a
                  key={link.href + link.label}
                  href={link.href}
                  className="text-sm tracking-[0.14em] uppercase text-white/90 transition-colors duration-300 hover:text-white sm:text-[13px]"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.2)" }}
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
                className="inline-block border-b border-white/50 pb-0.5 text-xs tracking-[0.16em] uppercase text-white/90 transition-all duration-300 hover:border-white hover:text-white sm:text-[11px]"
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
        {/* video/image with Ken Burns */}
        <div className={`absolute inset-0 ${prefersReducedMotion ? "" : "hero-ken-burns"}`}>
          <HeroMedia
            media={media}
            title={title}
            defaultOverlayOpacity={0.12}
            overlayClassName="bg-gradient-to-t from-black/30 via-black/5 to-transparent"
            assetClassName="h-full w-full object-cover"
          />
        </div>

        {/* overlay content */}
        {renderOverlayContent(true)}
      </motion.div>
    </section>
  );

  /* ── desktop hero ── */
  const renderDesktop = () => {
    const scene = (
      <section ref={heroRef} className="relative">
        <motion.div
          className="relative isolate overflow-hidden"
          style={{ height: "100svh", minHeight: "600px" }}
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
              overlayClassName="bg-gradient-to-t from-black/28 via-black/4 to-transparent"
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
      {revealContent}
    </div>
  );
}
