"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
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

function buildCardLinks(
  quickLinks: HeroLink[],
  primaryCta?: HeroAction,
  secondaryCta?: HeroAction
): HeroLink[] {
  if (quickLinks.length > 0) {
    return quickLinks.slice(0, 2);
  }

  const fallback: HeroLink[] = [];
  if (primaryCta) {
    fallback.push({ label: primaryCta.label, href: primaryCta.href });
  }
  if (secondaryCta) {
    fallback.push({ label: secondaryCta.label, href: secondaryCta.href });
  }
  return fallback;
}

export function HeroVideoSection({
  media,
  title,
  eyebrow,
  subtitle,
  trustLine,
  quickLinks = [],
  primaryCta,
  secondaryCta,
  className
}: HeroVideoSectionProps): JSX.Element {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 24]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, prefersReducedMotion ? 1 : 1.03]);
  const cardLinks = buildCardLinks(quickLinks, primaryCta, secondaryCta);
  const heroHeading = eyebrow ?? title;

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
        <motion.div
          style={{ y: mediaY, scale: mediaScale }}
          className="absolute inset-0 origin-center"
        >
          <HeroMedia
            media={media}
            title={title}
            defaultOverlayOpacity={0.02}
            overlayClassName="bg-background/8"
            revealOnReady
          />
        </motion.div>
      </motion.div>

      {cardLinks.length > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.86, ease: [0.25, 0.1, 0.25, 1], delay: 0.56 }}
            className="pointer-events-auto w-full max-w-[min(88vw,20.4rem)] translate-y-1/2 rounded-[4px] border border-border/45 bg-card px-5 py-4 text-center shadow-soft-subtle sm:px-6 sm:py-5"
          >
            {heroHeading && (
              <p className="ui-kicker text-foreground/86">{heroHeading}</p>
            )}
            <div className="mt-2.5 space-y-1.5">
              {cardLinks.map((link) => (
                <a
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className="block text-[0.77rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.28 }}
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
    </section>
  );
}
