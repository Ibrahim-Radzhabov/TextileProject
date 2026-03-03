"use client";

import { motion } from "framer-motion";
import {
  CtaStrip,
  EmptyState,
  HeroMedia,
  ProductCard,
  gridContainerVariants,
  gridItemVariants,
  transitionQuick,
  transitionStandard
} from "@store-platform/ui";
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
import { useFavoritesStore } from "@/store/favorites-store";

type HomePageClientProps = {
  homePage: PageConfig;
  products: Product[];
};

function resolveHeroContent(block: HeroBlock) {
  return {
    eyebrow: block.content?.eyebrow ?? block.eyebrow,
    title: block.content?.title ?? block.title ?? "",
    subtitle: block.content?.subtitle ?? block.subtitle,
    trustLine: block.content?.trustLine ?? block.trustLine,
    quickLinks: block.content?.quickLinks ?? block.quickLinks ?? [],
    primaryCta: block.content?.primaryCta ?? block.primaryCta,
    secondaryCta: block.content?.secondaryCta ?? block.secondaryCta
  };
}

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
  const content = resolveHeroContent(block);
  const contentPlacement = block.contentPlacement ?? "overlay";
  const heroOverlayClass = resolveHeroOverlayClass(block.media?.overlayPreset);
  const heroQuickLinks = content.quickLinks.slice(0, 4);
  const hasQuickLinks = heroQuickLinks.length > 0;

  const heroTextContent = (
    <div className="relative z-10 flex min-h-[420px] items-end px-5 pb-6 pt-10 sm:min-h-[560px] sm:px-10 sm:pb-10 sm:pt-14 lg:min-h-[680px] lg:px-14 lg:pb-12 lg:pt-16">
      <div className="max-w-[44rem] space-y-4 sm:space-y-5 lg:space-y-6">
        {content.eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionQuick}
            className="ui-kicker inline-flex rounded-pill border border-white/45 bg-black/15 px-3 py-1 text-white/96 backdrop-blur-sm"
          >
            {content.eyebrow}
          </motion.p>
        )}
        {content.title && (
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitionStandard, delay: 0.03 }}
            className="ui-title-display ui-h1 max-w-[12ch] text-white"
          >
            {content.title}
          </motion.h1>
        )}
        {content.subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitionStandard, delay: 0.08 }}
            className="ui-body max-w-[62ch] text-white/86"
          >
            {content.subtitle}
          </motion.p>
        )}
        {(content.primaryCta || content.secondaryCta) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitionQuick, delay: 0.12 }}
            className="flex flex-wrap items-center gap-2.5 sm:gap-3"
          >
            {content.primaryCta && (
              <a
                href={content.primaryCta.href}
                className="inline-flex h-11 items-center justify-center rounded-[10px] border border-white/20 bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/92"
              >
                {content.primaryCta.label}
              </a>
            )}
            {content.secondaryCta && (
              <a
                href={content.secondaryCta.href}
                className="inline-flex h-11 items-center justify-center rounded-[10px] border border-white/48 bg-white/12 px-6 text-sm font-medium text-white/96 backdrop-blur-sm transition-colors hover:border-white/62 hover:bg-white/20"
              >
                {content.secondaryCta.label}
              </a>
            )}
          </motion.div>
        )}
        {content.trustLine && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitionQuick, delay: 0.16 }}
            className="ui-meta text-white/72"
          >
            {content.trustLine}
          </motion.p>
        )}
      </div>
    </div>
  );

  const quickLinksRail = hasQuickLinks ? (
    <motion.nav
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transitionQuick, delay: 0.18 }}
      className="relative z-10"
      aria-label="Быстрые сценарии подбора"
    >
      <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-full gap-2.5 sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
          {heroQuickLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="group min-w-[15rem] rounded-xl border border-border/42 bg-card/74 p-4 text-foreground backdrop-blur-sm transition-colors hover:border-border/68 hover:bg-card/90 sm:min-w-0"
            >
              <p className="ui-label text-foreground/96">{link.label}</p>
              {link.subtitle && (
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground/92">
                  {link.subtitle}
                </p>
              )}
            </a>
          ))}
        </div>
      </div>
    </motion.nav>
  ) : null;

  if (contentPlacement === "below") {
    return (
      <section key={block.id} className="space-y-4 sm:space-y-5">
        <section className="relative isolate overflow-hidden rounded-[1.85rem] border border-border/24 bg-card/22">
          {block.media && (
            <HeroMedia
              media={block.media}
              title={content.title}
              defaultOverlayOpacity={0.1}
              overlayClassName="bg-background/10"
            />
          )}
          <div className="pointer-events-none absolute inset-0 z-[1]">
            <div className={`absolute inset-0 ${heroOverlayClass}`} />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,10,0.15)_0%,rgba(6,7,10,0.08)_42%,rgba(6,7,10,0.74)_100%)]" />
          </div>
          {heroTextContent}
        </section>
        {quickLinksRail}
      </section>
    );
  }

  return (
    <section
      key={block.id}
      className="relative isolate overflow-hidden rounded-[1.85rem] border border-border/24 bg-card/22"
    >
      {block.media && (
        <HeroMedia
          media={block.media}
          title={content.title}
          defaultOverlayOpacity={0.1}
          overlayClassName="bg-background/12"
        />
      )}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className={`absolute inset-0 ${heroOverlayClass}`} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,10,0.15)_0%,rgba(6,7,10,0.08)_42%,rgba(6,7,10,0.74)_100%)]" />
      </div>
      {heroTextContent}
      {hasQuickLinks && <div className="px-5 pb-5 sm:px-10 sm:pb-8 lg:px-14 lg:pb-10">{quickLinksRail}</div>}
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
        <h2 className="ui-title-display ui-h2">{block.title}</h2>
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
  onQuickAdd: (product: Product) => void,
  favoriteProductIds: string[],
  onToggleFavorite: (product: Product) => void
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
          className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4"
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {visibleProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={gridItemVariants}
            >
              <ProductCard
                product={product}
                onQuickAdd={onQuickAdd}
                isFavorite={favoriteProductIds.includes(product.id)}
                onToggleFavorite={onToggleFavorite}
              />
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
  onQuickAdd: (product: Product) => void,
  favoriteProductIds: string[],
  onToggleFavorite: (product: Product) => void
): JSX.Element | null {
  if (block.type === "hero") {
    return renderHeroBlock(block);
  }

  if (block.type === "product-grid") {
    return renderProductGridBlock(
      block,
      filterProducts(products, block),
      onQuickAdd,
      favoriteProductIds,
      onToggleFavorite
    );
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
  const favoriteProductIds = useFavoritesStore((state) => state.productIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleProduct);

  return (
    <div className="home-concept-editorial space-y-9 sm:space-y-10 lg:space-y-12">
      {homePage.blocks.map((block) =>
        renderBlock(
          block,
          products,
          (product) => addProduct(product.id),
          favoriteProductIds,
          (product) => toggleFavorite(product.id)
        )
      )}
    </div>
  );
}
