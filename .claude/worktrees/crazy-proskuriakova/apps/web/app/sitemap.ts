import type { MetadataRoute } from "next";
import { getStorefrontConfig } from "@/lib/get-storefront-config";
import { getGuidePages } from "@/lib/guides";
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

  const config = await getStorefrontConfig().catch(() => null);

  if (!config) {
    return staticRoutes;
  }

  const productRoutes: MetadataRoute.Sitemap = config.catalog.products
    .filter((product) => product.isActive !== false)
    .map((product) => ({
      url: new URL(`/product/${encodeURIComponent(product.slug)}`, siteUrl).toString(),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: product.isFeatured ? 0.85 : 0.75
    }));

  const guides = getGuidePages(config.pages);
  const guideRoutes: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: new URL(guide.slug, siteUrl).toString(),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.78
  }));

  const guidesHubRoute: MetadataRoute.Sitemap =
    guides.length > 0
      ? [
          {
            url: new URL("/guides", siteUrl).toString(),
            lastModified,
            changeFrequency: "weekly",
            priority: 0.82
          }
        ]
      : [];

  return [...staticRoutes, ...guidesHubRoute, ...guideRoutes, ...productRoutes];
}
