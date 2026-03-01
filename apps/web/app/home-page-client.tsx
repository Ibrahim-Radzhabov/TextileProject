"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Badge, CtaStrip, EmptyState, Hero, ProductCard, ProductGrid, Surface } from "@store-platform/ui";
import type {
  CtaStripBlock,
  HeroBlock,
  PageBlock,
  PageConfig,
  Product,
  ProductGridBlock,
  RichTextBlock
} from "@store-platform/shared-types";
import type { HomeConcept } from "@/lib/home-concept";
import { useCartStore } from "@/store/cart-store";

type HomePageClientProps = {
  homePage: PageConfig;
  products: Product[];
  concept: HomeConcept;
};

type HomeStats = {
  totalProducts: number;
  featuredProducts: number;
  tagsCount: number;
  minPrice: number | null;
  maxPrice: number | null;
};

type ConceptMeta = {
  id: HomeConcept;
  label: string;
  summary: string;
};

const conceptOptions: ConceptMeta[] = [
  {
    id: "aurora",
    label: "Aurora",
    summary: "Glassy gradients and soft glow."
  },
  {
    id: "editorial",
    label: "Editorial",
    summary: "Linear rhythm and premium typography."
  },
  {
    id: "mono",
    label: "Mono",
    summary: "Structured grid and minimal contrast."
  }
];

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

function renderHeroBlock(
  block: HeroBlock,
  concept: HomeConcept,
  stats: HomeStats,
  currency: string
): JSX.Element {
  if (concept === "aurora") {
    return (
      <section key={block.id} className="relative overflow-hidden rounded-[32px] border border-border/60 p-1">
        <div className="pointer-events-none absolute -left-16 top-[-6rem] h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute right-[-3rem] bottom-[-5rem] h-56 w-56 rounded-full bg-foreground/10 blur-3xl" />
        <div className="relative rounded-[28px] bg-surface-strong/75 p-3 sm:p-4">
          <Hero
            eyebrow={block.eyebrow}
            title={block.title}
            subtitle={block.subtitle}
            primaryCta={block.primaryCta}
            secondaryCta={block.secondaryCta}
          />
        </div>
      </section>
    );
  }

  if (concept === "editorial") {
    return (
      <section key={block.id} className="relative overflow-hidden rounded-[30px] border border-border/60 bg-surface-strong px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="pointer-events-none absolute inset-0 opacity-80">
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
                className="inline-flex rounded-full border border-border/70 bg-card/45 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
              >
                {block.eyebrow}
              </motion.p>
            )}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-balance text-[clamp(2.4rem,5.8vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-foreground"
            >
              {block.title}
            </motion.h1>
            {block.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
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
                  className="inline-flex h-10 items-center justify-center rounded-full border border-accent/55 bg-accent px-5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent/90"
                >
                  {block.primaryCta.label}
                </a>
              )}
              {block.secondaryCta && (
                <a
                  href={block.secondaryCta.href}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-border/70 bg-card/35 px-5 text-sm text-muted-foreground transition-colors hover:border-accent/45 hover:text-foreground"
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
            <div className="rounded-2xl border border-border/65 bg-card/45 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Products</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{stats.totalProducts}</p>
            </div>
            <div className="rounded-2xl border border-border/65 bg-card/45 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Featured</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{stats.featuredProducts}</p>
            </div>
            <div className="rounded-2xl border border-border/65 bg-card/45 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Price Range</p>
              <p className="mt-1 text-sm text-foreground">
                {formatPrice(stats.minPrice, currency)} - {formatPrice(stats.maxPrice, currency)}
              </p>
            </div>
          </motion.aside>
        </div>
      </section>
    );
  }

  return (
    <section key={block.id} className="relative overflow-hidden rounded-[30px] border border-border/55 bg-surface-strong px-5 py-10 text-center sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border/35" />
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-border/35" />
      </div>

      <div className="relative mx-auto max-w-3xl space-y-5">
        {block.eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex rounded-full border border-border/65 bg-card/35 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            {block.eyebrow}
          </motion.p>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-balance text-[clamp(2.4rem,6vw,4.7rem)] font-semibold leading-[1.02] tracking-[-0.03em]"
        >
          {block.title}
        </motion.h1>
        {block.subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {block.subtitle}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {block.primaryCta && (
            <a
              href={block.primaryCta.href}
              className="inline-flex h-10 items-center justify-center rounded-md border border-accent/55 bg-accent px-5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent/90"
            >
              {block.primaryCta.label}
            </a>
          )}
          {block.secondaryCta && (
            <a
              href={block.secondaryCta.href}
              className="inline-flex h-10 items-center justify-center rounded-md border border-border/65 bg-card/40 px-5 text-sm text-muted-foreground transition-colors hover:border-accent/45 hover:text-foreground"
            >
              {block.secondaryCta.label}
            </a>
          )}
        </motion.div>

        <div className="mx-auto grid max-w-xl grid-cols-3 gap-2 pt-3 text-left">
          <div className="rounded-lg border border-border/60 bg-card/35 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Products</p>
            <p className="mt-1 text-lg font-semibold">{stats.totalProducts}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-card/35 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Featured</p>
            <p className="mt-1 text-lg font-semibold">{stats.featuredProducts}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-card/35 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Tags</p>
            <p className="mt-1 text-lg font-semibold">{stats.tagsCount}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function renderRichTextBlock(block: RichTextBlock, concept: HomeConcept): JSX.Element {
  if (concept === "editorial") {
    return (
      <section key={block.id} className="rounded-2xl border border-border/60 bg-surface-soft px-5 py-4">
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">{block.content}</p>
      </section>
    );
  }

  if (concept === "mono") {
    return (
      <section key={block.id} className="rounded-2xl border border-border/55 bg-card/30 px-5 py-4 text-center">
        <p className="mx-auto max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">{block.content}</p>
      </section>
    );
  }

  return (
    <section key={block.id}>
      <p className="max-w-xl text-sm text-muted-foreground">{block.content}</p>
    </section>
  );
}

function renderCtaStripBlock(block: CtaStripBlock, concept: HomeConcept): JSX.Element {
  if (concept === "mono") {
    return (
      <section key={block.id} className="rounded-2xl border border-border/60 bg-surface-strong p-2">
        <CtaStrip title={block.title} href={block.href} />
      </section>
    );
  }

  return <CtaStrip key={block.id} title={block.title} href={block.href} />;
}

function renderProductGridBlock(
  block: ProductGridBlock,
  concept: HomeConcept,
  visibleProducts: Product[],
  onQuickAdd: (product: Product) => void
): JSX.Element {
  if (concept === "aurora") {
    return (
      <section
        key={block.id}
        id={block.id === "home-featured" ? "featured" : undefined}
        className="scroll-mt-24"
      >
        <Surface tone="subtle" className="space-y-5 rounded-3xl px-4 py-5 sm:px-5 sm:py-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge tone="muted">Drop</Badge>
            <Badge tone="accent">Items: {visibleProducts.length}</Badge>
            {block.subtitle && <span className="text-xs text-muted-foreground">{block.subtitle}</span>}
          </div>
          <ProductGrid
            title={block.title}
            subtitle={undefined}
            products={visibleProducts}
            onQuickAdd={onQuickAdd}
          />
        </Surface>
      </section>
    );
  }

  if (concept === "editorial") {
    return (
      <section
        key={block.id}
        id={block.id === "home-featured" ? "featured" : undefined}
        className="scroll-mt-24 space-y-4"
      >
        {(block.title || block.subtitle) && (
          <header className="space-y-2">
            {block.title && <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{block.title}</h2>}
            {block.subtitle && <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">{block.subtitle}</p>}
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

  return (
    <section
      key={block.id}
      id={block.id === "home-featured" ? "featured" : undefined}
      className="scroll-mt-24 space-y-4"
    >
      {(block.title || block.subtitle) && (
        <header className="space-y-2 text-center">
          {block.title && <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{block.title}</h2>}
          {block.subtitle && (
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">{block.subtitle}</p>
          )}
        </header>
      )}

      {visibleProducts.length === 0 ? (
        <EmptyState
          title="Подборка пока пустая"
          description="Попробуйте изменить фильтры или вернуться позже."
        />
      ) : (
        <motion.div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {visibleProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className="min-w-[265px] snap-start sm:min-w-[310px]"
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
  concept: HomeConcept,
  stats: HomeStats,
  currency: string,
  products: Product[],
  onQuickAdd: (product: Product) => void
): JSX.Element | null {
  if (block.type === "hero") {
    return renderHeroBlock(block, concept, stats, currency);
  }

  if (block.type === "product-grid") {
    return renderProductGridBlock(block, concept, filterProducts(products, block), onQuickAdd);
  }

  if (block.type === "rich-text") {
    return renderRichTextBlock(block, concept);
  }

  if (block.type === "cta-strip") {
    return renderCtaStripBlock(block, concept);
  }

  return null;
}

export function HomePageClient({ homePage, products, concept }: HomePageClientProps) {
  const { addProduct } = useCartStore();
  const stats = useMemo(() => resolveHomeStats(products), [products]);
  const currency = products[0]?.price.currency ?? "USD";
  const activeConcept = conceptOptions.find((option) => option.id === concept) ?? conceptOptions[0];

  return (
    <div
      className={[
        "space-y-10 lg:space-y-12",
        concept === "editorial" ? "home-concept-editorial" : "",
        concept === "mono" ? "home-concept-mono" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Surface tone="elevated" className="relative overflow-hidden px-4 py-5 sm:px-5">
          <div className="pointer-events-none absolute inset-0 opacity-75">
            <div className="absolute -left-8 top-[-4rem] h-44 w-44 rounded-full bg-accent/20 blur-3xl" />
            <div className="absolute right-[-4rem] bottom-[-4rem] h-52 w-52 rounded-full bg-foreground/10 blur-3xl" />
          </div>
          <div className="relative z-10 space-y-3">
            <div className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Storefront direction</p>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{activeConcept.label}</h2>
              <p className="max-w-xl text-sm text-muted-foreground sm:text-base">{activeConcept.summary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {conceptOptions.map((option) => (
                <a
                  key={option.id}
                  href={`/?concept=${option.id}`}
                  className={[
                    "rounded-full border px-3 py-1 text-[11px] transition-colors",
                    concept === option.id
                      ? "border-accent/70 bg-accent/12 text-foreground"
                      : "border-border/60 text-muted-foreground hover:border-accent/50 hover:text-foreground"
                  ].join(" ")}
                >
                  {option.label}
                </a>
              ))}
            </div>
          </div>
        </Surface>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <Surface tone="subtle" className="rounded-2xl px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Products</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{stats.totalProducts}</p>
          </Surface>
          <Surface tone="subtle" className="rounded-2xl px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Featured</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{stats.featuredProducts}</p>
          </Surface>
          <Surface tone="subtle" className="rounded-2xl px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Price Range</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {formatPrice(stats.minPrice, currency)} - {formatPrice(stats.maxPrice, currency)}
            </p>
          </Surface>
        </div>
      </section>

      {homePage.blocks.map((block) =>
        renderBlock(block, concept, stats, currency, products, (product) => addProduct(product.id))
      )}
    </div>
  );
}
