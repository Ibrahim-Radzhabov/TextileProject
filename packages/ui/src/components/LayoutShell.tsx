"use client";

import * as React from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Surface } from "./Surface";
import { transitionStandard } from "../motion/presets";

export type LayoutShellProps = {
  children: React.ReactNode;
  topNav?: React.ReactNode;
  footer?: React.ReactNode;
};

export const LayoutShell: React.FC<LayoutShellProps> = ({ children, topNav, footer }) => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = latest > 44;
    setIsScrolled((prev) => (prev === next ? prev : next));
  });

  return (
    <div className="page-shell">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1360px] flex-col px-4 pb-24 pt-4 sm:px-6 sm:pb-12 sm:pt-6 lg:px-10 lg:pt-8">
        {topNav && (
          <motion.div
            className="sticky top-2 z-40 mb-5 sm:top-3 sm:mb-7"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionStandard}
          >
            <Surface
              tone={isScrolled ? "elevated" : "ghost"}
              className={[
                "flex items-center justify-between border transition-[padding,border-color,background-color,backdrop-filter,box-shadow] duration-[var(--motion-normal)]",
                isScrolled
                  ? "rounded-md border-border/45 bg-card/92 px-3 py-2 shadow-soft-subtle backdrop-blur-lg sm:px-4 sm:py-2.5"
                  : "rounded-md border-border/28 bg-card/70 px-3 py-2 sm:px-4 sm:py-2.5"
              ].join(" ")}
            >
              {topNav}
            </Surface>
          </motion.div>
        )}

        <main className="min-h-0 flex-1 py-3 sm:py-4 lg:py-6">{children}</main>

        {footer && (
          <motion.div
            className="mt-9 text-sm text-muted-foreground sm:mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...transitionStandard, delay: 0.12 }}
          >
            <Surface tone="ghost" className="rounded-xl px-4 py-2.5 sm:px-5 sm:py-3">
              {footer}
            </Surface>
          </motion.div>
        )}
      </div>
    </div>
  );
};
