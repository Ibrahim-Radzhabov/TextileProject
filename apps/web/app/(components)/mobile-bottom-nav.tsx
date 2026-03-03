"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MobileBottomNavProps = {
  cartItemCount: number;
  cartOpen: boolean;
  onCartOpen: () => void;
};

function NavIcon({
  children,
  active
}: {
  children: React.ReactNode;
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

export function MobileBottomNav({ cartItemCount, cartOpen, onCartOpen }: MobileBottomNavProps) {
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
              <path d="M3 11.5L12 4L21 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.5 10.5V20H17.5V10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
              <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="2" />
              <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M7 10.5H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
              <path d="M3 5H5L7.4 14.2C7.6 15 8.3 15.5 9.1 15.5H17.3C18 15.5 18.7 15 18.9 14.3L21 8H6.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9.5" cy="19" r="1.4" fill="currentColor" />
              <circle cx="17" cy="19" r="1.4" fill="currentColor" />
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
          className="flex flex-col items-center justify-center gap-1 rounded-[10px] py-1.5 transition-colors hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <NavIcon active={isFavorites}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 20.2C8.8 17.7 5 14.6 5 10.6C5 8.4 6.7 6.8 8.8 6.8C10.1 6.8 11.3 7.4 12 8.4C12.7 7.4 13.9 6.8 15.2 6.8C17.3 6.8 19 8.4 19 10.6C19 14.6 15.2 17.7 12 20.2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </NavIcon>
          <NavLabel text="Избранное" active={isFavorites} />
        </Link>
      </div>
    </nav>
  );
}
