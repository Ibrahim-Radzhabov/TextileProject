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
};

function buildMonogram(shopName: string): string {
  const parts = shopName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "ST";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export const TopNav: React.FC<TopNavProps> = ({
  logo,
  shopName,
  links = [],
  leftSlot,
  rightSlot,
  leftHref,
  tagline,
  centerBrand = false,
  mobileMenu
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const monogram = buildMonogram(shopName);
  const hasCenterNav = links.length > 0;
  const hasLeftSlot = Boolean(leftSlot);
  const hasResponsiveLeftNav = hasLeftSlot && centerBrand && hasCenterNav;
  const shouldCenterBrand = centerBrand && (!hasCenterNav || hasLeftSlot);
  const showCenterNav = hasCenterNav && !hasResponsiveLeftNav;
  const showMobileMenuTrigger = Boolean(rightSlot) && !hasLeftSlot;
  const primaryLinks = (mobileMenu?.primaryLinks ?? links).filter((link) => Boolean(link.href));
  const serviceLinks = mobileMenu?.serviceLinks ?? [];
  const contacts = mobileMenu?.contacts;
  const menuTriggerRef = React.useRef<HTMLButtonElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const leftLinkClassName =
    "inline-flex rounded-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  React.useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      menuTriggerRef.current?.focus({ preventScroll: true });
    };
  }, [isMenuOpen]);

  const leftContent = (
    <div className="flex items-center gap-2.5 sm:gap-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/45 bg-card/92 shadow-soft-subtle sm:h-10 sm:w-10">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.src}
            alt={logo.alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:text-[0.66rem]">
            {monogram}
          </span>
        )}
      </div>
      <span className="min-w-0">
        <span className="ui-title-serif block truncate text-[1.08rem] leading-none text-foreground sm:text-[1.3rem] md:text-[1.46rem]">
          {shopName}
        </span>
        {tagline && (
          <span className="ui-kicker block truncate pt-1 text-[10px] text-muted-foreground/78">
            {tagline}
          </span>
        )}
      </span>
    </div>
  );

  return (
    <motion.header
      className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3 md:gap-5"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitionStandard}
    >
      <div className="flex min-w-0 items-center justify-start gap-3">
        {!shouldCenterBrand && (leftHref ? <a className={leftLinkClassName} href={leftHref}>{leftContent}</a> : leftContent)}
        {hasResponsiveLeftNav && (
          <>
            <nav
              aria-label="Основная навигация"
            className="hidden min-[1260px]:flex min-w-0 items-center gap-5"
            >
              {links.map((link) => (
                <a
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className={[
                    "inline-flex items-center whitespace-nowrap text-[0.76rem] font-semibold uppercase tracking-[0.12em] transition-colors",
                    link.isActive ? "text-foreground/62" : "text-foreground hover:text-foreground/62"
                  ].join(" ")}
                  aria-current={link.isActive ? "page" : undefined}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="flex min-[1260px]:hidden items-center">
              {leftSlot}
            </div>
          </>
        )}
        {!hasResponsiveLeftNav && shouldCenterBrand && leftSlot && (
          <div className="flex items-center">
            {leftSlot}
          </div>
        )}
      </div>
      {showCenterNav && (
        <nav
          aria-label="Основная навигация"
          className="hidden items-center justify-center gap-0.5 lg:flex"
        >
          {links.map((link) => (
            <a
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={[
                "group relative inline-flex h-10 items-center rounded-full px-3 text-[0.9rem] transition-colors xl:px-3.5 xl:text-[0.93rem]",
                link.isActive ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
              ].join(" ")}
              aria-current={link.isActive ? "page" : undefined}
            >
              <span>{link.label}</span>
              <span
                className={[
                  "absolute inset-x-3 bottom-[0.35rem] h-px rounded-full bg-accent transition-transform duration-200",
                  link.isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                ].join(" ")}
              />
            </a>
          ))}
        </nav>
      )}
      {shouldCenterBrand && (
        <div className="flex min-w-0 items-center justify-center px-1 sm:px-2">
          {leftHref ? <a className={leftLinkClassName} href={leftHref}>{leftContent}</a> : leftContent}
        </div>
      )}
      {rightSlot && (
        <div className="flex min-w-0 items-center justify-end gap-1 text-sm sm:gap-2.5">
          {rightSlot}
          {showMobileMenuTrigger && (
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/45 bg-card/84 text-foreground transition-colors hover:border-border/65 hover:bg-card/94 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
              aria-label="Открыть меню"
              aria-expanded={isMenuOpen}
              aria-controls="top-nav-mobile-menu"
              ref={menuTriggerRef}
              onClick={() => setIsMenuOpen(true)}
            >
              <span aria-hidden="true" className="text-lg leading-none">≡</span>
            </button>
          )}
        </div>
      )}
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
                        <a
                          href={contacts.phoneHref}
                          className="block text-foreground/90 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          {contacts.phoneLabel}
                        </a>
                      )}
                      {contacts.emailLabel && contacts.emailHref && (
                        <a
                          href={contacts.emailHref}
                          className="block text-foreground/90 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
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
                    className="inline-flex h-10 w-full items-center justify-center rounded-full border border-accent/70 bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
