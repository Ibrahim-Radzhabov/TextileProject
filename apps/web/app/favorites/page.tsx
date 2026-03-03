import { fetchStorefrontConfig } from "@/lib/api-client";
import { FavoritesPageClient } from "./favorites-page-client";

export default async function FavoritesPage() {
  const config = await fetchStorefrontConfig();
  return <FavoritesPageClient products={config.catalog.products} />;
}
