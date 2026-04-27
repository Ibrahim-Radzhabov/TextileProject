import type { Metadata } from "next";
import { getStorefrontConfig } from "@/lib/get-storefront-config";
import { FavoritesPageClient } from "./favorites-page-client";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default async function FavoritesPage() {
  const config = await getStorefrontConfig();
  return <FavoritesPageClient products={config.catalog.products} />;
}
