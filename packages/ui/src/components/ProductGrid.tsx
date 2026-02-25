import * as React from "react";
import type { Product } from "@store-platform/shared-types";
import { ProductCard } from "./ProductCard";

export type ProductGridProps = {
  products: Product[];
  title?: string;
  subtitle?: string;
  onQuickAdd?: (product: Product) => void;
};

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  title,
  subtitle,
  onQuickAdd
}) => {
  return (
    <section className="space-y-4">
      {(title || subtitle) && (
        <div className="flex flex-col gap-1">
          {title && <h2 className="text-lg font-medium tracking-tight">{title}</h2>}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </div>
    </section>
  );
};

