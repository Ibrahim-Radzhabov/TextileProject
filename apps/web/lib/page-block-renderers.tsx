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
        className="grid gap-4 overflow-hidden rounded-xl border border-border/45 bg-card/72 p-4 sm:p-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
      >
        <div className={`space-y-3 ${textSideClass}`}>
          {block.eyebrow && <p className="ui-kicker">{block.eyebrow}</p>}
          <h3 className="ui-title-display text-2xl sm:text-3xl">{block.title}</h3>
          {block.subtitle && <p className="text-sm font-medium text-foreground/90">{block.subtitle}</p>}
          {block.body && <p className="ui-subtle max-w-xl text-sm leading-relaxed">{block.body}</p>}
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
            assetClassName="h-full min-h-[260px] w-full object-cover"
            defaultOverlayOpacity={0.22}
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
