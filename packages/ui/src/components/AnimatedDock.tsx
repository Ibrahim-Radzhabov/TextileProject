"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { springSnappy } from "../motion/presets";

export type AnimatedDockItem = {
  href?: string;
  onClick?: (event: React.MouseEvent) => void;
  icon: React.ReactNode;
  title: string;
  badge?: number;
};

export type AnimatedDockProps = {
  items: AnimatedDockItem[];
  className?: string;
  itemClassName?: string;
  variant?: "default" | "capsule" | "minimal";
  distribution?: "compact" | "between";
};

export const AnimatedDock: React.FC<AnimatedDockProps> = ({
  items,
  className,
  itemClassName,
  variant = "default",
  distribution = "compact"
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const isCapsule = variant === "capsule";
  const isMinimal = variant === "minimal";
  const isDistributed = distribution === "between";

  return (
    <nav
      aria-label="Быстрые действия"
      className={[
        "flex items-center",
        isDistributed
          ? "w-full justify-between gap-0"
          : isMinimal
            ? "gap-2.5 sm:gap-3"
          : isCapsule
            ? "gap-2 sm:gap-2.5"
            : "gap-1 sm:gap-1.5",
        className ?? ""
      ].filter(Boolean).join(" ")}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {items.map((item, index) => {
        const isHovered = hoveredIndex === index;
        const scale = prefersReducedMotion ? 1 : isHovered ? (isCapsule ? 1.06 : isMinimal ? 1.012 : 1.14) : 1;
        const y = prefersReducedMotion ? 0 : isHovered ? (isCapsule ? -2 : isMinimal ? -0.25 : -4) : 0;

        const content = (
          <>
            <span
              className={[
                "relative flex shrink-0 items-center justify-center rounded-full transition-colors duration-[var(--motion-fast)]",
                isMinimal
                  ? "h-[2.5rem] w-[2.5rem] border border-transparent bg-transparent text-foreground/72 shadow-none backdrop-blur-0 hover:bg-card/36 hover:text-foreground/9 [&>svg]:h-[17px] [&>svg]:w-[17px] sm:h-[2.75rem] sm:w-[2.75rem] sm:[&>svg]:h-[18px] sm:[&>svg]:w-[18px]"
                  :
                isCapsule
                  ? "h-[2.875rem] w-[2.875rem] border border-[rgba(134,111,88,0.26)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(243,237,227,0.88))] text-foreground/80 shadow-[0_10px_26px_-18px_rgba(79,58,38,0.52),inset_0_1px_0_rgba(255,255,255,0.96)] backdrop-blur-sm hover:border-[rgba(151,118,85,0.4)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,238,226,0.94))] hover:text-foreground [&>svg]:h-[18px] [&>svg]:w-[18px] sm:h-[3rem] sm:w-[3rem] sm:[&>svg]:h-[19px] sm:[&>svg]:w-[19px]"
                  : "h-8 w-8 border border-border/50 bg-card/90 text-muted-foreground hover:border-border/70 hover:bg-card hover:text-foreground sm:h-10 sm:w-10 [&>svg]:h-[15px] [&>svg]:w-[15px] sm:[&>svg]:h-[18px] sm:[&>svg]:w-[18px]"
              ].join(" ")}
            >
              {item.icon}
              {item.badge != null && item.badge > 0 && (
                <span
                  className={[
                    "pointer-events-none absolute right-[1px] top-[1px] flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium",
                    isMinimal
                      ? "h-[15px] min-w-[15px] border border-white/86 bg-[linear-gradient(180deg,#251e19,#37291f)] px-[3px] text-[8px] font-semibold tracking-[0.02em] text-[#f6eee5] shadow-[0_8px_14px_-12px_rgba(0,0,0,0.56)]"
                      :
                    isCapsule
                      ? "h-[19px] min-w-[19px] border border-white/85 bg-[linear-gradient(180deg,#231b17,#3b2a21)] px-1.5 text-[9px] font-semibold tracking-[0.03em] text-[#f8f2ea] shadow-[0_10px_18px_-12px_rgba(0,0,0,0.62)]"
                      : "h-4 border border-border/60 bg-foreground text-card"
                  ].join(" ")}
                  aria-hidden
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </span>
            <span className="sr-only">{item.title}</span>
          </>
        );

        const sharedProps = {
          "aria-label": item.title,
          className: [
            isMinimal
              ? "inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              : "inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            itemClassName ?? ""
          ].filter(Boolean).join(" "),
          onMouseEnter: () => setHoveredIndex(index),
          onFocus: () => setHoveredIndex(index),
          onBlur: () => setHoveredIndex(null)
        };

        if (item.href != null) {
          return (
            <motion.a
              key={`${item.href}-${item.title}-${index}`}
              href={item.href}
              {...sharedProps}
              animate={{ scale, y }}
              transition={springSnappy}
            >
              {content}
            </motion.a>
          );
        }

        return (
          <motion.button
            key={`${item.title}-${index}`}
            type="button"
            {...sharedProps}
            onClick={item.onClick}
            animate={{ scale, y }}
            transition={springSnappy}
          >
            {content}
          </motion.button>
        );
      })}
    </nav>
  );
};
