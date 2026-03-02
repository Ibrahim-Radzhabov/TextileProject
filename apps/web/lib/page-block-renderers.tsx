import type { ReactNode } from "react";
import { CtaStrip, Hero } from "@store-platform/ui";
import type { PageBlock } from "@store-platform/shared-types";

export function renderNonProductGridBlock(block: PageBlock): ReactNode {
  if (block.type === "hero") {
    return (
      <Hero
        key={block.id}
        eyebrow={block.eyebrow}
        title={block.title}
        subtitle={block.subtitle}
        media={block.media}
        primaryCta={block.primaryCta}
        secondaryCta={block.secondaryCta}
      />
    );
  }

  if (block.type === "media-feature") {
    const textSideClass = block.align === "right" ? "lg:order-2" : "lg:order-1";
    const mediaSideClass = block.align === "right" ? "lg:order-1" : "lg:order-2";
    const overlayOpacity = block.media.overlayOpacity ?? 0.22;

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
              className="inline-flex h-10 items-center justify-center rounded-[10px] border border-border/70 bg-card/65 px-4 text-sm text-foreground transition-colors hover:border-border/90"
            >
              {block.cta.label}
            </a>
          )}
        </div>
        <div className={`relative overflow-hidden rounded-xl border border-border/40 ${mediaSideClass}`}>
          {block.media.type === "video" ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={block.media.poster}
              className="h-full min-h-[260px] w-full object-cover"
            >
              {block.media.mobileSrc && <source src={block.media.mobileSrc} media="(max-width: 768px)" />}
              <source src={block.media.src} />
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.media.mobileSrc ?? block.media.src}
              alt={block.media.alt ?? block.title}
              className="h-full min-h-[260px] w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-background" style={{ opacity: overlayOpacity }} />
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
