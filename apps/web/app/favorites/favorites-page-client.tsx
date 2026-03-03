"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Button, ProductGrid, Surface } from "@store-platform/ui";
import type { Product } from "@store-platform/shared-types";
import { trackFavoritesMetric } from "@/lib/api-client";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { enableSharedProductTransition } from "@/lib/feature-flags";

type FavoritesPageClientProps = {
  products: Product[];
};

export function FavoritesPageClient({ products }: FavoritesPageClientProps) {
  const { addProduct } = useCartStore();
  const favoriteProductIds = useFavoritesStore((state) => state.productIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleProduct);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);
  const syncId = useFavoritesStore((state) => state.syncId);
  const initSync = useFavoritesStore((state) => state.initSync);

  const favorites = useMemo(() => {
    const byId = new Map(products.map((product) => [product.id, product]));
    return favoriteProductIds
      .map((productId) => byId.get(productId))
      .filter((product): product is Product => Boolean(product));
  }, [favoriteProductIds, products]);

  useEffect(() => {
    void initSync();
  }, [initSync]);

  useEffect(() => {
    trackFavoritesMetric({
      metric: "favorites_opened",
      path: "/favorites",
      syncId
    });
  }, [syncId]);

  if (favorites.length === 0) {
    return (
      <section className="mx-auto max-w-3xl space-y-4 sm:space-y-5">
        <Surface tone="elevated" className="space-y-3 rounded-xl px-5 py-6 sm:px-6 sm:py-7">
          <p className="ui-kicker">Избранное</p>
          <h1 className="ui-title text-2xl sm:text-3xl">Сохраненные позиции</h1>
          <p className="ui-subtle text-sm sm:text-base">
            Отмечайте товары сердцем на карточке, чтобы быстро вернуться к ним позже.
          </p>
          <Button asChild>
            <Link href="/catalog">Перейти в каталог</Link>
          </Button>
        </Surface>
      </section>
    );
  }

  return (
    <section className="space-y-5 sm:space-y-6">
      <Surface tone="ghost" className="rounded-xl border border-border/45 bg-card/70 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="ui-kicker">Избранное</p>
            <p className="text-sm text-muted-foreground">
              Сохранено позиций: {favoriteProductIds.length}
            </p>
          </div>
          <button
            type="button"
            onClick={clearFavorites}
            className="rounded-[10px] border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground"
          >
            Очистить список
          </button>
        </div>
      </Surface>

      <ProductGrid
        title="Ваши избранные ткани"
        subtitle="Быстрый доступ к сохраненным вариантам для сравнения и покупки."
        products={favorites}
        onQuickAdd={(product) => addProduct(product.id)}
        enableSharedTransition={enableSharedProductTransition}
        favoriteProductIds={favoriteProductIds}
        onToggleFavorite={(product) => toggleFavorite(product.id)}
      />
    </section>
  );
}
