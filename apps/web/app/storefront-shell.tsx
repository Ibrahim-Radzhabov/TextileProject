"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LayoutGroup } from "framer-motion";
import type { StorefrontConfig } from "@store-platform/shared-types";
import { CartDrawer, Footer, LayoutShell, TopNav, AnimatedDock } from "@store-platform/ui";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { TopNavSearchFilter } from "@/components/top-nav-search-filter";
import { enableSharedProductTransition } from "@/lib/feature-flags";
import { AnnouncementTicker } from "../components/AnnouncementTicker";
import { SidebarMenu, type SidebarMenuItem } from "./(components)/sidebar-menu";

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

const sidebarMenuSections: SidebarMenuItem[] = [
  {
    id: "catalog",
    label: "Каталог",
    href: "/catalog",
    summary: "Быстрый вход во весь ассортимент, новинки сезона и подборки по сценарию света.",
    items: [
      {
        label: "Все позиции",
        href: "/catalog",
        description: "Полный каталог без дополнительных ограничений."
      },
      {
        label: "Новинки",
        href: "/catalog?rail=new",
        description: "Свежие фактуры и новые сценарии драпировки."
      },
      {
        label: "Бестселлеры",
        href: "/catalog?rail=bestsellers",
        description: "Проверенные позиции и самые востребованные модели."
      },
      {
        label: "По комнате",
        href: "/catalog?view=room",
        description: "Гостиная, спальня, кабинет и другие интерьерные задачи."
      },
      {
        label: "По свету",
        href: "/catalog?view=light",
        description: "Sheer, tulle, dimout и blackout для разных сценариев дня."
      }
    ],
    promos: [
      {
        title: "Для гостиной",
        subtitle: "Тюль и day-night решения для мягкого дневного света.",
        href: "/catalog?tags=living-room",
        imageSrc: "/demo/airy-voile-tulle.svg",
        imageAlt: "Подборка текстиля для гостиной"
      },
      {
        title: "Для спальни",
        subtitle: "Более плотные сценарии с blackout и dimout фактурами.",
        href: "/catalog?tags=bedroom",
        imageSrc: "/demo/satin_one.jpeg",
        imageAlt: "Подборка текстиля для спальни"
      }
    ]
  },
  {
    id: "curtains",
    label: "Шторы",
    href: "/catalog?tags=drape",
    summary: "Плотные и интерьерные драпировки для спальни, гостиной и камерных пространств.",
    items: [
      {
        label: "Все шторы",
        href: "/catalog?tags=drape",
        description: "Все модели драпировок и портьер в одном разделе."
      },
      {
        label: "Blackout",
        href: "/catalog?tags=blackout,drape",
        description: "Максимальное затемнение для спальни и кино-зоны."
      },
      {
        label: "Лен",
        href: "/catalog?tags=linen,drape",
        description: "Фактурные полотна с мягкой архитектурной складкой."
      },
      {
        label: "Velvet",
        href: "/catalog?tags=velvet",
        description: "Бархатные решения для глубокого вечернего света."
      },
      {
        label: "Для спальни",
        href: "/catalog?tags=bedroom,drape",
        description: "Тихие, более плотные ткани для приватных зон."
      }
    ],
    promos: [
      {
        title: "Linen Blackout",
        subtitle: "Плотный льняной blackout с мягкой архитектурной драпировкой.",
        href: "/product/linen-blackout-drape",
        imageSrc: "/demo/satin_one.jpeg",
        imageAlt: "Linen blackout drape"
      },
      {
        title: "Velvet Theater",
        subtitle: "Бархатные портьеры для уютной вечерней сцены.",
        href: "/product/velvet-theater-blackout",
        imageSrc: "/demo/linen-blackout-drape.svg",
        imageAlt: "Velvet theater blackout"
      }
    ]
  },
  {
    id: "tulle",
    label: "Тюль",
    href: "/catalog?tags=tulle",
    summary: "Воздушные ткани для мягкого рассеивания света и дневной приватности.",
    items: [
      {
        label: "Все тюли",
        href: "/catalog?tags=tulle",
        description: "Полупрозрачные и легкие фактуры под разные окна."
      },
      {
        label: "Sheer + Voile",
        href: "/catalog?tags=tulle,sheer",
        description: "Самые деликатные сценарии для светлого интерьера."
      },
      {
        label: "Широкие полотна",
        href: "/catalog?tags=tulle,wide",
        description: "Решения для панорамных и широких окон."
      },
      {
        label: "Для детской",
        href: "/catalog?tags=tulle,kids",
        description: "Легкий тюль с мягким светом и более спокойным рисунком."
      },
      {
        label: "Для кухни",
        href: "/catalog?tags=sheer,cafe",
        description: "Компактные и воздушные варианты для кухонных окон."
      }
    ],
    promos: [
      {
        title: "Airy Voile",
        subtitle: "Воздушный voile для мягкого света в жилых комнатах.",
        href: "/product/airy-voile-tulle",
        imageSrc: "/demo/airy-voile-tulle.svg",
        imageAlt: "Airy Voile Tulle"
      },
      {
        title: "Soft Mesh",
        subtitle: "Легкий mesh-тюль для спокойных нейтральных интерьеров.",
        href: "/product/soft-mesh-tulle-white",
        imageSrc: "/demo/airy-voile-tulle-detail.svg",
        imageAlt: "Soft mesh tulle"
      }
    ]
  },
  {
    id: "sets",
    label: "Комплекты",
    href: "/catalog?view=kits",
    summary: "Готовые day-night комбинации и интерьерные наборы с продуманной плотностью.",
    items: [
      {
        label: "Все комплекты",
        href: "/catalog?view=kits",
        description: "Наборы для более быстрого выбора целого сценария окна."
      },
      {
        label: "Day-Night",
        href: "/catalog?tags=day-night,set",
        description: "Два слоя под дневную мягкость и вечернюю приватность."
      },
      {
        label: "Для гостиной",
        href: "/catalog?tags=living-room,set",
        description: "Сценарии света для зоны отдыха и приема гостей."
      },
      {
        label: "Velvet Pleat Set",
        href: "/product/velvet-pleat-set",
        description: "Более камерный и плотный набор для спальни."
      },
      {
        label: "Jacquard Set",
        href: "/product/jacquard-day-night-set",
        description: "Гибкая day-night композиция с декоративной фактурой."
      }
    ],
    promos: [
      {
        title: "Jacquard Day-Night",
        subtitle: "Комбинация плотного и легкого слоя для разного времени суток.",
        href: "/product/jacquard-day-night-set",
        imageSrc: "/demo/jacquard-day-night-set.svg",
        imageAlt: "Jacquard Day-Night Set"
      },
      {
        title: "Velvet Pleat Set",
        subtitle: "Более плотный вечерний сценарий с мягкой бархатной складкой.",
        href: "/product/velvet-pleat-set",
        imageSrc: "/demo/jacquard-day-night-set-detail.svg",
        imageAlt: "Velvet Pleat Set"
      }
    ]
  },
  {
    id: "favorites",
    label: "Избранное",
    href: "/favorites",
    summary: "Соберите короткий список тканей и возвращайтесь к ним без повторного поиска.",
    items: [
      {
        label: "Открыть избранное",
        href: "/favorites",
        description: "Все сохраненные модели и быстрый вход к сравнению."
      },
      {
        label: "Добавить новинки",
        href: "/catalog?rail=new",
        description: "Быстро посмотреть свежие поступления и сохранить интересные фактуры."
      },
      {
        label: "Смотреть бестселлеры",
        href: "/catalog?rail=bestsellers",
        description: "Популярные решения, с которых удобно начать подбор."
      }
    ]
  },
  {
    id: "contacts",
    label: "Контакты",
    summary: "Свяжитесь со студией, чтобы обсудить размеры, фактуры и назначить просмотр тканей.",
    items: [
      {
        label: "Написать в студию",
        href: "mailto:atelier@textile.studio",
        description: "Ответим по подбору ткани и сценарию окна."
      },
      {
        label: "Позвонить",
        href: "tel:+79990000000",
        description: "+7 (999) 000-00-00"
      },
      {
        label: "Запросить appointment",
        href: "mailto:atelier@textile.studio?subject=Private%20Appointment",
        description: "Назначим просмотр тканей и обсуждение проекта."
      }
    ]
  }
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
            leftSlot={
              <SidebarMenu
                items={sidebarMenuSections}
                footerLabel="atelier@textile.studio"
                footerHref="mailto:atelier@textile.studio"
                footerSecondary="Москва, Кутузовский проспект, 18"
              />
            }
            rightSlot={
              <div className="flex items-center justify-end gap-2 sm:gap-2.5">
                <TopNavSearchFilter
                  intensity="balanced"
                  open={searchOpen}
                  onOpenChange={setSearchOpen}
                  hideTrigger
                />
                <AnimatedDock
                  variant="capsule"
                  distribution="between"
                  className="w-[10.5rem] sm:w-[11.75rem]"
                  items={[
                    { onClick: () => setSearchOpen(true), icon: iconSearch, title: "Поиск" },
                    { href: "/favorites", icon: iconHeart, title: "Избранное", badge: favoriteItemCount },
                    { onClick: () => setOpen(true), icon: iconCart, title: "Корзина", badge: itemCount }
                  ]}
                />
              </div>
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
