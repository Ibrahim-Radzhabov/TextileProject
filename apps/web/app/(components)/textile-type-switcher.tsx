"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type TextileTab = "curtains" | "tulle";

const TAB_LABELS: Record<TextileTab, string> = {
  curtains: "Шторы",
  tulle: "Тюли"
};
export function TextileTypeSwitcher(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TextileTab>("curtains");

  return (
    <section className="mx-auto w-full max-w-[560px] rounded-md border border-border/34 bg-card/90 p-2 sm:p-2.5">
      <div className="rounded-[10px] border border-border/30 bg-background/30 p-0.5">
        <div className="grid grid-cols-2 gap-0.5">
          {(Object.keys(TAB_LABELS) as TextileTab[]).map((tab) => {
            const isActive = tab === activeTab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="relative h-10 rounded-[8px] text-[0.98rem] font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-11 sm:text-base"
              >
                {isActive ? (
                  <motion.span
                    layoutId="textile-type-switcher-pill"
                    className="absolute inset-0 rounded-[8px] border border-border/50 bg-card shadow-soft-subtle"
                    transition={{ type: "spring", stiffness: 420, damping: 36, mass: 0.9 }}
                  />
                ) : null}
                <span className="relative z-10">{TAB_LABELS[tab]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
