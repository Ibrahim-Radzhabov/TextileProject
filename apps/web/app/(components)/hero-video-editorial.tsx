"use client";

import * as React from "react";
import { motion, useScroll, useTransform, useInView, useReducedMotion } from "framer-motion";
import { HeroMedia, type HeroMediaConfig } from "@store-platform/ui";

const EASE_SOFT = [0.25, 0.46, 0.45, 0.94] as const;
const DURATION_ENTER = 0.95;
const CARD_DELAY = 0.22;
const PARALLAX_MAX_Y = 24;
const PARALLAX_MAX_SCALE = 1.03;
const PARALLAX_MAX_X = 28;

export type HeroVideoEditorialProps = {
  media: HeroMediaConfig;
  title: string;
  cardTitle?: string;
  cardLinks?: Array< { label: string; href: string; subtitle?: string }>;
  primaryCta?: { label: string; href: string };
  introText?: string;
  className?: string;
};

export function HeroVideoEditorial({
  media,
  title,
  cardTitle,
  cardLinks,
  primaryCta,
  introText,
  className
}: HeroVideoEditorialProps): JSX.Element {
  const ref = React.useRef<HTMLElement>(null);
  const introRef = React.useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const parallaxY = useTransform(
    scrollYProgress,
    [0, 0.35],
    [0, prefersReducedMotion ? 0 : PARALLAX_MAX_Y]
  );
  const parallaxScale = useTransform(
    scrollYProgress,
    [0, 0.35],
    [1, prefersReducedMotion ? 1 : PARALLAX_MAX_SCALE]
  );
  const parallaxX = useTransform(
    scrollYProgress,
    [0, 0.35],
    [0, prefersReducedMotion ? 0 : PARALLAX_MAX_X]
  );

  const isIntroInView = useInView(introRef, { once: true, amount: 0.2 });

  const hasCardContent = Boolean(cardTitle || (cardLinks && cardLinks.length > 0) || primaryCta);

  return (
    <section
      ref={ref}
      className={["relative isolate overflow-hidden rounded-md bg-card/80 min-h-[360px] sm:min-h-[470px] lg:min-h-[540px]", className ?? ""].filter(Boolean).join(" ")}
    >
      <motion.section
        className="relative isolate h-full min-h-[360px] overflow-hidden rounded-md sm:min-h-[470px] lg:min-h-[540px]"
        initial={{ opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: DURATION_ENTER, ease: EASE_SOFT }}
      >
        <motion.div
          className="absolute inset-0 origin-center"
          style={{
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
            className="pointer-events-none absolute left-1/2 bottom-0 z-20 flex justify-center px-3 sm:px-4"
            style={{ transform: "translateX(-50%)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.2 : 0.5,
              delay: CARD_DELAY,
              ease: EASE_SOFT
            }}
          >
            <div
              className="pointer-events-auto w-[min(92vw,320px)] rounded-xl border border-border/30 bg-card/98 px-4 py-4 shadow-soft-subtle backdrop-blur-sm sm:w-[300px] sm:px-5 sm:py-5 lg:w-[320px]"
              style={{ marginBottom: "-1.5rem" }}
            >
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

      {introText && (
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
      )}
    </section>
  );
}
