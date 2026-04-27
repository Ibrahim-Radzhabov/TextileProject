"use client";

import * as React from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { transitionStandard } from "../motion/presets";

export type LayoutShellProps = {
  children: React.ReactNode;
  topNav?: React.ReactElement<{ scrolled?: boolean }>;
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
    const next = latest > 120;
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
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1320px] flex-col px-5 pb-24 pt-0 sm:px-8 sm:pb-16 lg:px-10">
        {topNav && (
          <motion.div
            className="sticky top-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionStandard}
          >
            <div
              className={[
                "flex items-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                isScrolled
                  ? "py-2 border-b border-border bg-background/95 backdrop-blur-sm"
                  : "py-5 border-b border-transparent bg-transparent"
              ].join(" ")}
            >
              {React.isValidElement(topNav)
                ? React.cloneElement(topNav, { scrolled: isScrolled } as { scrolled: boolean })
                : topNav}
            </div>
          </motion.div>
        )}

        <main className="min-h-0 flex-1 pt-8 sm:pt-12 lg:pt-16">{children}</main>

        {footer && (
          <motion.div
            className="mt-16 sm:mt-24 lg:mt-32"
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
