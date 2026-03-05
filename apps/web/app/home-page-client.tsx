"use client";

import { motion } from "framer-motion";
import {
  CtaStrip,
  EmptyState,
  HeroMedia,
  ProductCard,
  gridContainerVariants,
  gridItemVariants,
  transitionQuick
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

function renderHeroBlock(block: HeroBlock): JSX.Element {
  const content = resolveHeroContent(block);
  return (
    <section key={block.id} className="overflow-hidden rounded-md border border-border/28 bg-card/80">
      <section className="relative isolate min-h-[360px] sm:min-h-[470px] lg:min-h-[540px]">
        {block.media && (
          <HeroMedia
            media={block.media}
            title={content.title}
            defaultOverlayOpacity={0.04}
            overlayClassName="bg-background/8"
          />
        )}
      </section>
    </section>
  );
}

function renderHeroQuickLinksBar(
  links: ReturnType<typeof resolveHeroContent>["quickLinks"],
  key: string
): JSX.Element {
  return (
    <motion.section
      key={key}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transitionQuick, delay: 0.2 }}
      className="sticky top-[4.1rem] z-30 sm:top-[4.7rem]"
    >
      <nav
        aria-label="Быстрые переходы по каталогу"
        className="rounded-[8px] border border-border/38 bg-card/88 p-1.5 backdrop-blur-xl sm:p-2"
      >
        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-1.5 snap-x snap-mandatory sm:grid sm:min-w-0 sm:grid-cols-4 sm:gap-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group w-[calc(50%-0.1875rem)] shrink-0 snap-start rounded-[6px] border border-border/36 bg-card/72 px-2.5 py-2 text-left transition-colors hover:bg-card/92 sm:w-auto sm:px-3 sm:py-2.5"
              >
                <p className="ui-label text-[11px] leading-tight text-foreground/92 sm:text-[12px]">
                  {link.label}
                </p>
                {link.subtitle && (
                  <p className="mt-1 hidden text-[11px] leading-relaxed text-muted-foreground/86 sm:block">
                    {link.subtitle}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </motion.section>
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
            className="inline-flex h-10 items-center justify-center rounded-[10px] border border-accent/70 bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90"
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
  const isHomeFeatured = block.id === "home-featured";

  return (
    <section
      key={block.id}
      id={isHomeFeatured ? "featured" : undefined}
      className="scroll-mt-24 space-y-4"
    >
      {(block.title || block.subtitle) && (
        <header className={isHomeFeatured ? "space-y-2 text-center" : "space-y-2"}>
          {block.title && (
            <h2 className={isHomeFeatured ? "ui-title-display ui-h2" : "ui-title text-2xl sm:text-3xl"}>
              {block.title}
            </h2>
          )}
          {block.subtitle && (
            <p className={isHomeFeatured ? "ui-subtle mx-auto max-w-3xl text-sm sm:text-base" : "ui-subtle max-w-3xl text-sm sm:text-base"}>
              {block.subtitle}
            </p>
          )}
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
  const heroBlock = homePage.blocks.find((entry): entry is HeroBlock => entry.type === "hero");
  const heroQuickLinks = heroBlock ? resolveHeroContent(heroBlock).quickLinks.slice(0, 4) : [];

  return (
    <div className="home-concept-editorial space-y-8 sm:space-y-9 lg:space-y-11">
      {homePage.blocks.flatMap((block) => {
        const blockNode = renderBlock(
          block,
          products,
          (product) => addProduct(product.id),
          favoriteProductIds,
          (product) => toggleFavorite(product.id)
        );

        if (!blockNode) {
          return [];
        }

        if (block.type === "hero" && heroQuickLinks.length > 0) {
          return [blockNode, renderHeroQuickLinksBar(heroQuickLinks, `${block.id}-quick-links`)];
        }

        return [blockNode];
      })}
    </div>
  );
}
