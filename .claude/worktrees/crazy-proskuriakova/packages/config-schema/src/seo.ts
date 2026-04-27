import { z } from "zod";

export const seoSchema = z.object({
  titleTemplate: z.string(),
  defaultTitle: z.string(),
  description: z.string(),
  openGraphImage: z.string().optional()
});

export type SeoConfigInput = z.infer<typeof seoSchema>;

