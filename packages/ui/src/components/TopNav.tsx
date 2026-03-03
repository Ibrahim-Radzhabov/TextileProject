"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { transitionStandard } from "../motion/presets";

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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border/45 bg-card/75 backdrop-blur-sm">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.src}
            alt={logo.alt}
            className="h-7 w-7 rounded-[8px] object-cover"
          />
        ) : (
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            SP
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium leading-tight tracking-[-0.01em] text-foreground">{shopName}</span>
        <span className="ui-kicker">
          Window Textiles
        </span>
      </div>
    </div>
  );

  return (
    <motion.header
      className="flex items-center justify-between gap-4"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitionStandard}
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
      {rightSlot && (
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 text-sm sm:flex-nowrap sm:gap-2.5">
          {rightSlot}
        </div>
      )}
    </motion.header>
  );
};
