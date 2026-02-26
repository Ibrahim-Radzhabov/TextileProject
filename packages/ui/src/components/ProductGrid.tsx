import * as React from "react";
import { motion } from "framer-motion";
import type { Product } from "@store-platform/shared-types";
import { ProductCard } from "./ProductCard";

export type ProductGridProps = {
  products: Product[];
  title?: string;
  subtitle?: string;
  onQuickAdd?: (product: Product) => void;
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  title,
  subtitle,
  onQuickAdd
}) => {
  const isEmpty = products.length === 0;

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
      {isEmpty ? (
        <div className="rounded-2xl border border-border/50 bg-card/40 px-4 py-6 text-sm text-muted-foreground">
          Подборка пока пустая. Попробуйте изменить фильтры или вернуться позже.
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
            >
              <ProductCard
                product={product}
                onQuickAdd={onQuickAdd}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
};

