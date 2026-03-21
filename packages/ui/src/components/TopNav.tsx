"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { transitionStandard } from "../motion/presets";

export type TopNavLink = {
  label: string;
  href: string;
  isActive?: boolean;
};

export type TopNavProps = {
  logo?: {
    src: string;
    alt: string;
  };
  shopName: string;
  links?: TopNavLink[];
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  leftHref?: string;
  tagline?: string;
  centerBrand?: boolean;
};

function buildMonogram(shopName: string): string {
  const parts = shopName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "ST";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export const TopNav: React.FC<TopNavProps> = ({
  logo,
  shopName,
  links = [],
  leftSlot,
  rightSlot,
  leftHref,
  tagline,
  centerBrand = false
}) => {
  const monogram = buildMonogram(shopName);
  const hasCenterNav = links.length > 0;
  const leftLinkClassName =
    "inline-flex rounded-[0.375rem] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(34,28,24,0.18)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F6F4F1]";

  const leftContent = (
    <div className="flex items-center gap-2.5 min-[1280px]:gap-[14px]">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgba(34,28,24,0.14)] bg-[rgba(255,255,255,0.62)] min-[1280px]:h-[44px] min-[1280px]:w-[44px]">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.src}
            alt={logo.alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[0.58rem] font-medium uppercase tracking-[0.16em] text-[rgba(34,28,24,0.82)] min-[1280px]:text-[0.78rem]">
            {monogram}
          </span>
        )}
      </div>
      <span className="min-w-0">
        <span className="ui-title-serif block truncate text-[1.5rem] leading-[1.08] font-semibold tracking-[-0.1px] text-[#221C18] min-[1280px]:text-[30px] min-[1280px]:leading-8 min-[1280px]:tracking-[-0.2px]">
          {shopName}
        </span>
        {tagline && (
          <span className="ui-kicker block truncate pt-1 text-[10px] text-[rgba(34,28,24,0.52)]">
            {tagline}
          </span>
        )}
      </span>
    </div>
  );

  const brandNode = leftHref ? <a className={leftLinkClassName} href={leftHref}>{leftContent}</a> : leftContent;

  if (centerBrand) {
    return (
      <>
        <motion.header
          className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 min-[1280px]:grid-cols-[minmax(160px,1fr)_auto_minmax(160px,1fr)] min-[1280px]:gap-[72px]"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitionStandard}
        >
          <div className="flex min-w-0 items-center justify-start gap-3">
            {leftSlot}
          </div>

          <div className="flex min-w-0 items-center justify-center px-1">
            <div className="flex min-w-0 items-center justify-center gap-0 min-[1280px]:gap-12">
              {brandNode}
              {hasCenterNav && (
                <nav
                  aria-label="Основная навигация"
                  className="hidden min-[1280px]:flex items-center justify-center gap-[42px]"
                >
                  {links.map((link) => (
                    <a
                      key={`${link.href}-${link.label}`}
                      href={link.href}
                      className={[
                        "group relative inline-flex items-center whitespace-nowrap text-[15px] font-normal leading-5 tracking-[0.1px] transition-colors duration-[160ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(34,28,24,0.18)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F6F4F1]",
                        link.isActive ? "text-[#221C18]" : "text-[rgba(34,28,24,0.82)] hover:text-[#221C18]"
                      ].join(" ")}
                      aria-current={link.isActive ? "page" : undefined}
                    >
                      {link.label}
                      <span
                        aria-hidden="true"
                        className={[
                          "absolute inset-x-0 -bottom-3 h-px origin-center bg-[rgba(34,28,24,0.18)] transition-transform duration-[160ms] ease-out",
                          link.isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        ].join(" ")}
                      />
                    </a>
                  ))}
                </nav>
              )}
            </div>
          </div>

          <div className="flex min-w-0 items-center justify-end gap-2 text-sm sm:gap-3">
            {rightSlot}
          </div>
        </motion.header>
      </>
    );
  }

  return (
    <motion.header
      className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 min-[1280px]:gap-8"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitionStandard}
    >
      <div className="flex min-w-0 items-center justify-start gap-3">
        {leftHref ? <a className={leftLinkClassName} href={leftHref}>{leftContent}</a> : leftContent}
        {leftSlot}
      </div>
      {hasCenterNav && (
        <nav aria-label="Основная навигация" className="hidden items-center justify-center gap-[42px] min-[1280px]:flex">
          {links.map((link) => (
            <a
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={[
                "group relative inline-flex h-10 items-center text-[15px] font-normal leading-5 tracking-[0.1px] transition-colors duration-[160ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(34,28,24,0.18)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F6F4F1]",
                link.isActive ? "text-[#221C18]" : "text-[rgba(34,28,24,0.82)] hover:text-[#221C18]"
              ].join(" ")}
              aria-current={link.isActive ? "page" : undefined}
            >
              <span>{link.label}</span>
              <span className={[
                "absolute inset-x-0 -bottom-3 h-px rounded-full bg-[rgba(34,28,24,0.18)] transition-transform duration-[160ms] ease-out",
                link.isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              ].join(" ")} />
            </a>
          ))}
        </nav>
      )}
      {rightSlot && <div className="flex min-w-0 items-center justify-end gap-1 text-sm sm:gap-2.5">{rightSlot}</div>}
    </motion.header>
  );
};
