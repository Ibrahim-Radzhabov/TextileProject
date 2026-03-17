import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Product, StorefrontConfig } from "@store-platform/shared-types";
import { fetchProduct, fetchStorefrontConfig } from "@/lib/api-client";
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildStorefrontMetadata,
  jsonLd
} from "@/lib/seo";
import { ProductPageClient } from "./product-page-client";

async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await fetchProduct(slug);
  } catch {
    return null;
  }
}

async function getConfig(): Promise<StorefrontConfig> {
  return fetchStorefrontConfig();
}

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;
  const [product, config] = await Promise.all([getProduct(slug), getConfig()]);

  if (!product) {
    return {
      title: `Товар не найден — ${config.seo.defaultTitle}`,
      description: config.seo.description
    };
  }

  const title = `${product.name} — ${config.shop.name}`;
  const description =
    product.shortDescription ?? product.description ?? config.seo.description;

  const image = product.media?.[0]?.url ?? config.seo.openGraphImage;

  return buildStorefrontMetadata(config, {
    title,
    description,
    path: `/product/${encodeURIComponent(product.slug)}`,
    image
  });
}

export default async function ProductPage({
  params
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const [product, config] = await Promise.all([getProduct(slug), getConfig()]);

  if (!product) {
    notFound();
  }

  const related =
    config.catalog.products
      .filter((candidate) => candidate.id !== product.id)
      .filter((candidate) => {
        if (!product.tags || product.tags.length === 0) {
          return false;
        }

        const tags = candidate.tags ?? [];
        return product.tags.some((tag) => tags.includes(tag));
      })
      .slice(0, 4);

  const productPageTextBlocks = config.pages
    .find((page) => page.kind === "product")
    ?.blocks.filter((block) => block.type === "rich-text")
    .map((block) => ({
      id: block.id,
      content: block.content
    }));
  const sampleRequestHref =
    config.shop.contacts?.emailHref ?? config.shop.primaryCta?.href ?? "/catalog?open_filters=1";

  const schemas = [
    buildBreadcrumbJsonLd([
      { name: "Главная", path: "/" },
      { name: "Каталог", path: "/catalog" },
      { name: product.name, path: `/product/${encodeURIComponent(product.slug)}` }
    ]),
    buildProductJsonLd(config, product)
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`product-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(schema)}
        />
      ))}
      <ProductPageClient
        product={product}
        related={related}
        productPageTexts={productPageTextBlocks ?? []}
        sampleRequestHref={sampleRequestHref}
      />
    </>
  );
}
