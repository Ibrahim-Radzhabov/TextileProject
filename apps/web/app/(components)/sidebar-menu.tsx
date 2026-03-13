"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type SidebarMenuItem = {
  label: string;
  href: string;
};

type SidebarMenuProps = {
  items?: SidebarMenuItem[];
};

const DEFAULT_MENU_ITEMS: SidebarMenuItem[] = [
  { label: "SALES", href: "/catalog?sale=true" },
  { label: "WOMAN", href: "/catalog?segment=woman" },
  { label: "MAN", href: "/catalog?segment=man" },
  { label: "COLLECTIONS", href: "/catalog?segment=collections" },
  { label: "ABOUT AGNONA", href: "/about" }
];

export function SidebarMenu({ items }: SidebarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const menuItems = items && items.length > 0 ? items : DEFAULT_MENU_ITEMS;

  useEffect(() => {
    if (isOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }

    return undefined;
  }, [isOpen]);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        whileTap={{ scale: 0.98 }}
      >
        <svg
          className="h-[18px] w-[18px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          {isOpen ? (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 6l12 12" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 6 6 18" />
            </>
          ) : (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.5 6.5h17" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.5 12h14" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.5 17.5h17" />
            </>
          )}
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-[58] bg-black/18 backdrop-blur-[1px]"
              aria-label="Закрыть меню"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setIsOpen(false)}
            />

            <motion.aside
              className="fixed left-0 top-0 z-[59] flex h-full w-[23rem] max-w-[86vw] flex-col border-r border-black/10 bg-[#f4f4f2] shadow-[12px_0_40px_-26px_rgba(0,0,0,0.4)]"
              aria-label="Основная навигация"
              initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -56 }}
              animate={{ opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -56 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 320, damping: 33, mass: 0.92 }
              }
            >
              <div className="flex h-16 items-center px-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.17em] text-black/85 transition-colors hover:text-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f4f2]"
                >
                  Close
                  <svg className="h-3 w-3 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              </div>

              <motion.nav
                className="mt-6 flex-1 overflow-y-auto px-6 pb-8"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: {},
                  visible: {
                    transition: shouldReduceMotion ? undefined : { staggerChildren: 0.05, delayChildren: 0.03 }
                  }
                }}
              >
                <ul className="divide-y divide-black/12">
                  {menuItems.map((item) => {
                    const isInternalLink = item.href.startsWith("/");
                    const isActive = isInternalLink && pathname === item.href.split("?")[0];
                    return (
                      <motion.li
                        key={item.label}
                        variants={{
                          hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0 }
                        }}
                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center justify-between py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-black/88 transition-colors hover:text-black/62 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f4f2]"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className={isActive ? "text-black/62" : ""}>{item.label}</span>
                          <svg
                            className="h-4 w-4 text-black/38"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
