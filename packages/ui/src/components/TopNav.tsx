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
  const showMobileMenuTrigger = Boolean(rightSlot) && !hasLeftSlot;
  const primaryLinks = (mobileMenu?.primaryLinks ?? links).filter((link) => Boolean(link.href));
  const serviceLinks = mobileMenu?.serviceLinks ?? [];
  const contacts = mobileMenu?.contacts;
  const menuTriggerRef = React.useRef<HTMLButtonElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const leftLinkClassName =
    "inline-flex rounded-[0.375rem] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(34,28,24,0.18)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F6F4F1]";

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
    <div className="flex items-center gap-2.5 min-[1280px]:gap-[14px]">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgba(34,28,24,0.14)] bg-[rgba(255,255,255,0.62)] min-[1280px]:h-[44px] min-[1280px]:w-[44px]">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.src}
            alt={logo.alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[0.58rem] font-medium uppercase tracking-[0.16em] text-[rgba(34,28,24,0.82)] min-[1280px]:text-[0.78rem]">
            {monogram}
          </span>
        )}
      </div>
      <span className="min-w-0">
        <span className="ui-title-serif block truncate text-[1.5rem] leading-[1.08] font-semibold tracking-[-0.1px] text-[#221C18] min-[1280px]:text-[30px] min-[1280px]:leading-8 min-[1280px]:tracking-[-0.2px]">
          {shopName}
        </span>
        {tagline && (
          <span className="ui-kicker block truncate pt-1 text-[10px] text-[rgba(34,28,24,0.52)]">
            {tagline}
          </span>
        )}
      </span>
    </div>
  );

  const brandNode = leftHref ? <a className={leftLinkClassName} href={leftHref}>{leftContent}</a> : leftContent;

  if (centerBrand) {
    return (
      <>
        <motion.header
          className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 min-[1280px]:grid-cols-[minmax(160px,1fr)_auto_minmax(160px,1fr)] min-[1280px]:gap-[72px]"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitionStandard}
        >
          <div className="flex min-w-0 items-center justify-start gap-3">
            {leftSlot}
          </div>

          <div className="flex min-w-0 items-center justify-center px-1">
            <div className="flex min-w-0 items-center justify-center gap-0 min-[1280px]:gap-12">
              {brandNode}
              {hasCenterNav && (
                <nav
                  aria-label="Основная навигация"
                  className="hidden min-[1280px]:flex items-center justify-center gap-[42px]"
                >
                  {links.map((link) => (
                    <a
                      key={`${link.href}-${link.label}`}
                      href={link.href}
                      className={[
                        "group relative inline-flex items-center whitespace-nowrap text-[15px] font-normal leading-5 tracking-[0.1px] transition-colors duration-[160ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(34,28,24,0.18)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F6F4F1]",
                        link.isActive ? "text-[#221C18]" : "text-[rgba(34,28,24,0.82)] hover:text-[#221C18]"
                      ].join(" ")}
                      aria-current={link.isActive ? "page" : undefined}
                    >
                      {link.label}
                      <span
                        aria-hidden="true"
                        className={[
                          "absolute inset-x-0 -bottom-3 h-px origin-center bg-[rgba(34,28,24,0.18)] transition-transform duration-[160ms] ease-out",
                          link.isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        ].join(" ")}
                      />
                    </a>
                  ))}
                </nav>
              )}
            </div>
          </div>

          <div className="flex min-w-0 items-center justify-end gap-2 text-sm sm:gap-3">
            {rightSlot}
            {showMobileMenuTrigger && (
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[rgba(34,28,24,0.82)] transition-colors duration-[160ms] ease-out hover:text-[#221C18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(34,28,24,0.18)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F6F4F1] min-[1280px]:hidden"
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
        </motion.header>
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Закрыть меню"
                className="fixed inset-0 z-[58] bg-foreground/20 backdrop-blur-[2px] min-[1280px]:hidden"
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
                className="fixed bottom-2 right-2 top-2 z-[59] flex w-[min(92vw,23rem)] flex-col overflow-hidden rounded-[1.4rem] border border-border/50 bg-card/96 p-5 shadow-soft min-[1280px]:hidden"
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
                          <a href={contacts.phoneHref} className="block text-foreground/90 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                            {contacts.phoneLabel}
                          </a>
                        )}
                        {contacts.emailLabel && contacts.emailHref && (
                          <a href={contacts.emailHref} className="block text-foreground/90 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                            {contacts.emailLabel}
                          </a>
                        )}
                        {contacts.address && <p className="ui-subtle text-sm">{contacts.address}</p>}
                      </div>
                    </section>
                  )}
                </div>

                {mobileMenu?.cta && (
                  <a
                    href={mobileMenu.cta.href}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-border/48 bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {mobileMenu.cta.label}
                  </a>
                )}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.header
      className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 min-[1280px]:gap-8"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitionStandard}
    >
      <div className="flex min-w-0 items-center justify-start gap-3">
        {leftHref ? <a className={leftLinkClassName} href={leftHref}>{leftContent}</a> : leftContent}
        {leftSlot}
      </div>
      {hasCenterNav && (
        <nav aria-label="Основная навигация" className="hidden items-center justify-center gap-[42px] min-[1280px]:flex">
          {links.map((link) => (
            <a
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={[
                "group relative inline-flex h-10 items-center text-[15px] font-normal leading-5 tracking-[0.1px] transition-colors duration-[160ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(34,28,24,0.18)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F6F4F1]",
                link.isActive ? "text-[#221C18]" : "text-[rgba(34,28,24,0.82)] hover:text-[#221C18]"
              ].join(" ")}
              aria-current={link.isActive ? "page" : undefined}
            >
              <span>{link.label}</span>
              <span className={[
                "absolute inset-x-0 -bottom-3 h-px rounded-full bg-[rgba(34,28,24,0.18)] transition-transform duration-[160ms] ease-out",
                link.isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              ].join(" ")} />
            </a>
          ))}
        </nav>
      )}
      {rightSlot && <div className="flex min-w-0 items-center justify-end gap-1 text-sm sm:gap-2.5">{rightSlot}</div>}
    </motion.header>
  );
};
