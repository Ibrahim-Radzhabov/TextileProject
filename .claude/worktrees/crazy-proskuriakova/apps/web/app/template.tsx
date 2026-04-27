"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

const pageTransition = {
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1] as const
};

export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}
