"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type HeaderDropdownLink = {
  label: string;
  href: string;
  isActive?: boolean;
};

type HeaderDropdownMenuProps = {
  links: HeaderDropdownLink[];
  title?: string;
};

function MenuGlyph({ open }: { open: boolean }) {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <span className="relative block h-5 w-5" aria-hidden="true">
      <motion.span
        className="absolute left-1/2 top-1/2 block h-[1.5px] -translate-x-1/2 rounded-full bg-current"
        initial={false}
        animate={
          open
            ? { y: ["-6px", "0px", "0px"], rotate: [0, 0, 45], width: ["14px", "4px", "14px"] }
            : { y: "-6px", rotate: 0, width: "14px" }
        }
        transition={transition}
      />
      <motion.span
        className="absolute left-1/2 top-1/2 block h-[1.5px] -translate-x-1/2 rounded-full bg-current"
        initial={false}
        animate={
          open
            ? { opacity: [1, 1, 0], width: ["10px", "3px", "0px"] }
            : { opacity: 1, width: "10px" }
        }
        transition={transition}
      />
      <motion.span
        className="absolute left-1/2 top-1/2 block h-[1.5px] -translate-x-1/2 rounded-full bg-current"
        initial={false}
        animate={
          open
            ? { y: ["6px", "0px", "0px"], rotate: [0, 0, -45], width: ["18px", "4px", "14px"] }
            : { y: "6px", rotate: 0, width: "18px" }
        }
        transition={transition}
      />
    </span>
  );
}

export function HeaderDropdownMenu({ links, title = "Spring/Summer 2026" }: HeaderDropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const reduceMotion = useReducedMotion();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLElement>(null);
  const panelId = React.useId();

  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        ref={triggerRef}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/55 bg-card/86 text-foreground transition-colors hover:border-border/75 hover:bg-card/94 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <MenuGlyph open={open} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-[#f5f5f0]/95 backdrop-blur-[1px]"
              aria-label="Закрыть меню"
              onClick={() => setOpen(false)}
            />

            <div className="absolute right-6 top-5 z-[82]">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрыть меню"
                ref={closeRef}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/55 bg-[#f5f5f0] text-foreground transition-colors hover:border-border/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f0]"
              >
                <MenuGlyph open />
              </button>
            </div>

            <motion.section
              id={panelId}
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Навигационное меню"
              className="absolute right-6 top-20 w-[min(92vw,27rem)] rounded-[1.1rem] border border-border/55 bg-[#f5f5f0] p-6 shadow-soft"
              initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -14 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 360, damping: 32, mass: 0.9 }
              }
            >
              <div className="border-b border-border/50 pb-3">
                <p className="ui-title-serif text-[2.1rem] leading-[1.05] text-[color:#955a52]">{title}</p>
              </div>

              <motion.nav className="pt-4" aria-label="Навигация">
                <ul className="space-y-3">
                  {links.map((link, index) => (
                    <motion.li
                      key={`${link.href}-${link.label}`}
                      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { duration: 0.26, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }
                      }
                    >
                      <a
                        href={link.href}
                        className={[
                          "inline-flex text-[2rem] leading-[1.1] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f0]",
                          link.isActive ? "text-foreground" : "text-foreground/90 hover:text-foreground"
                        ].join(" ")}
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.nav>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
