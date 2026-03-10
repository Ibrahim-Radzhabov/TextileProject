"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LayoutGroup } from "framer-motion";
import type { StorefrontConfig } from "@store-platform/shared-types";
import { CartDrawer, Footer, LayoutShell, TopNav, AnimatedDock } from "@store-platform/ui";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { PwaInstallNavButton } from "@/components/pwa-install-nav-button";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { TopNavSearchFilter } from "@/components/top-nav-search-filter";
import { HeaderDropdownMenu } from "@/components/header-dropdown-menu";
import { enableSharedProductTransition } from "@/lib/feature-flags";
import { AnnouncementTicker } from "../components/AnnouncementTicker";

const iconHome = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 10v10h6v-6h4v6h6V10L12 4 4 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const iconSearch = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M11 5a6 6 0 1 0 3.87 10.58L19 19.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const iconHeart = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 20c-3.4-2.7-6.5-5.2-6.5-8.7A3.8 3.8 0 0 1 9.3 7.5c1.1 0 2.1.5 2.7 1.4.6-.9 1.6-1.4 2.7-1.4a3.8 3.8 0 0 1 3.8 3.8c0 3.5-3.1 6-6.5 8.7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);
const iconCart = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4.5 6h1.7l1.4 8.2h8.7l1.6-6.3H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="10.4" cy="18.2" r="1.2" fill="currentColor" />
    <circle cx="16.4" cy="18.2" r="1.2" fill="currentColor" />
  </svg>
);
const tickerMessages = [
  "Book a Private Appointment in Store",
  "E-Concierging Availability, Monday to Sunday from 9 am to 7 pm"
];

type StorefrontShellProps = {
  children: ReactNode;
  config: StorefrontConfig;
  activeThemeVariantId: string;
};

export function StorefrontShell({ children, config, activeThemeVariantId: _activeThemeVariantId }: StorefrontShellProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
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
    {
      label: "Каталог",
      href: "/catalog",
      isActive: pathname.startsWith("/catalog") || pathname.startsWith("/product") || pathname === "/"
    },
    { label: "Избранное", href: "/favorites", isActive: pathname.startsWith("/favorites") },
    { label: "Контакты", href: "mailto:atelier@textile.studio" }
  ];
  const footerColumns = [
    {
      title: "Каталог",
      links: [
        { label: "Тюль", href: "/catalog" },
        { label: "Шторы", href: "/catalog" },
        { label: "Комплекты", href: "/catalog" },
        { label: "Пошив на заказ", href: "mailto:atelier@textile.studio" }
      ]
    },
    {
      title: "Клиентам",
      links: [
        { label: "Подбор ткани", href: "mailto:atelier@textile.studio" },
        { label: "Доставка и оплата", href: "mailto:atelier@textile.studio" },
        { label: "Уход за тканями", href: "mailto:atelier@textile.studio" },
        { label: "Контакты", href: "mailto:atelier@textile.studio" }
      ]
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
      <AnnouncementTicker messages={tickerMessages} />
      <LayoutShell
        topNav={
          <TopNav
            shopName={config.shop.name}
            logo={config.shop.logo}
            leftHref="/"
            centerBrand
            links={[]}
            mobileMenu={{
              primaryLinks: [
                { label: "Каталог", href: "/catalog", isActive: pathname.startsWith("/catalog") || pathname.startsWith("/product") || pathname === "/" },
                { label: "Избранное", href: "/favorites", isActive: pathname.startsWith("/favorites") },
                { label: "Контакты", href: "mailto:atelier@textile.studio" }
              ],
              serviceLinks: [
                { label: "Подбор ткани", href: "mailto:atelier@textile.studio" },
                { label: "Доставка и оплата", href: "mailto:atelier@textile.studio" },
                { label: "Уход за тканями", href: "mailto:atelier@textile.studio" },
                { label: "Вопросы и ответы", href: "mailto:atelier@textile.studio" }
              ],
              contacts: {
                phoneLabel: "+7 (999) 000-00-00",
                phoneHref: "tel:+79990000000",
                emailLabel: "atelier@textile.studio",
                emailHref: "mailto:atelier@textile.studio",
                address: "Москва, Кутузовский проспект, 18"
              }
            }}
            rightSlot={
              <>
                <div className="hidden md:flex flex-col items-end gap-1.5">
                  <HeaderDropdownMenu links={navLinks} />
                  <AnimatedDock
                    items={[
                      { href: "/", icon: iconHome, title: "Главная" },
                      { onClick: () => setSearchOpen(true), icon: iconSearch, title: "Поиск" },
                      { href: "/favorites", icon: iconHeart, title: "Избранное", badge: favoriteItemCount },
                      { onClick: () => setOpen(true), icon: iconCart, title: "Корзина", badge: itemCount }
                    ]}
                  />
                </div>
                <div className="md:hidden">
                  <AnimatedDock
                    items={[
                      { href: "/", icon: iconHome, title: "Главная" },
                      { onClick: () => setSearchOpen(true), icon: iconSearch, title: "Поиск" },
                      { href: "/favorites", icon: iconHeart, title: "Избранное", badge: favoriteItemCount },
                      { onClick: () => setOpen(true), icon: iconCart, title: "Корзина", badge: itemCount }
                    ]}
                  />
                </div>
                <TopNavSearchFilter
                  intensity="balanced"
                  open={searchOpen}
                  onOpenChange={setSearchOpen}
                  hideTrigger
                />
                <div className="hidden sm:block">
                  <PwaInstallNavButton />
                </div>
              </>
            }
          />
        }
        footer={
          <Footer
            brandName={config.shop.name}
            cta={{ label: "Подобрать ткань", href: "mailto:atelier@textile.studio" }}
            trustItems={footerTrustItems}
            columns={footerColumns}
            contacts={{
              phoneLabel: "+7 (999) 000-00-00",
              phoneHref: "tel:+79990000000",
              emailLabel: "atelier@textile.studio",
              emailHref: "mailto:atelier@textile.studio",
              address: "Москва, Кутузовский проспект, 18"
            }}
            socialLinks={[
              { label: "Instagram", href: "https://instagram.com" },
              { label: "Pinterest", href: "https://pinterest.com" },
              { label: "Telegram", href: "https://t.me" }
            ]}
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
