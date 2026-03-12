import type { HeroBlock, MediaFeatureBlock, PageBlock, PageConfig, RichTextBlock } from "@store-platform/shared-types";

export type GuidePage = PageConfig & {
  kind: "custom";
};

export function isGuidePage(page: PageConfig): page is GuidePage {
  return page.kind === "custom" && /^\/guides\/[a-z0-9-]+$/i.test(page.slug);
}

export function getGuidePages(pages: PageConfig[]): GuidePage[] {
  return pages.filter(isGuidePage);
}

export function resolveGuidePageBySlug(pages: PageConfig[], slugSegment: string): GuidePage | null {
  const normalizedPath = `/guides/${slugSegment}`.toLowerCase();
  return getGuidePages(pages).find((page) => page.slug.toLowerCase() === normalizedPath) ?? null;
}

export function extractGuideDescription(page: PageConfig): string {
  const richText = page.blocks.find((block): block is RichTextBlock => block.type === "rich-text");
  if (richText?.content) {
    return richText.content;
  }

  const mediaFeature = page.blocks.find(
    (block): block is MediaFeatureBlock => block.type === "media-feature"
  );
  if (mediaFeature?.subtitle) {
    return mediaFeature.subtitle;
  }
  if (mediaFeature?.body) {
    return mediaFeature.body;
  }

  const hero = page.blocks.find((block): block is HeroBlock => block.type === "hero");
  if (hero?.content?.subtitle) {
    return hero.content.subtitle;
  }
  if (hero?.subtitle) {
    return hero.subtitle;
  }

  return "";
}

export function extractGuideImage(page: PageConfig): string | undefined {
  for (const block of page.blocks) {
    if (block.type === "hero" && block.media?.src) {
      return block.media.poster ?? block.media.src;
    }

    if (block.type === "media-feature" && block.media?.src) {
      return block.media.poster ?? block.media.src;
    }
  }
  return undefined;
}

export function extractGuideHeadline(page: PageConfig): string {
  for (const block of page.blocks) {
    if (block.type === "hero") {
      if (block.content?.title) {
        return block.content.title;
      }
      if (block.title) {
        return block.title;
      }
    }
    if (block.type === "media-feature") {
      return block.title;
    }
  }
  return page.title;
}

export function renderableGuideBlocks(blocks: PageBlock[]): PageBlock[] {
  return blocks.filter((block) => block.type !== "product-grid" && block.type !== "editorial-rail");
}
