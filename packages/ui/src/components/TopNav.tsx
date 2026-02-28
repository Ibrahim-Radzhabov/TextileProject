"use client";

import * as React from "react";
import { motion } from "framer-motion";

export type TopNavProps = {
  logo?: {
    src: string;
    alt: string;
  };
  shopName: string;
  rightSlot?: React.ReactNode;
  leftHref?: string;
};

export const TopNav: React.FC<TopNavProps> = ({
  logo,
  shopName,
  rightSlot,
  leftHref
}) => {
  const leftContent = (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-surface-soft shadow-soft-subtle backdrop-blur-sm">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.src}
            alt={logo.alt}
            className="h-7 w-7 rounded-xl object-cover"
          />
        ) : (
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            SP
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold leading-tight tracking-tight text-foreground">{shopName}</span>
        <span className="text-[11px] font-normal uppercase tracking-[0.14em] text-muted-foreground">
          Quiet Commerce
        </span>
      </div>
    </div>
  );

  return (
    <motion.header
      className="flex items-center justify-between gap-4"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {leftHref ? (
        <a
          className="rounded-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          href={leftHref}
        >
          {leftContent}
        </a>
      ) : (
        leftContent
      )}
      {rightSlot && <div className="flex shrink-0 items-center gap-2.5 text-sm">{rightSlot}</div>}
    </motion.header>
  );
};
