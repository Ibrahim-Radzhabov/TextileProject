import type { Metadata } from "next";
import { fetchStorefrontConfig } from "@/lib/api-client";
import { FavoritesPageClient } from "./favorites-page-client";

export const metadata: Metadata = {
  title: "Избранное",
  robots: {
    index: false,
    follow: false
  }
};

export default async function FavoritesPage() {
  const config = await fetchStorefrontConfig();
  return <FavoritesPageClient products={config.catalog.products} />;
}
