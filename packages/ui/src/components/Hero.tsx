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
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="h-full w-full premium-gradient mix-blend-screen blur-3xl" />
      </div>
      <Surface className="relative flex flex-col gap-6 px-6 py-10 sm:px-8 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-14">
        <div className="max-w-xl space-y-5">
          {eyebrow && (
            <motion.p
              className="text-xs font-medium uppercase tracking-[0.2em] text-accent"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {eyebrow}
            </motion.p>
          )}
          <motion.h1
            className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              className="max-w-lg text-balance text-sm text-muted-foreground sm:text-base"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
          )}
          {(primaryCta || secondaryCta) && (
            <motion.div
              className="flex flex-wrap items-center gap-3 pt-2"
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
                <Button variant="ghost" size="sm" asChild>
                  <a href={secondaryCta.href}>{secondaryCta.label}</a>
                </Button>
              )}
            </motion.div>
          )}
        </div>
        <motion.div
          className="mt-6 flex flex-1 justify-end lg:mt-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="h-44 w-full max-w-sm rounded-3xl border border-accent-soft/50 bg-gradient-to-br from-accent-soft/30 via-card/80 to-emerald-400/10 shadow-soft-subtle backdrop-blur-3xl" />
        </motion.div>
      </Surface>
    </section>
  );
};

