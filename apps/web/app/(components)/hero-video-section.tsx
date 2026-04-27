"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button, HeroMedia, type HeroMediaConfig } from "@store-platform/ui";

type HeroLink = {
  label: string;
  subtitle?: string;
  href: string;
};

type HeroAction = {
  label: string;
  href: string;
};

type HeroVideoSectionProps = {
  media: HeroMediaConfig;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  trustLine?: string;
  quickLinks?: HeroLink[];
  primaryCta?: HeroAction;
  secondaryCta?: HeroAction;
  className?: string;
};

export function HeroVideoSection({
  media,
  title,
  subtitle,
  trustLine,
  quickLinks = [],
  primaryCta,
  secondaryCta,
  className
}: HeroVideoSectionProps): JSX.Element {
  const sectionRef = useRef<HTMLElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const hasContent = Boolean(
    title || subtitle || trustLine || primaryCta || secondaryCta || quickLinks.length > 0
  );

  useEffect(() => {
    if (prefersReducedMotion || typeof window === "undefined") return;
    const section = sectionRef.current;
    const media = mediaRef.current;
    if (!section || !media) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = Math.max(0, Math.min(1, -rect.top / (rect.height + vh)));
        const y = progress * 24;
        const scale = 1 + progress * 0.03;
        media.style.transform = `translateY(${y}px) scale(${scale})`;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={[
        "relative overflow-visible rounded-md border border-border/28 bg-card/80",
        className ?? ""
      ].join(" ").trim()}
    >
      <motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.95, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative min-h-[66svh] overflow-hidden rounded-md sm:min-h-[72svh] lg:min-h-[78svh]"
      >
        <div
          ref={mediaRef}
          style={{ willChange: "transform" }}
          className="absolute inset-0 origin-center"
        >
          <HeroMedia
            media={media}
            title={title}
            defaultOverlayOpacity={0.02}
            overlayClassName="bg-background/8"
          />
        </div>
      </motion.div>

      {hasContent && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.82, ease: [0.25, 0.1, 0.25, 1] }}
          className="px-4 pb-6 pt-20 sm:px-6 sm:pb-8 sm:pt-24 lg:px-8 lg:pb-9 lg:pt-28"
        >
          <div className="mx-auto max-w-3xl space-y-5">
            {title && (
              <h1 className="ui-title-display text-[clamp(1.92rem,7.2vw,4.6rem)] leading-[0.94] text-foreground">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="ui-subtle text-sm sm:text-base lg:text-lg">
                {subtitle}
              </p>
            )}
            {(primaryCta || secondaryCta) && (
              <div className="flex flex-wrap items-center gap-2">
                {primaryCta && (
                  <Button asChild size="md" ripple>
                    <a href={primaryCta.href}>{primaryCta.label}</a>
                  </Button>
                )}
                {secondaryCta && (
                  <Button
                    asChild
                    size="md"
                    ripple
                    className="border-border/52 bg-card/74 text-foreground hover:border-border/70 hover:bg-card/92"
                  >
                    <a href={secondaryCta.href}>{secondaryCta.label}</a>
                  </Button>
                )}
              </div>
            )}
            {trustLine && <p className="ui-subtle text-xs sm:text-sm">{trustLine}</p>}
            {quickLinks.length > 0 && (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {quickLinks.map((link) => (
                  <a
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className="rounded-[8px] border border-border/42 bg-card/62 px-3.5 py-3 transition-colors hover:border-border/62 hover:bg-card/82"
                  >
                    <p className="text-sm font-medium text-foreground/92">{link.label}</p>
                    {link.subtitle && (
                      <p className="mt-1 text-xs text-muted-foreground">{link.subtitle}</p>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </section>
  );
}
