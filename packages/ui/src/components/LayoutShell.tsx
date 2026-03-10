"use client";

import * as React from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { Surface } from "./Surface";
import { transitionStandard } from "../motion/presets";

export type LayoutShellProps = {
  children: React.ReactNode;
  topNav?: React.ReactNode;
  footer?: React.ReactNode;
};

export const LayoutShell: React.FC<LayoutShellProps> = ({ children, topNav, footer }) => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isTopNavHidden, setIsTopNavHidden] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const lastScrollYRef = React.useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollYRef.current;
    const delta = latest - previous;
    lastScrollYRef.current = latest;
    const next = latest > 34;
    setIsScrolled((prev) => (prev === next ? prev : next));

    if (prefersReducedMotion) {
      setIsTopNavHidden(false);
      return;
    }

    if (latest <= 88) {
      setIsTopNavHidden(false);
      return;
    }

    if (Math.abs(delta) < 5) {
      return;
    }

    const nextHidden = delta > 0;
    setIsTopNavHidden((prev) => (prev === nextHidden ? prev : nextHidden));
  });

  return (
    <div className="page-shell">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1360px] flex-col px-4 pb-24 pt-2 sm:px-6 sm:pb-12 sm:pt-3 lg:px-10 lg:pt-4">
        {topNav && (
          <motion.div
            className="sticky top-0 z-40 mb-2 sm:mb-3"
            initial={{ opacity: 0, y: -4 }}
            animate={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: isTopNavHidden ? 0 : 1, y: isTopNavHidden ? "-115%" : 0 }
            }
            transition={transitionStandard}
          >
            <Surface
              tone={isScrolled ? "elevated" : "ghost"}
              className={[
                "mx-auto flex min-h-[3.25rem] w-[93.5%] items-center justify-between rounded-md border px-3 py-2 shadow-none backdrop-blur-0 transition-[border-color,background-color,backdrop-filter,box-shadow] duration-[var(--motion-normal)] sm:min-h-[3.5rem] sm:px-4 sm:py-2.5",
                isScrolled
                  ? "border-border/42 bg-card/88 shadow-soft-subtle backdrop-blur-xl"
                  : "border-transparent bg-transparent"
              ].join(" ")}
            >
              {topNav}
            </Surface>
          </motion.div>
        )}

        <main className="min-h-0 flex-1 pb-3 pt-0 sm:pb-4 sm:pt-0 lg:pb-6 lg:pt-0">{children}</main>

        {footer && (
          <motion.div
            className="mt-9 sm:mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...transitionStandard, delay: 0.12 }}
          >
            {footer}
          </motion.div>
        )}
      </div>
    </div>
  );
};
