"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Product } from "@store-platform/shared-types";
import { Button, ProductGallery, Surface } from "@store-platform/ui";
import { useCartStore } from "@/store/cart-store";
import { fetchProduct } from "@/lib/api-client";
import { useStorefrontConfig } from "../../storefront-shell";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [product, setProduct] = useState<Product | null>(null);
  const { addProduct } = useCartStore();
  const config = useStorefrontConfig();

  useEffect(() => {
    if (!slug) return;
    fetchProduct(slug)
      .then(setProduct)
      .catch(() => setProduct(null));
  }, [slug]);

  if (!product) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-muted/40" />
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="h-80 animate-pulse rounded-3xl bg-muted/40" />
          <div className="space-y-4">
            <div className="h-5 w-52 animate-pulse rounded bg-muted/40" />
            <div className="h-4 w-full animate-pulse rounded bg-muted/30" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted/30" />
            <div className="h-10 w-40 animate-pulse rounded-full bg-muted/40" />
          </div>
        </div>
      </div>
    );
  }

  const priceFormatted = product.price.amount.toLocaleString(undefined, {
    style: "currency",
    currency: product.price.currency
  });

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
      <ProductGallery media={product.media} />
      <div className="space-y-6 md:sticky md:top-20 md:self-start">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {product.name}
          </h1>
          {config &&
            config.pages
              .find((p) => p.kind === "product")
              ?.blocks.filter((b) => b.type === "rich-text")
              .map((b) => (
                <p
                  key={b.id}
                  className="text-sm text-muted-foreground"
                >
                  {b.content}
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
          <Button
            fullWidth
            onClick={() => addProduct(product.id)}
          >
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
  );
}

