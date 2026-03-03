"use client";

import * as React from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
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
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1360px] flex-col px-4 pb-24 pt-3 sm:px-6 sm:pb-12 sm:pt-4 lg:px-10 lg:pt-5">
        {topNav && (
          <motion.div
            className="sticky top-2 z-50 mb-5 sm:top-3 sm:mb-7"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionStandard}
          >
            <div
              className={[
                "flex items-center justify-between transition-[padding,border-color,background-color,backdrop-filter,box-shadow] duration-[var(--motion-normal)]",
                isScrolled
                  ? "rounded-2xl border border-border/52 bg-card/76 px-3 py-2 shadow-soft-subtle backdrop-blur-xl sm:px-4 sm:py-2.5"
                  : "rounded-2xl border border-transparent bg-transparent px-1 py-1"
              ].join(" ")}
            >
              {topNav}
            </div>
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
            <div className="rounded-xl border border-border/35 bg-card/58 px-4 py-2.5 backdrop-blur-md sm:px-5 sm:py-3">
              {footer}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
