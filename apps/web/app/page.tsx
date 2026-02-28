import type { PageConfig } from "@store-platform/shared-types";
import { fetchStorefrontConfig } from "@/lib/api-client";
import { HomePageClient } from "./home-page-client";

function resolveHomePage(pages: PageConfig[]): PageConfig | null {
  if (!pages.length) return null;
  return pages.find((p) => p.kind === "home" || p.slug === "/") ?? pages[0];
}

export default async function HomePage() {
  const config = await fetchStorefrontConfig();
  const homePage = resolveHomePage(config.pages);
  if (!homePage) {
    return null;
  }

  return <HomePageClient homePage={homePage} products={config.catalog.products} />;
}
