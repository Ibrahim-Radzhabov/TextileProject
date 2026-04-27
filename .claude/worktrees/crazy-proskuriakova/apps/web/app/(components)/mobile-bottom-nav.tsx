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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm md:hidden"
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-around px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-3">
        <Link
          href="/"
          className={[
            "ui-button text-[11px] transition-opacity",
            isHome ? "text-foreground" : "text-muted-foreground"
          ].join(" ")}
        >
          Главная
        </Link>

        <Link
          href="/catalog"
          className={[
            "ui-button text-[11px] transition-opacity",
            isCatalog ? "text-foreground" : "text-muted-foreground"
          ].join(" ")}
        >
          Каталог
        </Link>

        <button
          type="button"
          onClick={onCartOpen}
          className={[
            "ui-button text-[11px] transition-opacity",
            isCart ? "text-foreground" : "text-muted-foreground"
          ].join(" ")}
        >
          Корзина{cartItemCount > 0 ? ` (${cartItemCount})` : ""}
        </button>

        <Link
          href="/favorites"
          className={[
            "ui-button text-[11px] transition-opacity",
            isFavorites ? "text-foreground" : "text-muted-foreground"
          ].join(" ")}
        >
          Избранное{favoriteItemCount > 0 ? ` (${favoriteItemCount})` : ""}
        </Link>
      </div>
    </nav>
  );
}
