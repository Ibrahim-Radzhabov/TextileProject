"use client";

import { Button, ProductGallery, Surface, ProductCard } from "@store-platform/ui";
import type { Product } from "@store-platform/shared-types";
import { useCartStore } from "@/store/cart-store";

type ProductPageClientProps = {
  product: Product;
  related: Product[];
  productPageTexts: Array<{
    id: string;
    content: string;
  }>;
};

export function ProductPageClient({
  product,
  related,
  productPageTexts
}: ProductPageClientProps) {
  const { addProduct } = useCartStore();

  const priceFormatted = product.price.amount.toLocaleString(undefined, {
    style: "currency",
    currency: product.price.currency
  });

  return (
    <div className="space-y-10">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
        <ProductGallery media={product.media} />
        <div className="space-y-6 md:sticky md:top-20 md:self-start">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {product.name}
            </h1>

            {productPageTexts.map((text) => (
              <p key={text.id} className="text-sm text-muted-foreground">
                {text.content}
              </p>
            ))}

            {product.shortDescription && (
              <p className="text-sm text-muted-foreground">
                {product.shortDescription}
              </p>
            )}
          </header>

          <Surface tone="subtle" className="space-y-3 px-4 py-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-lg font-medium">{priceFormatted}</span>
              {product.badges && product.badges.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.badges.map((badge) => (
                    <span
                      key={badge.id}
                      className="rounded-full bg-accent-soft/70 px-2 py-0.5 text-[11px] font-medium text-accent"
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button fullWidth onClick={() => addProduct(product.id)}>
              Добавить в корзину
            </Button>
          </Surface>

          {product.description && (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{product.description}</p>
            </div>
          )}
        </div>
      </div>
      {related.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-medium tracking-tight text-muted-foreground">
              С этим сочетается
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {related.map((p) => (
              <div key={p.id} className="min-w-[220px] max-w-[240px] flex-1">
                <ProductCard
                  product={p}
                  onQuickAdd={(prod) => addProduct(prod.id)}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
