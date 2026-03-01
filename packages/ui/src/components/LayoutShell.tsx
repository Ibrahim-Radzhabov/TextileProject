"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Surface } from "./Surface";

export type LayoutShellProps = {
  children: React.ReactNode;
  topNav?: React.ReactNode;
  footer?: React.ReactNode;
};

export const LayoutShell: React.FC<LayoutShellProps> = ({ children, topNav, footer }) => {
  return (
    <div className="page-shell">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-4 pb-10 pt-4 sm:px-6 sm:pt-6 lg:px-10 lg:pt-8">
        {topNav && (
          <motion.div
            className="mb-7"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Surface
              tone="elevated"
              className="flex items-center justify-between rounded-xl px-4 py-3 lg:px-5"
            >
              {topNav}
            </Surface>
          </motion.div>
        )}

        <main className="min-h-0 flex-1 py-4 lg:py-6">{children}</main>

        {footer && (
          <motion.div
            className="mt-8 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.2 }}
          >
            <Surface tone="ghost" className="rounded-xl px-4 py-3 lg:px-5">
              {footer}
            </Surface>
          </motion.div>
        )}
      </div>
    </div>
  );
};
