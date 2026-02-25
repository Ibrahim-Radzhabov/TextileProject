import { shopSchema } from "./shop";
import { themeSchema } from "./theme";
import { catalogSchema } from "./catalog";
import { pagesSchema } from "./pages";
import { seoSchema } from "./seo";
import { integrationsSchema } from "./integrations";

export * from "./shop";
export * from "./theme";
export * from "./catalog";
export * from "./pages";
export * from "./seo";
export * from "./integrations";

export const storefrontConfigSchema = shopSchema
  .and(themeSchema)
  .and(catalogSchema)
  .and(pagesSchema)
  .and(seoSchema)
  .and(integrationsSchema);

