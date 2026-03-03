"use client";

import { motion } from "framer-motion";
import { CtaStrip, EmptyState, HeroMedia, ProductCard } from "@store-platform/ui";
import type {
  CtaStripBlock,
  HeroBlock,
  MediaFeatureBlock,
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

function resolveHeroOverlayClass(preset?: "editorial" | "balanced" | "contrast"): string {
  if (preset === "contrast") {
    return "bg-[linear-gradient(92deg,rgba(10,10,10,0.78)_0%,rgba(10,10,10,0.46)_42%,rgba(10,10,10,0.14)_64%,rgba(10,10,10,0.52)_100%)]";
  }

  if (preset === "balanced") {
    return "bg-[linear-gradient(92deg,rgba(10,10,10,0.62)_0%,rgba(10,10,10,0.32)_38%,rgba(10,10,10,0.08)_63%,rgba(10,10,10,0.4)_100%)]";
  }

  return "bg-[linear-gradient(92deg,rgba(10,10,10,0.7)_0%,rgba(10,10,10,0.38)_40%,rgba(10,10,10,0.1)_62%,rgba(10,10,10,0.46)_100%)]";
}

function renderHeroBlock(block: HeroBlock): JSX.Element {
  const heroOverlayClass = resolveHeroOverlayClass(block.media?.overlayPreset);
  const heroQuickLinks = block.quickLinks?.slice(0, 4) ?? [];

  return (
    <section
      key={block.id}
      className="relative isolate overflow-hidden rounded-[1.75rem] bg-card/40 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10"
    >
      {block.media && (
        <HeroMedia
          media={block.media}
          title={block.title}
          defaultOverlayOpacity={0.1}
          overlayClassName="bg-background/20"
        />
      )}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className={`absolute inset-0 ${heroOverlayClass}`} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.16)_0%,rgba(10,10,10,0.04)_38%,rgba(10,10,10,0.52)_100%)]" />
      </div>

      <div className="relative z-10 grid gap-6 lg:min-h-[640px] lg:grid-cols-[minmax(0,0.72fr)_minmax(0,0.28fr)] lg:items-end">
        <div className="max-w-3xl space-y-5 lg:space-y-6">
          {block.eyebrow && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="inline-flex rounded-full border border-white/50 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.07em] text-white"
            >
              {block.eyebrow}
            </motion.p>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="ui-title-display max-w-[11ch] text-[clamp(2.4rem,5.8vw,5.2rem)] leading-[0.96] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.34)]"
          >
            {block.title}
          </motion.h1>
          {block.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-2xl text-base leading-relaxed text-white/88 drop-shadow-[0_2px_14px_rgba(0,0,0,0.3)] sm:text-lg"
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
                className="inline-flex h-10 items-center justify-center rounded-[10px] border border-white/40 bg-white/20 px-5 text-sm text-white/95 transition-colors hover:border-white/60 hover:bg-white/25"
              >
                {block.secondaryCta.label}
              </a>
            )}
          </motion.div>
          {block.trustLine && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-xs uppercase tracking-[0.06em] text-white/82 sm:text-[13px]"
            >
              {block.trustLine}
            </motion.p>
          )}
        </div>

        {heroQuickLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1"
          >
            {heroQuickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group rounded-2xl border border-white/25 bg-black/22 p-4 text-white backdrop-blur-[2px] transition-colors hover:border-white/45 hover:bg-black/30"
              >
                <p className="text-sm font-medium tracking-[0.01em] text-white/96">{link.label}</p>
                {link.subtitle && (
                  <p className="mt-1 text-xs leading-relaxed text-white/72">{link.subtitle}</p>
                )}
              </a>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function renderMediaFeatureBlock(block: MediaFeatureBlock): JSX.Element {
  const textSideClass = block.align === "right" ? "lg:order-2" : "lg:order-1";
  const mediaSideClass = block.align === "right" ? "lg:order-1" : "lg:order-2";

  return (
    <section
      key={block.id}
      className="grid gap-4 overflow-hidden rounded-xl border border-border/45 bg-card/78 p-4 sm:p-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
    >
      <div className={`space-y-3 sm:space-y-4 ${textSideClass}`}>
        {block.eyebrow && <p className="ui-kicker">{block.eyebrow}</p>}
        <h2 className="ui-title-display text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.02]">{block.title}</h2>
        {block.subtitle && <p className="text-sm font-medium text-foreground/90 sm:text-base">{block.subtitle}</p>}
        {block.body && <p className="ui-subtle max-w-xl text-sm leading-relaxed sm:text-base">{block.body}</p>}
        {block.cta && (
          <a
            href={block.cta.href}
            className="inline-flex h-10 items-center justify-center rounded-[10px] border border-border/70 bg-card/65 px-4 text-sm text-foreground transition-colors hover:border-border/90"
          >
            {block.cta.label}
          </a>
        )}
      </div>
      <div className={`relative overflow-hidden rounded-xl border border-border/40 ${mediaSideClass}`}>
        <HeroMedia
          media={block.media}
          title={block.title}
          assetClassName="h-full min-h-[280px] w-full object-cover"
          defaultOverlayOpacity={0.2}
        />
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
  products: Product[],
  onQuickAdd: (product: Product) => void
): JSX.Element | null {
  if (block.type === "hero") {
    return renderHeroBlock(block);
  }

  if (block.type === "product-grid") {
    return renderProductGridBlock(block, filterProducts(products, block), onQuickAdd);
  }

  if (block.type === "media-feature") {
    return renderMediaFeatureBlock(block);
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

  return (
    <div className="home-concept-editorial space-y-9 sm:space-y-10 lg:space-y-12">
      {homePage.blocks.map((block) =>
        renderBlock(block, products, (product) => addProduct(product.id))
      )}
    </div>
  );
}
