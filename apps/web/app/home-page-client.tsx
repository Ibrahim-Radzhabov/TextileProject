"use client";

import { ProductGrid } from "@store-platform/ui";
import type { PageBlock, PageConfig, Product } from "@store-platform/shared-types";
import { useCartStore } from "@/store/cart-store";
import { renderNonProductGridBlock } from "@/lib/page-block-renderers";

type HomePageClientProps = {
  homePage: PageConfig;
  products: Product[];
};

function filterProducts(products: Product[], block: PageBlock): Product[] {
  if (block.type !== "product-grid") {
    return [];
  }

  return products.filter((product) => {
    if (block.filter?.featured && !product.isFeatured) {
      return false;
    }

    if (block.filter?.tags && block.filter.tags.length > 0) {
      const tags = product.tags ?? [];
      if (!block.filter.tags.some((tag) => tags.includes(tag))) {
        return false;
      }
    }

    return true;
  });
}

export function HomePageClient({ homePage, products }: HomePageClientProps) {
  const { addProduct } = useCartStore();

  return (
    <div className="space-y-14 lg:space-y-16">
      {homePage.blocks.map((block) => {
        if (block.type === "product-grid") {
          return (
            <section
              key={block.id}
              id={block.id === "home-featured" ? "featured" : undefined}
              className="scroll-mt-24 space-y-4"
            >
              <ProductGrid
                title={block.title}
                subtitle={block.subtitle}
                products={filterProducts(products, block)}
                onQuickAdd={(product) => addProduct(product.id)}
              />
            </section>
          );
        }

        return renderNonProductGridBlock(block);
      })}
    </div>
  );
}
