"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { DefaultSeo } from "next-seo";
import type { StorefrontConfig } from "@store-platform/shared-types";
import { Button, CartDrawer, LayoutShell, TopNav } from "@store-platform/ui";
import { useCartStore } from "@/store/cart-store";

type StorefrontShellProps = {
  children: ReactNode;
  config: StorefrontConfig;
};

const StorefrontConfigContext = createContext<StorefrontConfig | null>(null);

export function useStorefrontConfig(): StorefrontConfig | null {
  return useContext(StorefrontConfigContext);
}

export function StorefrontShell({ children, config }: StorefrontShellProps) {
  const { cart, open, isPricing, setOpen } = useCartStore();
  const itemCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0;

  return (
    <StorefrontConfigContext.Provider value={config}>
      <DefaultSeo
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
            rightSlot={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setOpen(true)}
              >
                Корзина
                {itemCount > 0 && (
                  <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[11px]">
                    {itemCount}
                  </span>
                )}
              </Button>
            }
          />
        }
        footer={
          <span className="text-xs text-muted-foreground">
            Powered by store-platform
          </span>
        }
      >
        {children}
      </LayoutShell>
      <CartDrawer
        open={open}
        cart={cart}
        isUpdating={isPricing}
        onClose={() => setOpen(false)}
        onCheckout={() => {
          window.location.href = "/checkout";
        }}
      />
    </StorefrontConfigContext.Provider>
  );
}

