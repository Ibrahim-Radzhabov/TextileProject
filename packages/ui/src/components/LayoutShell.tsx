"use client";

import * as React from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
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
    <div className="page-shell min-h-screen">
      {topNav && (
        <motion.div
          className={[
            "sticky top-0 z-40 border-b border-foreground/[0.06] bg-background/92 transition-[background-color,backdrop-filter] duration-[var(--motion-normal)]",
            isScrolled ? "backdrop-blur-xl" : "backdrop-blur-0"
          ].join(" ")}
          initial={{ opacity: 0, y: -4 }}
          animate={
            prefersReducedMotion
              ? { opacity: 1, y: 0 }
              : { opacity: isTopNavHidden ? 0 : 1, y: isTopNavHidden ? "-108%" : 0 }
          }
          transition={transitionStandard}
        >
          <div className="mx-auto flex min-h-[4.5rem] w-full max-w-[1680px] items-center px-5 sm:px-8 min-[1280px]:min-h-[7rem] min-[1280px]:px-16">
            {topNav}
          </div>
        </motion.div>
      )}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-[1680px] flex-col px-5 pb-24 pt-4 sm:px-8 sm:pb-12 sm:pt-5 min-[1280px]:min-h-[calc(100vh-7rem)] min-[1280px]:px-16 min-[1280px]:pt-7">
        <main className="min-h-0 flex-1 pb-3 pt-0 sm:pb-4 min-[1280px]:pb-6">{children}</main>

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
