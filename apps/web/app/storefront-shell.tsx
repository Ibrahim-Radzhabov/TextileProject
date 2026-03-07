"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LayoutGroup } from "framer-motion";
import type { StorefrontConfig } from "@store-platform/shared-types";
import { CartDrawer, Footer, LayoutShell, TopNav } from "@store-platform/ui";
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
  const shopContacts = config.shop.contacts ?? {};
  const hasShopContacts =
    Boolean(shopContacts.phoneLabel) ||
    Boolean(shopContacts.phoneHref) ||
    Boolean(shopContacts.emailLabel) ||
    Boolean(shopContacts.emailHref) ||
    Boolean(shopContacts.address);
  const primaryCta = config.shop.primaryCta ?? { label: "Подобрать ткань", href: "/catalog?open_filters=1" };
  const supportLinks = config.shop.supportLinks && config.shop.supportLinks.length > 0
    ? config.shop.supportLinks
    : [
        { label: "Подбор ткани", href: "/catalog?open_filters=1" },
        { label: "Доставка и оплата", href: "/offer" },
        { label: "Уход за тканями", href: "/offer" },
        { label: "Вопросы и ответы", href: "/offer" }
      ];
  const contactHref = shopContacts.emailHref ?? shopContacts.phoneHref ?? "/offer";
  const navLinks = [
    {
      label: "Каталог",
      href: "/catalog",
      isActive: pathname.startsWith("/catalog") || pathname.startsWith("/product") || pathname === "/"
    },
    { label: "Избранное", href: "/favorites", isActive: pathname.startsWith("/favorites") },
    { label: "Контакты", href: contactHref }
  ];
  const footerColumns = [
    {
      title: "Каталог",
      links: [
        { label: "Тюль", href: "/catalog" },
        { label: "Шторы", href: "/catalog" },
        { label: "Комплекты", href: "/catalog" },
        { label: "Пошив на заказ", href: primaryCta.href }
      ]
    },
    {
      title: "Клиентам",
      links: supportLinks
    }
  ];
  const footerTrustItems = [
    {
      title: "Подбор под интерьер",
      text: "Смотрим на свет, пропорции и фактуру, чтобы текстиль работал именно в вашем пространстве."
    },
    {
      title: "Пошив по размерам",
      text: "Работаем под конкретное окно и сценарий посадки ткани, без универсальных шаблонов."
    },
    {
      title: "Доставка и сопровождение",
      text: "Аккуратная логистика, понятная коммуникация и рекомендации по уходу после покупки."
    }
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
            tagline="Window Textiles"
            links={navLinks}
            mobileMenu={{
              primaryLinks: [],
              serviceLinks: [
                ...supportLinks,
                { label: "Политика конфиденциальности", href: "/privacy" },
                { label: "Публичная оферта", href: "/offer" }
              ],
              contacts: hasShopContacts ? shopContacts : undefined,
              cta: primaryCta
            }}
            rightSlot={
              <>
                <TopNavSearchFilter intensity="balanced" />
                <a
                  href="/favorites"
                  className="hidden h-10 items-center gap-1 rounded-full border border-border/45 bg-card/84 px-3 text-muted-foreground transition-colors hover:border-border/65 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:inline-flex"
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
                  className="hidden h-10 items-center gap-1 rounded-full border border-border/45 bg-card/84 px-3 text-muted-foreground transition-colors hover:border-border/65 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:inline-flex"
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
                <a
                  href={primaryCta.href}
                  className="hidden h-10 items-center rounded-full border border-accent/70 bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90 md:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {primaryCta.label}
                </a>
              </>
            }
          />
        }
        footer={
          <Footer
            brandName={config.shop.name}
            description="Спокойный текстиль для интерьера: подбор ткани, пошив и комплектация под размеры, свет и ритм пространства."
            cta={primaryCta}
            trustItems={footerTrustItems}
            columns={footerColumns}
            contacts={shopContacts}
            socialLinks={config.shop.socialLinks ?? []}
            legalLinks={[
              { label: "Политика конфиденциальности", href: "/privacy" },
              { label: "Публичная оферта", href: "/offer" }
            ]}
          />
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
