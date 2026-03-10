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
};

export const AnimatedDock: React.FC<AnimatedDockProps> = ({
  items,
  className,
  itemClassName
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <nav
      aria-label="Быстрые действия"
      className={["flex items-center gap-1.5", className ?? ""].filter(Boolean).join(" ")}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {items.map((item, index) => {
        const isHovered = hoveredIndex === index;
        const scale = prefersReducedMotion ? 1 : isHovered ? 1.14 : 1;
        const y = prefersReducedMotion ? 0 : isHovered ? -4 : 0;

        const content = (
          <>
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/90 text-muted-foreground transition-colors duration-[var(--motion-fast)] hover:border-border/70 hover:bg-card hover:text-foreground sm:h-10 sm:w-10 [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-[18px] sm:[&>svg]:w-[18px]">
              {item.icon}
              {item.badge != null && item.badge > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-border/60 bg-foreground px-1 text-[10px] font-medium text-card"
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
            "inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
