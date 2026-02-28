import { fetchStorefrontConfig } from "@/lib/api-client";
import { CatalogPageClient } from "./catalog-page-client";

export default async function CatalogPage() {
  const config = await fetchStorefrontConfig();
  const page = config.pages.find((p) => p.kind === "catalog" || p.slug === "/catalog");

  if (!page) {
    return null;
  }

  const allTags = Array.from(new Set(config.catalog.products.flatMap((p) => p.tags ?? [])));

  return (
    <CatalogPageClient
      page={page}
      products={config.catalog.products}
      allTags={allTags}
    />
  );
}
