import type { ReactNode } from "react";
import { CtaStrip, Hero, HeroMedia } from "@store-platform/ui";
import type { PageBlock } from "@store-platform/shared-types";

export function renderNonProductGridBlock(block: PageBlock): ReactNode {
  if (block.type === "hero") {
    const heroTitle = block.content?.title ?? block.title;
    if (!heroTitle) {
      return null;
    }

    return (
      <Hero
        key={block.id}
        eyebrow={block.content?.eyebrow ?? block.eyebrow}
        title={heroTitle}
        subtitle={block.content?.subtitle ?? block.subtitle}
        media={block.media}
        primaryCta={block.content?.primaryCta ?? block.primaryCta}
        secondaryCta={block.content?.secondaryCta ?? block.secondaryCta}
      />
    );
  }

  if (block.type === "media-feature") {
    const textSideClass = block.align === "right" ? "lg:order-2" : "lg:order-1";
    const mediaSideClass = block.align === "right" ? "lg:order-1" : "lg:order-2";

    return (
      <section
        key={block.id}
        className="grid gap-8 lg:grid-cols-2 lg:gap-12"
      >
        <div className={`space-y-4 self-center ${textSideClass}`}>
          {block.eyebrow && <p className="ui-kicker">{block.eyebrow}</p>}
          <h3 className="ui-title-display text-2xl sm:text-3xl">{block.title}</h3>
          {block.subtitle && <p className="text-sm font-medium text-foreground/80">{block.subtitle}</p>}
          {block.body && <p className="ui-subtle max-w-xl text-sm leading-relaxed">{block.body}</p>}
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

  if (block.type === "rich-text") {
    return (
      <p key={block.id} className="max-w-xl text-sm text-muted-foreground">
        {block.content}
      </p>
    );
  }

  if (block.type === "cta-strip") {
    return (
      <CtaStrip
        key={block.id}
        title={block.title}
        href={block.href}
      />
    );
  }

  return null;
}
