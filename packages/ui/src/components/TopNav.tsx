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
  links?: Array<{
    label: string;
    href: string;
    isActive?: boolean;
  }>;
  rightSlot?: React.ReactNode;
  leftHref?: string;
};

export const TopNav: React.FC<TopNavProps> = ({
  logo,
  shopName,
  links = [],
  rightSlot,
  leftHref
}) => {
  const leftContent = (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-border/35 bg-card/70">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.src}
            alt={logo.alt}
            className="h-6 w-6 rounded-[7px] object-cover"
          />
        ) : (
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            SP
          </span>
        )}
      </div>
      <span className="ui-title-serif truncate text-[1.35rem] leading-none text-foreground sm:text-[1.5rem]">
        {shopName}
      </span>
    </div>
  );

  return (
    <motion.header
      className="grid w-full grid-cols-[1fr_auto] items-center gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-6"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitionStandard}
    >
      <div className="min-w-0">
        {leftHref ? (
          <a
            className="inline-flex rounded-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            href={leftHref}
          >
            {leftContent}
          </a>
        ) : (
          leftContent
        )}
      </div>
      {links.length > 0 && (
        <nav
          aria-label="Основная навигация"
          className="hidden items-center gap-7 md:flex"
        >
          {links.map((link) => (
            <a
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={[
                "ui-label text-[12px] normal-case tracking-[0.01em] transition-colors",
                link.isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              ].join(" ")}
              aria-current={link.isActive ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
      {rightSlot && (
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-1.5 text-sm sm:flex-nowrap sm:gap-2">
          {rightSlot}
        </div>
      )}
    </motion.header>
  );
};
