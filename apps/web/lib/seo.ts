import type { Metadata } from "next";
import { headers } from "next/headers";
import type { Product, StorefrontConfig } from "@store-platform/shared-types";

const FALLBACK_SITE_URL = "http://127.0.0.1:3000";

function normalizeLocale(locale: string | undefined): string {
  return (locale ?? "ru-RU").replace("-", "_");
}

export function resolveSiteUrl(): URL {
  const raw =
    process.env.SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    FALLBACK_SITE_URL;

  try {
    return new URL(raw);
  } catch {
    return new URL(FALLBACK_SITE_URL);
  }
}

export function resolveMetadataBaseFromHeaders(): URL {
  const headerStore = headers();
  const host =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    resolveSiteUrl().host;
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const protocol =
    forwardedProto ?? (host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  try {
    return new URL(`${protocol}://${host}`);
  } catch {
    return resolveSiteUrl();
  }
}

export function resolveAbsoluteUrl(url: string | undefined, base: URL = resolveSiteUrl()): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    return new URL(url, base).toString();
  } catch {
    return undefined;
  }
}

export function buildOpenGraphImage(config: StorefrontConfig, fallbackPath = "/icons/icon-512.svg"): string | undefined {
  return resolveAbsoluteUrl(config.seo.openGraphImage ?? fallbackPath);
}

export function buildStorefrontMetadata(config: StorefrontConfig, options: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const image = resolveAbsoluteUrl(options.image) ?? buildOpenGraphImage(config);
  const locale = normalizeLocale(config.shop.primaryLocale);

  return {
    title: options.title,
    description: options.description,
    alternates: {
      canonical: options.path
    },
    robots: options.noIndex
      ? {
          index: false,
          follow: true
        }
      : {
          index: true,
          follow: true
        },
    openGraph: {
      title: options.title,
      description: options.description,
      url: options.path,
      siteName: config.shop.name,
      locale,
      type: "website",
      images: image ? [{ url: image }] : undefined
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: image ? [image] : undefined
    }
  };
}

export function buildOrganizationJsonLd(config: StorefrontConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: config.shop.name,
    url: resolveSiteUrl().toString(),
    logo: resolveAbsoluteUrl(config.shop.logo?.src),
    sameAs: []
  };
}

export function buildWebsiteJsonLd(config: StorefrontConfig) {
  const base = resolveSiteUrl().toString();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.shop.name,
    url: base,
    description: config.seo.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${base.replace(/\/$/, "")}/catalog?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: resolveAbsoluteUrl(item.path)
    }))
  };
}

export function buildCollectionPageJsonLd(config: StorefrontConfig, products: Product[], description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Каталог ${config.shop.name}`,
    description,
    url: resolveAbsoluteUrl("/catalog"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.slice(0, 12).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: resolveAbsoluteUrl(`/product/${encodeURIComponent(product.slug)}`),
        name: product.name
      }))
    }
  };
}

export function buildProductJsonLd(config: StorefrontConfig, product: Product) {
  const image = product.media.map((item) => resolveAbsoluteUrl(item.url)).filter(Boolean);
  const additionalProperty = Object.entries(product.metadata ?? {}).map(([name, value]) => ({
    "@type": "PropertyValue",
    name,
    value: String(value)
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description ?? config.seo.description,
    image,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: config.shop.name
    },
    category: (product.tags ?? []).join(", "),
    offers: {
      "@type": "Offer",
      priceCurrency: product.price.currency,
      price: product.price.amount,
      availability: "https://schema.org/InStock",
      url: resolveAbsoluteUrl(`/product/${encodeURIComponent(product.slug)}`)
    },
    additionalProperty
  };
}

export function jsonLd(value: unknown): { __html: string } {
  return {
    __html: JSON.stringify(value)
  };
}
