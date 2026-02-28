"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "./Button";
import { Surface } from "./Surface";

export type HeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
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
  primaryCta,
  secondaryCta
}) => {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute -left-24 top-[-9rem] h-72 w-72 rounded-full bg-accent/22 blur-3xl" />
        <div className="absolute right-[-7rem] top-8 h-64 w-64 rounded-full bg-foreground/8 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-soft/65 blur-3xl" />
      </div>
      <Surface
        tone="elevated"
        className="relative grid gap-8 overflow-hidden rounded-[calc(var(--radius-xl)+6px)] px-6 py-9 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 lg:px-10 lg:py-14"
      >
        <div className="max-w-2xl space-y-6">
          {eyebrow && (
            <motion.p
              className="inline-flex rounded-pill border border-accent/45 bg-accent-soft/28 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-contrast"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42 }}
            >
              {eyebrow}
            </motion.p>
          )}
          <motion.h1
            className="text-hero text-balance text-[clamp(2.3rem,5vw,4.3rem)] font-semibold leading-[1.03] tracking-[-0.03em]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              className="max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
          )}
          {(primaryCta || secondaryCta) && (
            <motion.div
              className="flex flex-wrap items-center gap-3 pt-1"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
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
          className="relative mt-2 hidden lg:block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
        >
          <div className="absolute inset-0 -z-10 rounded-[32px] border border-border/55 bg-[var(--gradient-accent-soft)] blur-2xl" />
          <div className="space-y-3 rounded-[32px] border border-border/65 bg-surface-strong p-5 shadow-floating">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Seasonal Drop</p>
              <p className="text-2xl font-semibold tracking-tight text-foreground">Essential Weaves</p>
            </div>
            <div className="premium-divider" />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border/60 bg-card/55 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Fabric Grade</p>
                <p className="mt-1 text-lg font-semibold text-foreground">A+</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/55 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Restock ETA</p>
                <p className="mt-1 text-lg font-semibold text-foreground">48h</p>
              </div>
            </div>
          </div>
        </motion.div>
      </Surface>
    </section>
  );
};
