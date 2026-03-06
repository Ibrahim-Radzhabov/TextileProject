import type { MetadataRoute } from "next";
import { fetchStorefrontConfig } from "@/lib/api-client";
import { resolveSiteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = resolveSiteUrl();
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl.toString(),
      lastModified,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: new URL("/catalog", siteUrl).toString(),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9
    }
  ];

  try {
    const config = await fetchStorefrontConfig();
    const productRoutes: MetadataRoute.Sitemap = config.catalog.products
      .filter((product) => product.isActive !== false)
      .map((product) => ({
        url: new URL(`/product/${encodeURIComponent(product.slug)}`, siteUrl).toString(),
        lastModified,
        changeFrequency: "weekly" as const,
        priority: product.isFeatured ? 0.85 : 0.75
      }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
