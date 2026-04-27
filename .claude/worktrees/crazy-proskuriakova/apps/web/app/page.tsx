import type { Metadata } from "next";
import type { HeroBlock, PageConfig } from "@store-platform/shared-types";
import { getStorefrontConfig } from "@/lib/get-storefront-config";
import {
  buildStorefrontMetadata,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  jsonLd
} from "@/lib/seo";
import { HomePageClient } from "./home-page-client";

function resolveHomePage(pages: PageConfig[]): PageConfig | null {
  if (!pages.length) return null;
  return pages.find((p) => p.kind === "home" || p.slug === "/") ?? pages[0];
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();
  const homePage = resolveHomePage(config.pages);
  const hero = homePage?.blocks.find((block): block is HeroBlock => block.type === "hero");
  const title = hero?.content?.title ?? config.seo.defaultTitle;
  const description = hero?.content?.subtitle ?? config.seo.description;
  const image = hero?.media?.poster ?? hero?.media?.src ?? config.seo.openGraphImage;

  return buildStorefrontMetadata(config, {
    title,
    description,
    path: "/",
    image
  });
}

export default async function HomePage() {
  const config = await getStorefrontConfig();
  const homePage = resolveHomePage(config.pages);
  if (!homePage) {
    return null;
  }

  const schemas = [
    buildOrganizationJsonLd(config),
    buildWebsiteJsonLd(config)
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`home-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(schema)}
        />
      ))}
      <HomePageClient homePage={homePage} products={config.catalog.products} />
    </>
  );
}
