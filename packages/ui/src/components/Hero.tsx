"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "./Button";
import { Surface } from "./Surface";

export type HeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  media?: {
    type: "image" | "video";
    src: string;
    mobileSrc?: string;
    poster?: string;
    alt?: string;
    overlayOpacity?: number;
  };
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
};

export const Hero: React.FC<HeroProps> = ({
  eyebrow,
  title,
  subtitle,
  media,
  primaryCta,
  secondaryCta
}) => {
  const overlayOpacity = media?.overlayOpacity ?? 0.48;

  return (
    <section className="relative isolate overflow-hidden">
      <Surface
        tone="elevated"
        className="relative grid gap-8 overflow-hidden rounded-xl px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 lg:px-10"
      >
        {media && (
          <div className="pointer-events-none absolute inset-0">
            {media.type === "video" ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={media.poster}
                className="h-full w-full object-cover"
              >
                {media.mobileSrc && <source src={media.mobileSrc} media="(max-width: 768px)" />}
                <source src={media.src} />
              </video>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media.mobileSrc ?? media.src}
                alt={media.alt ?? title}
                className="h-full w-full object-cover"
              />
            )}
            <div
              className="absolute inset-0 bg-background"
              style={{ opacity: overlayOpacity }}
            />
          </div>
        )}
        <div className="relative z-10 max-w-2xl space-y-6">
          {eyebrow && (
            <motion.p
              className="inline-flex rounded-full border border-border/55 bg-card/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {eyebrow}
            </motion.p>
          )}
          <motion.h1
            className="text-hero text-balance font-serif text-[clamp(2.2rem,5vw,4rem)] font-normal leading-[1.02] tracking-[-0.02em]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.03 }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              className="max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
            >
              {subtitle}
            </motion.p>
          )}
          {(primaryCta || secondaryCta) && (
            <motion.div
              className="flex flex-wrap items-center gap-3 pt-1"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.12 }}
            >
              {primaryCta && (
                <Button asChild>
                  <a href={primaryCta.href}>{primaryCta.label}</a>
                </Button>
              )}
              {secondaryCta && (
                <Button variant="secondary" size="sm" asChild>
                  <a href={secondaryCta.href}>{secondaryCta.label}</a>
                </Button>
              )}
            </motion.div>
          )}
        </div>

        <motion.div
          className="relative z-10 mt-2 hidden lg:block"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <div className="space-y-3 rounded-xl border border-border/45 bg-card/78 p-5">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Seasonal Drop</p>
              <p className="text-2xl font-medium tracking-tight text-foreground">Essential Weaves</p>
            </div>
            <div className="premium-divider" />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-[10px] border border-border/45 bg-card/58 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Fabric Grade</p>
                <p className="mt-1 text-lg font-medium text-foreground">A+</p>
              </div>
              <div className="rounded-[10px] border border-border/45 bg-card/58 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">Restock ETA</p>
                <p className="mt-1 text-lg font-medium text-foreground">48h</p>
              </div>
            </div>
          </div>
        </motion.div>
      </Surface>
    </section>
  );
};
