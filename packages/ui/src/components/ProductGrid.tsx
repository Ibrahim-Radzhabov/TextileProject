"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { Product } from "@store-platform/shared-types";
import { EmptyState } from "./EmptyState";
import { ProductCard } from "./ProductCard";
import { gridContainerVariants, gridItemVariants } from "../motion/presets";

export type ProductGridProps = {
  products: Product[];
  title?: string;
  subtitle?: string;
  onQuickAdd?: (product: Product) => void;
  enableSharedTransition?: boolean;
};

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  title,
  subtitle,
  onQuickAdd,
  enableSharedTransition = false
}) => {
  const isEmpty = products.length === 0;

  return (
    <section className="space-y-5 sm:space-y-6">
      {(title || subtitle) && (
        <div className="space-y-3">
          {title && <h2 className="ui-title text-2xl sm:text-[2rem]">{title}</h2>}
          {subtitle && (
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>
          )}
          <div className="premium-divider" />
        </div>
      )}
      {isEmpty ? (
        <EmptyState
          title="Подборка пока пустая"
          description="Попробуйте изменить фильтры или вернуться позже."
        />
      ) : (
        <motion.div
          className="grid auto-rows-fr grid-cols-[repeat(auto-fit,minmax(228px,1fr))] gap-4 sm:gap-5 lg:gap-6"
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={gridItemVariants}
            >
              <ProductCard
                product={product}
                onQuickAdd={onQuickAdd}
                enableSharedTransition={enableSharedTransition}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
};
