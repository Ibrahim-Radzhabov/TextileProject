"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LayoutGroup } from "framer-motion";
import type { StorefrontConfig } from "@store-platform/shared-types";
import { CartDrawer, LayoutShell, TopNav } from "@store-platform/ui";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { PwaInstallNavButton } from "@/components/pwa-install-nav-button";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { TopNavSearchFilter } from "@/components/top-nav-search-filter";
import { enableSharedProductTransition } from "@/lib/feature-flags";

type StorefrontShellProps = {
  children: ReactNode;
  config: StorefrontConfig;
  activeThemeVariantId: string;
};

export function StorefrontShell({ children, config, activeThemeVariantId: _activeThemeVariantId }: StorefrontShellProps) {
  const pathname = usePathname();
  const {
    cart,
    open,
    isPricing,
    setOpen,
    error: cartError,
    incrementProduct,
    decrementProduct,
    removeProduct
  } = useCartStore();
  const favoriteItemCount = useFavoritesStore((state) => state.productIds.length);
  const initFavoritesSync = useFavoritesStore((state) => state.initSync);
  const itemCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  const isAdminArea = pathname.startsWith("/admin");
  const isCheckoutFlow = pathname.startsWith("/checkout");
  const showMobileBottomNav = !isAdminArea && !isCheckoutFlow;
  const navLinks = [
    { label: "Коллекции", href: "/catalog", isActive: pathname.startsWith("/catalog") || pathname === "/" },
    { label: "Контакты", href: "mailto:atelier@textile.studio" }
  ];

  useEffect(() => {
    void initFavoritesSync();
  }, [initFavoritesSync]);

  return (
    <>
      <LayoutShell
        topNav={
          <TopNav
            shopName={config.shop.name}
            logo={config.shop.logo}
            leftHref="/"
            links={navLinks}
            rightSlot={
              <>
                <TopNavSearchFilter />
                <a
                  href="/favorites"
                  className="inline-flex h-9 items-center gap-1 rounded-[8px] border border-border/35 px-2.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label="Избранное"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 20c-3.4-2.7-6.5-5.2-6.5-8.7A3.8 3.8 0 0 1 9.3 7.5c1.1 0 2.1.5 2.7 1.4.6-.9 1.6-1.4 2.7-1.4a3.8 3.8 0 0 1 3.8 3.8c0 3.5-3.1 6-6.5 8.7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                  {favoriteItemCount > 0 && (
                    <span className="text-[11px] text-foreground">{favoriteItemCount}</span>
                  )}
                </a>
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-1 rounded-[8px] border border-border/35 px-2.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={() => setOpen(true)}
                  aria-label="Открыть корзину"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M4.5 6h1.7l1.4 8.2h8.7l1.6-6.3H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="10.4" cy="18.2" r="1.2" fill="currentColor" />
                    <circle cx="16.4" cy="18.2" r="1.2" fill="currentColor" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="text-[11px] text-foreground">{itemCount}</span>
                  )}
                </button>
                <div className="hidden sm:block">
                  <PwaInstallNavButton />
                </div>
              </>
            }
          />
        }
        footer={
          <span className="text-xs text-muted-foreground">
            Работает на store-platform
          </span>
        }
      >
        {enableSharedProductTransition ? (
          <LayoutGroup id="storefront-shared-elements">
            {children}
          </LayoutGroup>
        ) : (
          children
        )}
      </LayoutShell>
      <CartDrawer
        open={open}
        cart={cart}
        isUpdating={isPricing}
        error={cartError}
        onClose={() => setOpen(false)}
        onIncrement={(productId) => {
          void incrementProduct(productId);
        }}
        onDecrement={(productId) => {
          void decrementProduct(productId);
        }}
        onRemove={(productId) => {
          void removeProduct(productId);
        }}
        onCheckout={() => {
          window.location.href = "/checkout";
        }}
      />
      <PwaInstallPrompt />
      {showMobileBottomNav && (
        <MobileBottomNav
          cartItemCount={itemCount}
          favoriteItemCount={favoriteItemCount}
          cartOpen={open}
          onCartOpen={() => setOpen(true)}
        />
      )}
    </>
  );
}
