"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Badge, CtaStrip, EmptyState, ProductCard, Surface } from "@store-platform/ui";
import type {
  CtaStripBlock,
  HeroBlock,
  PageBlock,
  PageConfig,
  Product,
  ProductGridBlock,
  RichTextBlock
} from "@store-platform/shared-types";
import { useCartStore } from "@/store/cart-store";

type HomePageClientProps = {
  homePage: PageConfig;
  products: Product[];
};

type HomeStats = {
  totalProducts: number;
  featuredProducts: number;
  tagsCount: number;
  minPrice: number | null;
  maxPrice: number | null;
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.04
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

function filterProducts(products: Product[], block: ProductGridBlock): Product[] {
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

function resolveHomeStats(products: Product[]): HomeStats {
  const featuredProducts = products.filter((product) => product.isFeatured).length;
  const tags = new Set<string>();

  let minPrice: number | null = null;
  let maxPrice: number | null = null;

  for (const product of products) {
    for (const tag of product.tags ?? []) {
      tags.add(tag);
    }

    const amount = product.price.amount;
    if (minPrice === null || amount < minPrice) {
      minPrice = amount;
    }
    if (maxPrice === null || amount > maxPrice) {
      maxPrice = amount;
    }
  }

  return {
    totalProducts: products.length,
    featuredProducts,
    tagsCount: tags.size,
    minPrice,
    maxPrice
  };
}

function formatPrice(amount: number | null, currency: string): string {
  if (amount === null) {
    return "—";
  }
  return amount.toLocaleString(undefined, {
    style: "currency",
    currency
  });
}

function renderHeroBlock(block: HeroBlock, stats: HomeStats, currency: string): JSX.Element {
  return (
    <section key={block.id} className="relative overflow-hidden rounded-xl border border-border/45 bg-card/80 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div className="pointer-events-none absolute inset-0 opacity-55">
        <div className="absolute left-0 top-0 h-full w-px bg-border/60" />
        <div className="absolute right-0 top-0 h-full w-px bg-border/60" />
        <div className="absolute left-0 top-[62px] h-px w-full bg-border/60" />
      </div>

      <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-10">
        <div className="space-y-5">
          {block.eyebrow && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="ui-kicker inline-flex rounded-full border border-border/70 bg-card/45 px-3 py-1"
            >
              {block.eyebrow}
            </motion.p>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="ui-title-serif text-balance text-[clamp(2.4rem,5.8vw,4.8rem)] leading-[0.98] text-foreground"
          >
            {block.title}
          </motion.h1>
          {block.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            className="ui-subtle max-w-2xl text-base leading-relaxed sm:text-lg"
          >
            {block.subtitle}
          </motion.p>
          )}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-wrap items-center gap-3"
          >
            {block.primaryCta && (
              <a
                href={block.primaryCta.href}
                className="inline-flex h-10 items-center justify-center rounded-[10px] border border-border/70 bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/92"
              >
                {block.primaryCta.label}
              </a>
            )}
            {block.secondaryCta && (
              <a
                href={block.secondaryCta.href}
                className="inline-flex h-10 items-center justify-center rounded-[10px] border border-border/60 bg-card/55 px-5 text-sm text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground"
              >
                {block.secondaryCta.label}
              </a>
            )}
          </motion.div>
        </div>

        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-3"
        >
          <div className="rounded-xl border border-border/45 bg-card/62 px-4 py-3">
            <p className="ui-kicker">Products</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{stats.totalProducts}</p>
          </div>
          <div className="rounded-xl border border-border/45 bg-card/62 px-4 py-3">
            <p className="ui-kicker">Featured</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{stats.featuredProducts}</p>
          </div>
          <div className="rounded-xl border border-border/45 bg-card/62 px-4 py-3">
            <p className="ui-kicker">Price Range</p>
            <p className="mt-1 text-sm text-foreground">
              {formatPrice(stats.minPrice, currency)} - {formatPrice(stats.maxPrice, currency)}
            </p>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

function renderRichTextBlock(block: RichTextBlock): JSX.Element {
  return (
    <section key={block.id} className="rounded-xl border border-border/45 bg-card/72 px-6 py-5">
      <p className="ui-subtle max-w-3xl text-sm leading-relaxed sm:text-base">{block.content}</p>
    </section>
  );
}

function renderCtaStripBlock(block: CtaStripBlock): JSX.Element {
  return <CtaStrip key={block.id} title={block.title} href={block.href} />;
}

function renderProductGridBlock(
  block: ProductGridBlock,
  visibleProducts: Product[],
  onQuickAdd: (product: Product) => void
): JSX.Element {
  return (
    <section
      key={block.id}
      id={block.id === "home-featured" ? "featured" : undefined}
      className="scroll-mt-24 space-y-4"
    >
      {(block.title || block.subtitle) && (
        <header className="space-y-2">
          {block.title && <h2 className="ui-title text-2xl sm:text-3xl">{block.title}</h2>}
          {block.subtitle && <p className="ui-subtle max-w-3xl text-sm sm:text-base">{block.subtitle}</p>}
          <div className="premium-divider" />
        </header>
      )}

      {visibleProducts.length === 0 ? (
        <EmptyState
          title="Подборка пока пустая"
          description="Попробуйте изменить фильтры или вернуться позже."
        />
      ) : (
        <motion.div
          className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {visibleProducts.map((product, index) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className={index === 0 ? "sm:col-span-2 xl:col-span-2" : undefined}
            >
              <ProductCard product={product} onQuickAdd={onQuickAdd} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}

function renderBlock(
  block: PageBlock,
  stats: HomeStats,
  currency: string,
  products: Product[],
  onQuickAdd: (product: Product) => void
): JSX.Element | null {
  if (block.type === "hero") {
    return renderHeroBlock(block, stats, currency);
  }

  if (block.type === "product-grid") {
    return renderProductGridBlock(block, filterProducts(products, block), onQuickAdd);
  }

  if (block.type === "rich-text") {
    return renderRichTextBlock(block);
  }

  if (block.type === "cta-strip") {
    return renderCtaStripBlock(block);
  }

  return null;
}

export function HomePageClient({ homePage, products }: HomePageClientProps) {
  const { addProduct } = useCartStore();
  const stats = useMemo(() => resolveHomeStats(products), [products]);
  const currency = products[0]?.price.currency ?? "USD";

  return (
    <div className="home-concept-editorial space-y-9 sm:space-y-10 lg:space-y-12">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Surface tone="elevated" className="relative overflow-hidden rounded-xl px-5 py-6 sm:px-6 sm:py-7">
          <div className="relative z-10 space-y-3">
            <div className="space-y-1.5">
              <p className="ui-kicker">Storefront direction</p>
              <h2 className="ui-title text-xl sm:text-2xl">Editorial</h2>
              <p className="ui-subtle max-w-xl text-sm sm:text-base">
                Единый визуальный язык для витрины: строгая типографика, воздух и premium-ритм.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="accent">Editorial locked</Badge>
              <Badge tone="muted">Home + Catalog + Product + Checkout</Badge>
            </div>
          </div>
        </Surface>

        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-1">
          <Surface tone="subtle" className="rounded-xl px-4 py-3">
            <p className="ui-kicker">Products</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{stats.totalProducts}</p>
          </Surface>
          <Surface tone="subtle" className="rounded-xl px-4 py-3">
            <p className="ui-kicker">Featured</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{stats.featuredProducts}</p>
          </Surface>
          <Surface tone="subtle" className="rounded-xl px-4 py-3">
            <p className="ui-kicker">Tags</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{stats.tagsCount}</p>
          </Surface>
        </div>
      </section>

      {homePage.blocks.map((block) =>
        renderBlock(block, stats, currency, products, (product) => addProduct(product.id))
      )}
    </div>
  );
}
