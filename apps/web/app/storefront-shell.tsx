"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { LayoutGroup } from "framer-motion";
import type { StorefrontConfig } from "@store-platform/shared-types";
import { Button, CartDrawer, LayoutShell, TopNav } from "@store-platform/ui";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { PwaInstallNavButton } from "@/components/pwa-install-nav-button";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { enableSharedProductTransition } from "@/lib/feature-flags";

type StorefrontShellProps = {
  children: ReactNode;
  config: StorefrontConfig;
  activeThemeVariantId: string;
};

const ClientDefaultSeo = dynamic(
  () => import("next-seo").then((mod) => mod.DefaultSeo),
  { ssr: false }
);

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
  const itemCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  const isAdminArea = pathname.startsWith("/admin");
  const isCheckoutFlow = pathname.startsWith("/checkout");
  const showMobileBottomNav = !isAdminArea && !isCheckoutFlow;

  return (
    <>
      <ClientDefaultSeo
        defaultTitle={config.seo.defaultTitle}
        titleTemplate={config.seo.titleTemplate}
        description={config.seo.description}
        openGraph={{
          title: config.seo.defaultTitle,
          description: config.seo.description,
          images: config.seo.openGraphImage
            ? [{ url: config.seo.openGraphImage }]
            : undefined
        }}
      />
      <LayoutShell
        topNav={
          <TopNav
            shopName={config.shop.name}
            logo={config.shop.logo}
            leftHref="/"
            rightSlot={
              <>
                <div className="hidden sm:block">
                  <PwaInstallNavButton />
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => setOpen(true)}
                >
                  Корзина
                  {itemCount > 0 && (
                    <span className="ml-2 rounded-full border border-border/55 bg-card/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </>
            }
          />
        }
        footer={
          <span className="text-xs text-muted-foreground">
            Powered by store-platform
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
