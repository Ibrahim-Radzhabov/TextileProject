"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Button,
  CtaStrip,
  EmptyState,
  HeroMedia,
  ProductCard,
  gridContainerVariants,
  gridItemVariants
} from "@store-platform/ui";
import type {
  CtaStripBlock,
  EditorialRailBlock,
  HeroBlock,
  MediaFeatureBlock,
  PageBlock,
  PageConfig,
  Product,
  ProductGridBlock,
  RichTextBlock
} from "@store-platform/shared-types";
import { useCartStore } from "@/store/cart-store";
import { HeroPinnedVideo } from "@/components/hero-pinned-video";
import { HeroVideoEditorial } from "@/components/hero-video-editorial";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

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

function renderHeroBlock(block: HeroBlock, revealContent?: React.ReactNode): JSX.Element {
  const content = resolveHeroContent(block);
  const media = block.media;
  const contentPlacement = block.contentPlacement ?? "overlay";
  const hasHeroCopy = Boolean(
    content.eyebrow ||
      content.title ||
      content.subtitle ||
      content.trustLine ||
      content.primaryCta ||
      content.secondaryCta
  );

  const heroCopy = hasHeroCopy ? (
    <div className="space-y-3.5 sm:space-y-5">
      {content.eyebrow && (
        <p className="ui-kicker text-foreground/88">
          {content.eyebrow}
        </p>
      )}
      {content.title && (
        <h1 className="ui-title-display text-[clamp(1.82rem,8vw,4.9rem)] leading-[0.93] text-foreground">
          {content.title}
        </h1>
      )}
      {content.subtitle && (
        <p className="ui-subtle max-w-2xl text-sm sm:text-base lg:text-lg">
          {content.subtitle}
        </p>
      )}
      {(content.primaryCta || content.secondaryCta) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {content.primaryCta && (
            <Button asChild size="md" ripple>
              <a href={content.primaryCta.href}>{content.primaryCta.label}</a>
            </Button>
          )}
          {content.secondaryCta && (
            <Button
              asChild
              size="md"
              ripple
              className="border-border/52 bg-card/74 text-foreground hover:border-border/70 hover:bg-card/92"
            >
              <a href={content.secondaryCta.href}>{content.secondaryCta.label}</a>
            </Button>
          )}
        </div>
      )}
      {content.trustLine && <p className="ui-subtle text-xs sm:text-sm">{content.trustLine}</p>}
    </div>
  ) : null;

  if (!media) {
    return (
      <section key={block.id} className="overflow-hidden rounded-md border border-border/28 bg-card/80">
        <section className="relative isolate min-h-[360px] px-4 py-6 sm:min-h-[470px] sm:px-6 sm:py-7 lg:min-h-[540px] lg:px-8 lg:py-9">
          {heroCopy}
        </section>
      </section>
    );
  }

  if (media.type === "video") {
    return (
      <section key={block.id} className="space-y-16 sm:space-y-20 lg:space-y-24">
        <HeroVideoEditorial
          media={media}
          title={content.title || "Velura"}
          desktopBreakout
        />
        <div className="mx-auto max-w-3xl text-center space-y-5">
          <h1 className="font-display text-[clamp(1.8rem,4.5vw,3.2rem)] leading-[1.05] tracking-tight text-foreground">
            Текстиль для тихого интерьера
          </h1>
          <p className="ui-subtle mx-auto max-w-xl text-sm leading-relaxed sm:text-base">
            Шторы, тюль и комплекты из натуральных тканей. Подбор под свет, фактуру и задачу комнаты.
          </p>
          <div className="flex items-center justify-center gap-8 pt-3">
            <a href="/catalog" className="text-[13px] tracking-[0.12em] uppercase text-foreground/70 transition-colors duration-300 hover:text-foreground">
              — Каталог —
            </a>
            <a href="/guides/light-control" className="text-[13px] tracking-[0.12em] uppercase text-foreground/70 transition-colors duration-300 hover:text-foreground">
              — Гид по тканям —
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section key={block.id} className="overflow-hidden rounded-md border border-border/28 bg-card/80">
      <section className="relative isolate min-h-[360px] sm:min-h-[470px] lg:min-h-[540px]">
        {media && (
          <HeroMedia
            media={media}
            title={content.title}
            defaultOverlayOpacity={0.04}
            overlayClassName="bg-background/8"
          />
        )}
        {contentPlacement === "overlay" && heroCopy && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-3 sm:p-5 lg:p-6">
            <div className="pointer-events-auto max-w-[min(92vw,780px)] rounded-[10px] border border-border/35 bg-card/76 p-4 shadow-soft-subtle backdrop-blur-xl sm:p-6 lg:p-7">
              {heroCopy}
            </div>
          </div>
        )}
      </section>
      {contentPlacement === "below" && heroCopy && (
        <div className="border-t border-border/28 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <div className="max-w-3xl">{heroCopy}</div>
        </div>
      )}
    </section>
  );
}

function renderMediaFeatureBlock(block: MediaFeatureBlock): JSX.Element {
  const textSideClass = block.align === "right" ? "lg:order-2" : "lg:order-1";
  const mediaSideClass = block.align === "right" ? "lg:order-1" : "lg:order-2";

  return (
    <section
      key={block.id}
      className="grid gap-8 lg:grid-cols-2 lg:gap-12"
    >
      <div className={`space-y-4 sm:space-y-5 self-center ${textSideClass}`}>
        {block.eyebrow && <p className="ui-kicker">{block.eyebrow}</p>}
        <h2 className="ui-title-display text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.05]">{block.title}</h2>
        {block.subtitle && <p className="text-sm font-medium text-foreground/80 sm:text-base">{block.subtitle}</p>}
        {block.body && <p className="ui-subtle max-w-xl text-sm leading-relaxed sm:text-base">{block.body}</p>}
        {block.cta && (
          <a
            href={block.cta.href}
            className="ui-button inline-block border-b border-foreground pb-1 text-foreground transition-opacity hover:opacity-60"
          >
            {block.cta.label}
          </a>
        )}
      </div>
      <div className={`relative aspect-[4/3] overflow-hidden ${mediaSideClass}`}>
        <HeroMedia
          media={block.media}
          title={block.title}
          assetClassName="h-full w-full object-cover"
          defaultOverlayOpacity={0}
        />
      </div>
    </section>
  );
}

function EditorialRailSection({ block }: { block: EditorialRailBlock }): JSX.Element {
  const items = block.items.slice(0, 4);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const initialScrollRef = useRef<number | null>(null);

  const pad = (n: number) => String(n + 1).padStart(2, "0");

  const updateScrollState = () => {
    const track = trackRef.current;
    if (!track) return;
    /* capture the initial scrollLeft on first call (accounts for padding offset) */
    if (initialScrollRef.current === null) {
      initialScrollRef.current = track.scrollLeft;
    }
    const scrolled = track.scrollLeft - (initialScrollRef.current ?? 0);
    setCanScrollLeft(scrolled > 20);
    setCanScrollRight(track.scrollLeft < track.scrollWidth - track.clientWidth - 8);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateScrollState();
    track.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.querySelector("article")?.offsetWidth ?? 400;
    const gap = 32;
    track.scrollBy({
      left: direction === "right" ? cardWidth + gap : -(cardWidth + gap),
      behavior: "smooth"
    });
  };

  return (
    <section className="space-y-10 sm:space-y-14">
      {/* header with navigation arrows */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] tracking-[0.14em] uppercase text-foreground/45">Журнал</p>
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.8rem)] leading-[1.05] text-foreground">
            {block.title}
          </h2>
        </div>
        {block.subtitle && (
          <p className="max-w-sm text-sm leading-relaxed text-foreground/50">
            {block.subtitle}
          </p>
        )}
      </header>

      <div className="border-t border-foreground/10" />

      {/* horizontal scroll track with side arrows */}
      <div className="relative">
        {/* left arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Предыдущая статья"
            className="absolute left-0 top-1/3 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-background/80 text-foreground/60 backdrop-blur-sm transition-all duration-200 hover:bg-background hover:text-foreground"
          >
            ←
          </button>
        )}

        {/* right arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Следующая статья"
            className="absolute right-0 top-1/3 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-background/80 text-foreground/60 backdrop-blur-sm transition-all duration-200 hover:bg-background hover:text-foreground"
          >
            →
          </button>
        )}

        <div
          ref={trackRef}
          className="hide-scrollbar -mx-4 flex gap-6 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:gap-8 sm:px-6 lg:-mx-8 lg:px-8"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {items.map((item, index) => (
            <article
              key={item.id}
              className="group w-[78vw] flex-shrink-0 sm:w-[44vw] lg:w-[32vw]"
              style={{ scrollSnapAlign: "start" }}
            >
              <a href={item.href} className="block space-y-4 focus-visible:outline-none">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <HeroMedia
                    media={item.media}
                    title={item.title}
                    assetClassName="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    defaultOverlayOpacity={0}
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[11px] tracking-[0.14em] uppercase text-foreground/30">
                    {pad(index)}
                  </span>
                  <h3 className="font-display text-[1.1rem] leading-[1.15] text-foreground sm:text-[1.25rem]">
                    {item.title}
                  </h3>
                  <p className="line-clamp-2 max-w-[36ch] text-[13px] leading-relaxed text-foreground/45">
                    {item.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase text-foreground/50 transition-colors duration-300 group-hover:text-foreground">
                    {item.ctaLabel ?? "Читать"}
                    <span className="inline-block opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderEditorialRailBlock(block: EditorialRailBlock): JSX.Element {
  return <EditorialRailSection key={block.id} block={block} />;
}

function renderRichTextBlock(block: RichTextBlock): JSX.Element {
  return (
    <section key={block.id} className="py-4">
      <p className="ui-subtle max-w-2xl text-sm leading-relaxed sm:text-base">{block.content}</p>
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
  const isHomeFeatured = block.id === "home-featured";
  const productsToRender = isHomeFeatured ? visibleProducts.slice(0, 6) : visibleProducts;

  return (
    <section
      key={block.id}
      id={isHomeFeatured ? "featured" : undefined}
      className="scroll-mt-24 space-y-8"
    >
      {productsToRender.length === 0 ? (
        <EmptyState
          title="Подборка пока пустая"
          description="Попробуйте изменить фильтры или вернуться позже."
        />
      ) : (
        <motion.div
          className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16"
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {productsToRender.map((product) => (
            <motion.div
              key={product.id}
              variants={gridItemVariants}
            >
              <ProductCard
                product={product}
                variant="editorial"
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {isHomeFeatured && visibleProducts.length > 6 && (
        <div className="text-center pt-4">
          <a href="/catalog" className="ui-button border-b border-foreground pb-1 text-foreground transition-opacity hover:opacity-60">
            Все позиции
          </a>
        </div>
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
    return renderProductGridBlock(
      block,
      filterProducts(products, block),
      onQuickAdd
    );
  }

  if (block.type === "media-feature") {
    return renderMediaFeatureBlock(block);
  }

  if (block.type === "editorial-rail") {
    return renderEditorialRailBlock(block);
  }

  if (block.type === "rich-text") {
    return renderRichTextBlock(block);
  }

  if (block.type === "cta-strip") {
    return renderCtaStripBlock(block);
  }

  return null;
}

function RevealSection({ children }: { children: React.ReactNode }) {
  const ref = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="reveal-on-scroll">
      {children}
    </div>
  );
}

export function HomePageClient({ homePage, products }: HomePageClientProps) {
  const { addProduct } = useCartStore();

  return (
    <div className="home-concept-editorial space-y-16 sm:space-y-24 lg:space-y-32">
      {homePage.blocks.flatMap((block) => {
        if (block.type === "hero") {
          return [renderHeroBlock(block)];
        }

        const blockNode = renderBlock(
          block,
          products,
          (product) => addProduct(product.id)
        );

        if (!blockNode) {
          return [];
        }

        const nodes = [
          <RevealSection key={`reveal-${block.id}`}>
            {blockNode}
          </RevealSection>
        ];

        // Editorial pause between products and journal
        if (block.type === "product-grid") {
          nodes.push(
            <RevealSection key="editorial-pause">
              <section className="relative aspect-[21/9] overflow-hidden">
                <img
                  src="/demo/journal/journal-light-control.jpg"
                  alt="Фактура ткани крупным планом"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/30 to-transparent p-8 sm:p-12 lg:p-16">
                  <p className="ui-title-display max-w-lg text-[clamp(1.5rem,3vw,2.5rem)] text-white">
                    Фактура, свет и тишина в каждой складке
                  </p>
                </div>
              </section>
            </RevealSection>
          );
        }

        return nodes;
      })}
    </div>
  );
}
