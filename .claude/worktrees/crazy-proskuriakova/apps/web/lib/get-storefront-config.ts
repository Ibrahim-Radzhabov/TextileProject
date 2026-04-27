import { cache } from "react";
import { fetchStorefrontConfig } from "@/lib/api-client";
import { loadStorefrontConfigFromFs, getClientId } from "@/lib/storefront-config-fs";
import type { StorefrontConfig } from "@store-platform/shared-types";

/**
 * Cached storefront config: tries FS first (build-time), then API.
 * Use in layout, generateMetadata, sitemap, and page data.
 */
export const getStorefrontConfig = cache(async (): Promise<StorefrontConfig> => {
  const fromFs = await loadStorefrontConfigFromFs(getClientId());
  if (fromFs) return fromFs;
  return fetchStorefrontConfig();
});
