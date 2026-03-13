"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type SidebarMenuLink = {
  label: string;
  href: string;
  description?: string;
};

export type SidebarMenuPromo = {
  title: string;
  subtitle: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

export type SidebarMenuItem = {
  id: string;
  label: string;
  href?: string;
  summary?: string;
  items?: SidebarMenuLink[];
  promos?: SidebarMenuPromo[];
};

type SidebarMenuProps = {
  items?: SidebarMenuItem[];
  footerLabel?: string;
  footerHref?: string;
  footerSecondary?: string;
};

const DEFAULT_MENU_ITEMS: SidebarMenuItem[] = [
  {
    id: "sales",
    label: "SALES",
    href: "/catalog?rail=bestsellers",
    summary: "A curated edit of signature pieces and seasonal highlights.",
    items: [
      { label: "Best Sellers", href: "/catalog?rail=bestsellers" },
      { label: "New In", href: "/catalog?rail=new" }
    ]
  },
  {
    id: "woman",
    label: "WOMAN",
    href: "/catalog?view=texture",
    summary: "Refined silhouettes and tactile layers.",
    items: [
      { label: "Textures", href: "/catalog?view=texture" },
      { label: "Light Play", href: "/catalog?view=light" }
    ]
  }
];

const DESKTOP_DETAIL_QUERY = "(min-width: 960px)";
const SOFT_TEXTILE_EASE = [0.22, 1, 0.36, 1] as const;

function hasSectionDetails(item: SidebarMenuItem): boolean {
  return Boolean(item.summary || item.items?.length || item.promos?.length);
}

function isInternalHref(href: string): boolean {
  return href.startsWith("/");
}

function hrefMatchesLocation(
  href: string | undefined,
  pathname: string,
  searchParams: Pick<URLSearchParams, "get" | "entries">
): boolean {
  if (!href || !isInternalHref(href)) {
    return false;
  }

  const url = new URL(href, "https://storefront.local");
  if (url.pathname !== pathname) {
    return false;
  }

  return Array.from(url.searchParams.entries()).every(([key, value]) => searchParams.get(key) === value);
}

function resolveMatchingItemId(
  menuItems: SidebarMenuItem[],
  pathname: string,
  searchParams: Pick<URLSearchParams, "get" | "entries">
): string | null {
  for (const item of menuItems) {
    if (hrefMatchesLocation(item.href, pathname, searchParams)) {
      return item.id;
    }

    if ((item.items ?? []).some((child) => hrefMatchesLocation(child.href, pathname, searchParams))) {
      return item.id;
    }
  }

  return null;
}

function SidebarHref({
  href,
  className,
  onClick,
  children
}: {
  href: string;
  className: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  if (isInternalHref(href)) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

export function SidebarMenu({
  items,
  footerLabel,
  footerHref,
  footerSecondary
}: SidebarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [supportsDesktopDetail, setSupportsDesktopDetail] = useState(false);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const shouldReduceMotion = useReducedMotion();
  const menuItems = items && items.length > 0 ? items : DEFAULT_MENU_ITEMS;
  const matchingItemId = useMemo(
    () => resolveMatchingItemId(menuItems, pathname, searchParams),
    [menuItems, pathname, searchParams, searchParamsKey]
  );
  const firstDetailItemId = useMemo(
    () => menuItems.find((item) => hasSectionDetails(item))?.id ?? null,
    [menuItems]
  );
  const defaultDesktopItemId = matchingItemId ?? firstDetailItemId;
  const activeItem = useMemo(
    () => menuItems.find((item) => item.id === activeItemId) ?? null,
    [activeItemId, menuItems]
  );
  const showDesktopDetail = supportsDesktopDetail && activeItem !== null && hasSectionDetails(activeItem);
  const showMobileDetail = !supportsDesktopDetail && activeItem !== null && hasSectionDetails(activeItem);
  const overlayTransition = shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: SOFT_TEXTILE_EASE };
  const panelTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 290, damping: 31, mass: 0.96 };
  const listStaggerTransition = shouldReduceMotion
    ? undefined
    : { staggerChildren: 0.04, delayChildren: 0.03 };
  const listItemTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: SOFT_TEXTILE_EASE };
  const detailStageTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: SOFT_TEXTILE_EASE };
  const desktopDetailTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: SOFT_TEXTILE_EASE };
  const mobileStageTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: SOFT_TEXTILE_EASE };

  useEffect(() => {
    setPortalNode(document.body);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_DETAIL_QUERY);
    const applyMatch = (event: MediaQueryList | MediaQueryListEvent) => {
      setSupportsDesktopDetail(event.matches);
    };

    applyMatch(mediaQuery);
    const listener = (event: MediaQueryListEvent) => applyMatch(event);
    mediaQuery.addEventListener("change", listener);
    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setActiveItemId(null);
      return undefined;
    }

    if (supportsDesktopDetail) {
      setActiveItemId((current) => {
        if (current && menuItems.some((item) => item.id === current && hasSectionDetails(item))) {
          return current;
        }

        return defaultDesktopItemId;
      });
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [defaultDesktopItemId, isOpen, menuItems, supportsDesktopDetail]);

  const handleRootItemClick = (item: SidebarMenuItem) => {
    if (!hasSectionDetails(item)) {
      return;
    }

    setActiveItemId(item.id);
  };

  const handleRootItemPreview = (item: SidebarMenuItem) => {
    if (!supportsDesktopDetail || !hasSectionDetails(item) || activeItemId === item.id) {
      return;
    }

    setActiveItemId(item.id);
  };

  const rootPanel = (
    <div className="flex h-full w-[23rem] max-w-full shrink-0 flex-col">
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
        className="mt-4 flex-1 overflow-y-auto px-6 pb-8"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={{
          hidden: {},
          visible: {
            transition: listStaggerTransition
          }
        }}
      >
        <ul className="divide-y divide-black/12">
          {menuItems.map((item) => {
            const hasDetails = hasSectionDetails(item);
            const matchesCurrentLocation = hrefMatchesLocation(item.href, pathname, searchParams)
              || (item.items ?? []).some((child) => hrefMatchesLocation(child.href, pathname, searchParams));
            const isSelected = activeItemId === item.id;
            const labelClassName = [
              "transition-colors duration-300",
              isSelected || matchesCurrentLocation ? "text-black/62" : "text-black/88"
            ].join(" ");

            return (
              <motion.li
                key={item.id}
                variants={{
                  hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={listItemTransition}
              >
                {hasDetails ? (
                  <button
                    type="button"
                    onClick={() => handleRootItemClick(item)}
                    onPointerEnter={() => handleRootItemPreview(item)}
                    onMouseEnter={() => handleRootItemPreview(item)}
                    onFocus={() => handleRootItemPreview(item)}
                    className={[
                      "group flex w-full items-center justify-between rounded-2xl px-3 py-4 text-left text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f4f2]",
                      isSelected ? "bg-[#ece7d5]/90 text-black/68" : "text-black/88 hover:bg-[#efebe0]/55 hover:text-black/62"
                    ].join(" ")}
                    aria-expanded={isSelected}
                  >
                    <span className={labelClassName}>{item.label}</span>
                    <svg
                      className={[
                        "h-4 w-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        isSelected
                          ? "translate-x-0.5 text-black/46"
                          : "text-black/28 group-hover:translate-x-0.5 group-hover:text-black/40"
                      ].join(" ")}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : item.href ? (
                  <SidebarHref
                    href={item.href}
                    className="flex items-center justify-between py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-black/88 transition-colors hover:text-black/62 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f4f2]"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className={labelClassName}>{item.label}</span>
                    <svg
                      className="h-4 w-4 text-black/38"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 5l7 7-7 7" />
                    </svg>
                  </SidebarHref>
                ) : (
                  <div className="py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-black/88">{item.label}</div>
                )}
              </motion.li>
            );
          })}
        </ul>
      </motion.nav>

      {(footerLabel || footerSecondary) && (
        <div className="border-t border-black/10 px-6 py-4">
          {footerLabel && footerHref ? (
            <SidebarHref
              href={footerHref}
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/72 transition-colors hover:text-black"
              onClick={() => setIsOpen(false)}
            >
              {footerLabel}
            </SidebarHref>
          ) : footerLabel ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/72">{footerLabel}</p>
          ) : null}
          {footerSecondary && (
            <p className="mt-1 text-xs text-black/48">{footerSecondary}</p>
          )}
        </div>
      )}
    </div>
  );

  const renderDetailContent = (item: SidebarMenuItem) => (
    <div className="flex h-full min-w-0 flex-col">
      <div className="border-b border-black/8 px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-black/45">Section</p>
            <h2 className="text-xl font-medium tracking-[0.01em] text-black">{item.label}</h2>
            {item.summary && (
              <p className="max-w-md text-sm leading-relaxed text-black/62">{item.summary}</p>
            )}
          </div>
          {item.href && (
            <SidebarHref
              href={item.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/80 transition-colors hover:border-black/22 hover:text-black"
              onClick={() => setIsOpen(false)}
            >
              Открыть раздел
            </SidebarHref>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {item.items && item.items.length > 0 && (
          <div className="space-y-2">
            {item.items.map((link, index) => {
              const isCurrent = hrefMatchesLocation(link.href, pathname, searchParams);
              return (
                <motion.div
                  key={`${item.id}-${link.href}-${link.label}`}
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.3, ease: SOFT_TEXTILE_EASE, delay: 0.04 + index * 0.03 }
                  }
                >
                  <SidebarHref
                    href={link.href}
                    className="block rounded-2xl border border-black/10 bg-white/55 px-4 py-3 transition-colors duration-300 hover:border-black/18 hover:bg-white/72 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f6f3]"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className={["block text-[12px] font-semibold uppercase tracking-[0.15em]", isCurrent ? "text-black/62" : "text-black/88"].join(" ")}>
                      {link.label}
                    </span>
                    {link.description && (
                      <span className="mt-1.5 block text-sm leading-relaxed text-black/56">{link.description}</span>
                    )}
                  </SidebarHref>
                </motion.div>
              );
            })}
          </div>
        )}

        {item.promos && item.promos.length > 0 && (
          <div className={["grid gap-4 pt-6", item.promos.length > 1 ? "grid-cols-2" : "grid-cols-1"].join(" ")}>
            {item.promos.map((promo, index) => (
              <motion.div
                key={`${item.id}-${promo.href}-${promo.title}`}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.46, ease: SOFT_TEXTILE_EASE, delay: 0.18 + index * 0.06 }
                }
              >
                <SidebarHref
                  href={promo.href}
                  className="group block"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="overflow-hidden rounded-[1.2rem] border border-black/10 bg-white/44 transition-colors duration-500 group-hover:border-black/16 group-hover:bg-white/56">
                    <div className="aspect-[0.82] overflow-hidden bg-[#ece9e2]">
                      <img
                        src={promo.imageSrc}
                        alt={promo.imageAlt}
                        className="h-full w-full object-cover transition-transform duration-[950ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:scale-[1.022]"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="pt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black/88 transition-colors duration-300 group-hover:text-black/74">{promo.title}</p>
                    <p className="pt-1 text-sm leading-relaxed text-black/56 transition-colors duration-300 group-hover:text-black/50">{promo.subtitle}</p>
                  </div>
                </SidebarHref>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const mobileDetailContent = activeItem ? (
    <motion.div
      key={activeItem.id}
      className="flex h-full min-w-0 flex-col"
      initial={shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 18, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -14, y: 4 }}
      transition={detailStageTransition}
    >
      {renderDetailContent(activeItem)}
    </motion.div>
  ) : null;

  const desktopDetailContent = activeItem ? (
    <motion.div
      key={activeItem.id}
      className="flex h-full min-w-0 flex-col"
      initial={shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 8, y: 2 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={desktopDetailTransition}
    >
      {renderDetailContent(activeItem)}
    </motion.div>
  ) : null;

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

      {portalNode && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.button
                type="button"
                className="fixed inset-0 z-[58] bg-[rgba(71,62,52,0.18)] backdrop-blur-[2px]"
                aria-label="Закрыть меню"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={overlayTransition}
                onClick={() => setIsOpen(false)}
              />

              <motion.aside
                className="fixed left-0 top-0 z-[59] h-full overflow-hidden border-r border-black/10 bg-[#f4f4f2] shadow-[14px_0_48px_-30px_rgba(64,52,43,0.34)]"
                aria-label="Основная навигация"
                initial={shouldReduceMotion ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -24, scale: 0.985 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -18, scale: 0.992 }}
                transition={panelTransition}
                style={{
                  width: showDesktopDetail ? "min(50rem, calc(100vw - 2.5rem))" : "min(23rem, 88vw)"
                }}
              >
                {!supportsDesktopDetail ? (
                  <AnimatePresence initial={false} mode="wait">
                    {showMobileDetail && activeItem ? (
                      <motion.div
                        key={`mobile-${activeItem.id}`}
                        className="flex h-full flex-col"
                        initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 26 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={mobileStageTransition}
                      >
                        <div className="flex h-16 items-center justify-between border-b border-black/8 px-5">
                          <button
                            type="button"
                            onClick={() => setActiveItemId(null)}
                            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.17em] text-black/72 transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f4f2]"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
                            </svg>
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-[11px] font-semibold uppercase tracking-[0.17em] text-black/72 transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f4f2]"
                          >
                            Close
                          </button>
                        </div>
                        <div className="min-h-0 flex-1 overflow-hidden bg-[#f7f6f3]">
                          <AnimatePresence mode="wait" initial={false}>
                            {mobileDetailContent}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="mobile-root"
                        className="flex h-full min-w-0"
                        initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 18 }}
                        transition={mobileStageTransition}
                      >
                        {rootPanel}
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  <div className="flex h-full min-w-0">
                    {rootPanel}
                    {showDesktopDetail && activeItem && (
                      <div className="hidden min-[960px]:block min-w-0 flex-1 border-l border-black/8 bg-[#f7f6f3]">
                        {desktopDetailContent}
                      </div>
                    )}
                  </div>
                )}
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        portalNode
      )}
    </>
  );
}
