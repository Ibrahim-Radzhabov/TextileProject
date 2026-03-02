import type { ThemeConfig } from "./theme";
import type { Product } from "./product";

export type ShopConfig = {
  id: string;
  name: string;
  logo?: {
    src: string;
    alt: string;
  };
  primaryLocale: string;
  currency: string;
};

export type SeoConfig = {
  titleTemplate: string;
  defaultTitle: string;
  description: string;
  openGraphImage?: string;
};

export type IntegrationStripe = {
  type: "stripe";
  publishableKey: string;
  secretKey: string;
  webhookSecret?: string;
};

export type IntegrationTelegram = {
  type: "telegram";
  botToken: string;
  chatId: string;
};

export type IntegrationsConfig = {
  stripe?: IntegrationStripe;
  telegram?: IntegrationTelegram;
};

export type PageBlockType =
  | "hero"
  | "product-grid"
  | "media-feature"
  | "featured-row"
  | "rich-text"
  | "cta-strip";

export type PageBlockBase = {
  id: string;
  type: PageBlockType;
};

export type HeroBlock = PageBlockBase & {
  type: "hero";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  media?: {
    type: "image" | "video";
    src: string;
    mobileSrc?: string;
    poster?: string;
    alt?: string;
    overlayOpacity?: number;
  };
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
};

export type MediaFeatureBlock = PageBlockBase & {
  type: "media-feature";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body?: string;
  align?: "left" | "right";
  media: {
    type: "image" | "video";
    src: string;
    mobileSrc?: string;
    poster?: string;
    alt?: string;
    overlayOpacity?: number;
  };
  cta?: {
    label: string;
    href: string;
  };
};

export type ProductGridBlock = PageBlockBase & {
  type: "product-grid";
  title?: string;
  subtitle?: string;
  layout?: "auto-fit" | "3-col" | "4-col";
  filter: {
    featured?: boolean;
    tags?: string[];
  };
};

export type RichTextBlock = PageBlockBase & {
  type: "rich-text";
  content: string;
};

export type CtaStripBlock = PageBlockBase & {
  type: "cta-strip";
  title: string;
  href: string;
};

export type PageBlock =
  | HeroBlock
  | ProductGridBlock
  | MediaFeatureBlock
  | RichTextBlock
  | CtaStripBlock;

export type PageConfig = {
  id: string;
  slug: string;
  kind: "home" | "catalog" | "product" | "custom";
  title: string;
  blocks: PageBlock[];
};

export type CatalogConfig = {
  products: Product[];
};

export type StorefrontConfig = {
  shop: ShopConfig;
  theme: ThemeConfig;
  seo: SeoConfig;
  pages: PageConfig[];
  catalog: CatalogConfig;
  integrations: IntegrationsConfig;
};
