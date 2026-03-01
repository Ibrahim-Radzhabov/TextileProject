import type { PageConfig } from "@store-platform/shared-types";
import { fetchStorefrontConfig } from "@/lib/api-client";
import { resolveHomeConcept } from "@/lib/home-concept";
import { HomePageClient } from "./home-page-client";

function resolveHomePage(pages: PageConfig[]): PageConfig | null {
  if (!pages.length) return null;
  return pages.find((p) => p.kind === "home" || p.slug === "/") ?? pages[0];
}

export default async function HomePage({
  searchParams
}: {
  searchParams?: {
    concept?: string;
  };
}) {
  const config = await fetchStorefrontConfig();
  const homePage = resolveHomePage(config.pages);
  if (!homePage) {
    return null;
  }

  const concept = resolveHomeConcept(searchParams?.concept ?? process.env.NEXT_PUBLIC_HOME_CONCEPT);

  return <HomePageClient homePage={homePage} products={config.catalog.products} concept={concept} />;
}
