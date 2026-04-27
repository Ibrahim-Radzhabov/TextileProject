"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { transitionStandard } from "../motion/presets";

export type TopNavLink = {
  label: string;
  href: string;
  isActive?: boolean;
};

export type TopNavMobileMenu = {
  primaryLinks?: TopNavLink[];
  serviceLinks?: TopNavLink[];
  contacts?: {
    phoneLabel?: string;
    phoneHref?: string;
    emailLabel?: string;
    emailHref?: string;
    address?: string;
  };
  cta?: {
    label: string;
    href: string;
  };
};

export type TopNavProps = {
  logo?: {
    src: string;
    alt: string;
  };
  shopName: string;
  links?: TopNavLink[];
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  leftHref?: string;
  tagline?: string;
  centerBrand?: boolean;
  mobileMenu?: TopNavMobileMenu;
  scrolled?: boolean;
};

export const TopNav: React.FC<TopNavProps> = ({
  shopName,
  links = [],
  leftSlot,
  rightSlot,
  leftHref,
  tagline,
  mobileMenu,
  scrolled = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const menuTriggerRef = React.useRef<HTMLButtonElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  const primaryLinks = (mobileMenu?.primaryLinks ?? links).filter((link) => Boolean(link.href));
  const serviceLinks = mobileMenu?.serviceLinks ?? [];
  const contacts = mobileMenu?.contacts;

  const isCompact = scrolled;

  React.useEffect(() => {
    if (!isMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      menuTriggerRef.current?.focus({ preventScroll: true });
    };
  }, [isMenuOpen]);

  const brandEl = (
    <span
      className="ui-title-serif text-foreground whitespace-nowrap"
      style={{
        fontSize: isCompact ? "1.15rem" : "1.85rem",
        lineHeight: 1.1,
        fontWeight: 400,
        letterSpacing: isCompact ? "0.02em" : "0.04em",
        transition: "font-size 300ms cubic-bezier(0.16,1,0.3,1), letter-spacing 300ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {shopName}
    </span>
  );

  const mobileBrand = (
    <span className="ui-title-serif text-foreground text-[1.2rem]" style={{ fontWeight: 400, letterSpacing: "0.03em" }}>
      {shopName}
    </span>
  );

  return (
    <motion.header
      className="relative w-full"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitionStandard}
    >
      <div className="w-full">
        {/* ── Desktop header ── */}
        <div className="hidden min-[1260px]:block w-full">
          {/*
            Single DOM structure that transitions between expanded and compact.
            Expanded: 3-row monolith (utilities top-right, brand centered, nav centered)
            Compact: 1-row (brand left + nav inline + utilities right)
          */}
          <div
            className="flex w-full items-center"
            style={{
              justifyContent: isCompact ? "space-between" : "center",
              transition: "all 300ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Left group: brand + nav (compact mode places them inline) */}
            <div
              className="flex items-center"
              style={{
                flexDirection: isCompact ? "row" : "column",
                alignItems: isCompact ? "center" : "center",
                gap: isCompact ? "2rem" : "0",
                width: isCompact ? "auto" : "100%",
                transition: "gap 300ms cubic-bezier(0.16,1,0.3,1), width 300ms cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              {/* Utilities row -- only visible in expanded mode, above the brand */}
              <div
                className="flex w-full items-center justify-end"
                style={{
                  height: isCompact ? "0px" : "auto",
                  opacity: isCompact ? 0 : 1,
                  overflow: "hidden",
                  pointerEvents: isCompact ? "none" : "auto",
                  marginBottom: isCompact ? "0" : "0",
                  transition: "height 300ms cubic-bezier(0.16,1,0.3,1), opacity 200ms ease",
                }}
                aria-hidden={isCompact}
              >
                <div className="flex items-center gap-8">
                  {rightSlot}
                </div>
              </div>

              {/* Brand */}
              <div
                style={{
                  display: "flex",
                  justifyContent: isCompact ? "flex-start" : "center",
                  paddingTop: isCompact ? "0" : "0.75rem",
                  paddingBottom: isCompact ? "0" : "0.5rem",
                  width: isCompact ? "auto" : "100%",
                  transition: "padding 300ms cubic-bezier(0.16,1,0.3,1), justify-content 300ms",
                }}
              >
                {leftHref ? (
                  <a href={leftHref} className="inline-flex transition-opacity hover:opacity-80">
                    {brandEl}
                  </a>
                ) : brandEl}
              </div>

              {/* Navigation */}
              <nav
                aria-label="Основная навигация"
                className="flex items-center"
                style={{
                  justifyContent: isCompact ? "flex-start" : "center",
                  gap: isCompact ? "1.5rem" : "2rem",
                  paddingBottom: isCompact ? "0" : "0.25rem",
                  width: isCompact ? "auto" : "100%",
                  transition: "gap 300ms cubic-bezier(0.16,1,0.3,1), padding 300ms cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                {links.map((link) => (
                  <a
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className={[
                      "inline-flex items-center whitespace-nowrap font-medium uppercase transition-all duration-200",
                      link.isActive
                        ? "text-foreground"
                        : "text-foreground/45 hover:text-foreground"
                    ].join(" ")}
                    style={{
                      fontSize: isCompact ? "11px" : "11.5px",
                      letterSpacing: isCompact ? "0.14em" : "0.18em",
                      transition: "font-size 300ms, letter-spacing 300ms, color 200ms",
                    }}
                    aria-current={link.isActive ? "page" : undefined}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Right utilities -- only visible in compact mode (inline) */}
            <div
              className="flex items-center gap-6"
              style={{
                opacity: isCompact ? 1 : 0,
                width: isCompact ? "auto" : "0px",
                overflow: "hidden",
                pointerEvents: isCompact ? "auto" : "none",
                transition: "opacity 200ms ease 100ms, width 300ms cubic-bezier(0.16,1,0.3,1)",
              }}
              aria-hidden={!isCompact}
            >
              {rightSlot}
            </div>
          </div>
        </div>

        {/* ── Mobile header ── */}
        <div className="grid min-[1260px]:hidden grid-cols-[auto_1fr_auto] items-center w-full">
          <div className="flex items-center">
            {leftSlot}
          </div>
          <div className="flex justify-center">
            {leftHref ? (
              <a href={leftHref} className="inline-flex transition-opacity hover:opacity-80">
                {mobileBrand}
              </a>
            ) : mobileBrand}
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            {rightSlot}
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Закрыть меню"
              className="fixed inset-0 z-[58] bg-foreground/20 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18 }}
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.aside
              id="top-nav-mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Мобильная навигация"
              className="fixed bottom-2 right-2 top-2 z-[59] flex w-[min(92vw,23rem)] flex-col overflow-hidden rounded-[1.4rem] border border-border/50 bg-card/96 p-5 shadow-soft md:hidden"
              initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 26 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 26 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 34, mass: 0.9 }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="ui-title-serif truncate text-[1.05rem] text-foreground">{shopName}</p>
                  {tagline && <p className="ui-kicker truncate pt-1 text-[10px] text-muted-foreground/78">{tagline}</p>}
                </div>
                <button
                  type="button"
                  ref={closeButtonRef}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/45 bg-card/84 text-foreground transition-colors hover:border-border/65 hover:bg-card/94 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label="Закрыть меню"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span aria-hidden="true" className="text-lg leading-none">×</span>
                </button>
              </div>

              <div className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1">
                {primaryLinks.length > 0 && (
                  <section>
                    <p className="ui-kicker text-[10px] text-muted-foreground/78">Навигация</p>
                    <nav className="mt-2 space-y-1.5" aria-label="Основная навигация">
                      {primaryLinks.map((link) => (
                        <a
                          key={`${link.href}-${link.label}`}
                          href={link.href}
                          aria-current={link.isActive ? "page" : undefined}
                          className={[
                            "flex min-h-11 items-center rounded-xl border border-border/42 px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            link.isActive ? "bg-accent/12 text-foreground" : "bg-card/70 text-muted-foreground hover:text-foreground"
                          ].join(" ")}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.label}
                        </a>
                      ))}
                    </nav>
                  </section>
                )}

                {serviceLinks.length > 0 && (
                  <section>
                    <p className="ui-kicker text-[10px] text-muted-foreground/78">Клиентам</p>
                    <div className="mt-2 space-y-1.5">
                      {serviceLinks.map((link) => (
                        <a
                          key={`${link.href}-${link.label}`}
                          href={link.href}
                          className="flex min-h-11 items-center rounded-xl border border-border/42 bg-card/70 px-3.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {contacts && (
                  <section>
                    <p className="ui-kicker text-[10px] text-muted-foreground/78">Контакты</p>
                    <div className="mt-2 space-y-2 text-sm">
                      {contacts.phoneLabel && contacts.phoneHref && (
                        <a href={contacts.phoneHref} className="block text-foreground/90 transition-colors hover:text-foreground">
                          {contacts.phoneLabel}
                        </a>
                      )}
                      {contacts.emailLabel && contacts.emailHref && (
                        <a href={contacts.emailHref} className="block text-foreground/90 transition-colors hover:text-foreground">
                          {contacts.emailLabel}
                        </a>
                      )}
                      {contacts.address && <p className="text-muted-foreground">{contacts.address}</p>}
                    </div>
                  </section>
                )}
              </div>

              {mobileMenu?.cta && (
                <div className="border-t border-border/45 pt-4">
                  <a
                    href={mobileMenu.cta.href}
                    className="inline-flex h-10 w-full items-center justify-center rounded-full border border-accent/70 bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {mobileMenu.cta.label}
                  </a>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
