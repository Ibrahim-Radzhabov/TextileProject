"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type MobileBottomNavProps = {
  cartItemCount: number;
  favoriteItemCount: number;
  cartOpen: boolean;
  onCartOpen: () => void;
};

function NavIcon({
  children,
  active
}: {
  children: ReactNode;
  active: boolean;
}) {
  return (
    <span
      className={[
        "flex h-5 w-5 items-center justify-center transition-colors",
        active ? "text-foreground" : "text-muted-foreground"
      ].join(" ")}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function NavLabel({ text, active }: { text: string; active: boolean }) {
  return (
    <span
      className={[
        "text-[11px] leading-none",
        active ? "font-medium text-foreground" : "text-muted-foreground"
      ].join(" ")}
    >
      {text}
    </span>
  );
}

export function MobileBottomNav({
  cartItemCount,
  favoriteItemCount,
  cartOpen,
  onCartOpen
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isCatalog = pathname.startsWith("/catalog") || pathname.startsWith("/product");
  const isCart = cartOpen || pathname.startsWith("/checkout");
  const isFavorites = pathname.startsWith("/favorites");

  return (
    <nav
      aria-label="Мобильная навигация"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-md md:hidden"
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-4 px-2 pb-[calc(0.35rem+env(safe-area-inset-bottom))] pt-1.5">
        <Link
          href="/"
          className="flex flex-col items-center justify-center gap-1 rounded-[10px] py-1.5 transition-colors hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <NavIcon active={isHome}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 10v10h6v-6h4v6h6V10L12 4 4 10Z"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </NavIcon>
          <NavLabel text="Главная" active={isHome} />
        </Link>

        <Link
          href="/catalog"
          className="flex flex-col items-center justify-center gap-1 rounded-[10px] py-1.5 transition-colors hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <NavIcon active={isCatalog}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect
                x="4.5"
                y="4.5"
                width="7"
                height="7"
                rx="1.4"
                stroke="currentColor"
                strokeWidth="1" />
              <rect x="13" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1" />
              <rect x="4" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1" />
              <rect x="13" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1" />
            </svg>
          </NavIcon>
          <NavLabel text="Каталог" active={isCatalog} />
        </Link>

        <button
          type="button"
          onClick={onCartOpen}
          className="relative flex flex-col items-center justify-center gap-1 rounded-[10px] py-1.5 transition-colors hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <NavIcon active={isCart}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6h12l1 14H5L6 6z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
              <path d="M9 6V4a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </NavIcon>
          <NavLabel text="Корзина" active={isCart} />
          {cartItemCount > 0 && (
            <span className="absolute right-3 top-1 rounded-full border border-border/65 bg-foreground px-1.5 text-[10px] font-semibold leading-4 text-background">
              {cartItemCount}
            </span>
          )}
        </button>

        <Link
          href="/favorites"
          className="relative flex flex-col items-center justify-center gap-1 rounded-[10px] py-1.5 transition-colors hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <NavIcon active={isFavorites}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3h14v18l-7-5-7 5V3z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
            </svg>
          </NavIcon>
          <NavLabel text="Избранное" active={isFavorites} />
          {favoriteItemCount > 0 && (
            <span className="absolute right-2 top-1 rounded-full border border-border/65 bg-foreground px-1.5 text-[10px] font-semibold leading-4 text-background">
              {favoriteItemCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
