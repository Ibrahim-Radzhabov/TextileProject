"use client";

import Link from "next/link";
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
import { TextileTypeSwitcher } from "@/components/textile-type-switcher";
import styles from "./home-page-editorial-rail.module.css";

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
    const overlayVariant = block.overlayVariant ?? "full";
    const quickLinks = content.quickLinks ?? block.quickLinks ?? [];
    const primaryCta = content.primaryCta ?? block.primaryCta;

    if (overlayVariant === "card") {
      return (
        <section key={block.id} className="rounded-md">
          <HeroVideoEditorial
            media={media}
            title={content.title || block.title || block.cardTitle || ""}
            cardTitle={block.cardTitle}
            cardLinks={quickLinks.length > 0 ? quickLinks.map((l) => ({ label: l.label, href: l.href, subtitle: l.subtitle })) : undefined}
            primaryCta={primaryCta}
            introText={block.introText}
            revealContent={revealContent}
            desktopBreakout
          />
        </section>
      );
    }

    if (contentPlacement === "overlay" && heroCopy) {
      return (
        <section key={block.id} className="rounded-md bg-card/80">
          <HeroPinnedVideo
            media={media}
            title={content.title}
            overlayContent={
              <div className="rounded-[4px] bg-card/96 px-6 py-5 shadow-soft-subtle sm:px-8 sm:py-7">
                {heroCopy}
              </div>
            }
          />
        </section>
      );
    }

    return (
      <section key={block.id} className="rounded-md border border-border/28 bg-card/80">
        <HeroPinnedVideo media={media} title={content.title} />
        {heroCopy && (
          <div className="border-t border-border/28 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
            <div className="max-w-3xl">{heroCopy}</div>
          </div>
        )}
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

function EditorialRailSection({ block }: { block: EditorialRailBlock }): JSX.Element {
  const items = block.items;
  const railRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) {
      return undefined;
    }

    let frame = 0;

    const syncActiveIndex = () => {
      frame = 0;

      const railRect = rail.getBoundingClientRect();
      let closestIndex = 0;
      let bestVisibleWidth = 0;

      itemRefs.current.forEach((item, index) => {
        if (!item) {
          return;
        }

        const itemRect = item.getBoundingClientRect();
        const visibleWidth = Math.max(
          0,
          Math.min(itemRect.right, railRect.right) - Math.max(itemRect.left, railRect.left)
        );

        if (visibleWidth > bestVisibleWidth) {
          bestVisibleWidth = visibleWidth;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    const handleScroll = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(syncActiveIndex);
    };

    syncActiveIndex();
    rail.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      rail.removeEventListener("scroll", handleScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [items.length]);

  const scrollToIndex = (index: number) => {
    const safeIndex = Math.max(0, Math.min(index, items.length - 1));
    setActiveIndex(safeIndex);

    const rail = railRef.current;
    const target = itemRefs.current[safeIndex];
    if (!rail || !target) {
      return;
    }

    const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
    const nextScrollLeft = Math.min(target.offsetLeft, maxScrollLeft);

    rail.scrollTo({
      left: nextScrollLeft,
      behavior: "smooth",
    });
  };

  return (
    <section className="overflow-hidden space-y-5 rounded-[1.35rem] border border-border/28 bg-[linear-gradient(180deg,rgb(var(--color-accent-soft)/0.24),rgb(var(--color-background)/0.94))] p-4 sm:p-5 lg:space-y-6 lg:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className={[styles.sectionTitle, "text-[2rem] leading-[0.98] text-foreground sm:text-[2.5rem]"].join(" ")}>
            {block.title}
          </h2>
          {block.subtitle && (
            <p className={[styles.sectionSubtitle, "max-w-2xl text-sm leading-relaxed text-[rgb(var(--color-muted-foreground)/0.78)] sm:text-base"].join(" ")}>
              {block.subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <Link
            href="/guides"
            className={[styles.sectionLink, "inline-flex items-center gap-2 text-sm text-foreground/88 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background"].join(" ")}
          >
            Смотреть все материалы
          </Link>

          <div className="hidden items-center gap-2.5 sm:flex">
            <button
              type="button"
              className={[styles.navControl, "inline-flex h-10 w-10 items-center justify-center rounded-full text-xl text-foreground transition-colors hover:text-foreground/72 disabled:cursor-not-allowed disabled:opacity-28"].join(" ")}
              aria-label="Предыдущий материал"
              disabled={activeIndex === 0}
              onClick={() => scrollToIndex(activeIndex - 1)}
            >
              ‹
            </button>
            <span className={[styles.navControl, "min-w-[3.5rem] text-center text-[12px] uppercase leading-[1.3] tracking-[0.08em] text-muted-foreground/78"].join(" ")}>
              {items.length === 0 ? "0/0" : `${activeIndex + 1}/${items.length}`}
            </span>
            <button
              type="button"
              className={[styles.navControl, "inline-flex h-10 w-10 items-center justify-center rounded-full text-xl text-foreground transition-colors hover:text-foreground/72 disabled:cursor-not-allowed disabled:opacity-28"].join(" ")}
              aria-label="Следующий материал"
              disabled={activeIndex >= items.length - 1}
              onClick={() => scrollToIndex(activeIndex + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </header>

      <div
        ref={railRef}
        className="-mr-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mr-5 sm:pr-5 lg:-mr-6 lg:gap-5 lg:pr-6"
      >
        {items.map((item, index) => (
          <article
            key={item.id}
            className="group flex min-w-[72vw] snap-start flex-col gap-3 sm:min-w-[38vw] lg:min-w-[28rem] xl:min-w-[30rem]"
          >
            <a
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              href={item.href}
              className="relative block min-h-[300px] overflow-hidden rounded-[2px] bg-card/44 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-[380px] lg:min-h-[500px]"
              aria-label={item.title}
            >
              <HeroMedia
                media={item.media}
                title={item.title}
                assetClassName="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.016]"
                defaultOverlayOpacity={0.04}
              />
            </a>

            <div className="space-y-2 pr-3">
              <h3 className={[styles.cardTitle, "text-[1.18rem] leading-[1.08] text-foreground sm:text-[1.34rem]"].join(" ")}>
                {item.title}
              </h3>
              {item.excerpt && (
                <p className={[styles.cardExcerpt, "line-clamp-4 max-w-[38ch] text-sm text-[rgb(var(--color-muted-foreground)/0.78)] leading-relaxed sm:text-[0.98rem]"].join(" ")}>
                  {item.excerpt}
                </p>
              )}
              <a
                href={item.href}
                className={[styles.cardLink, "inline-flex items-center gap-2 text-sm text-foreground/92 transition-colors hover:text-foreground"].join(" ")}
              >
                {item.ctaLabel ?? "Читать гид"}
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 sm:hidden">
        <span className={[styles.navControl, "text-[12px] uppercase leading-[1.3] tracking-[0.08em] text-muted-foreground/78"].join(" ")}>
          {items.length === 0 ? "0/0" : `${activeIndex + 1}/${items.length}`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={[styles.navControl, "inline-flex h-10 w-10 items-center justify-center rounded-full text-xl text-foreground transition-colors hover:text-foreground/72 disabled:cursor-not-allowed disabled:opacity-28"].join(" ")}
            aria-label="Предыдущий материал"
            disabled={activeIndex === 0}
            onClick={() => scrollToIndex(activeIndex - 1)}
          >
            ‹
          </button>
          <button
            type="button"
            className={[styles.navControl, "inline-flex h-10 w-10 items-center justify-center rounded-full text-xl text-foreground transition-colors hover:text-foreground/72 disabled:cursor-not-allowed disabled:opacity-28"].join(" ")}
            aria-label="Следующий материал"
            disabled={activeIndex >= items.length - 1}
            onClick={() => scrollToIndex(activeIndex + 1)}
          >
            ›
          </button>
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
  const isHomeFeatured = block.id === "home-featured";
  const productsToRender = isHomeFeatured ? visibleProducts.slice(0, 8) : visibleProducts;

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

      {productsToRender.length === 0 ? (
        <EmptyState
          title="Подборка пока пустая"
          description="Попробуйте изменить фильтры или вернуться позже."
        />
      ) : (
        <motion.div
          className="grid auto-rows-fr grid-cols-2 gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-8 xl:grid-cols-4"
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {productsToRender.map((product) => (
            <motion.div
              key={product.id}
              className="min-h-0"
              variants={gridItemVariants}
            >
              <ProductCard
                product={product}
                onQuickAdd={onQuickAdd}
                variant="name-price"
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

export function HomePageClient({ homePage, products }: HomePageClientProps) {
  const { addProduct } = useCartStore();

  return (
    <div className="home-concept-editorial space-y-16 sm:space-y-20 lg:space-y-28">
      {homePage.blocks.flatMap((block) => {
        if (block.type === "hero") {
          return [renderHeroBlock(block, <TextileTypeSwitcher key={`${block.id}-textile-switcher`} />)];
        }

        const blockNode = renderBlock(
          block,
          products,
          (product) => addProduct(product.id)
        );

        if (!blockNode) {
          return [];
        }

        return [
          <motion.div
            key={`reveal-${block.id}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {blockNode}
          </motion.div>
        ];
      })}
    </div>
  );
}
