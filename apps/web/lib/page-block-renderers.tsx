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
        primaryCta={block.primaryCta}
        secondaryCta={block.secondaryCta}
      />
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
