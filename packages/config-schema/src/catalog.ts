import { z } from "zod";

const moneySchema = z.object({
  currency: z.string().min(3).max(3),
  amount: z.number()
});

const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: moneySchema,
  compareAtPrice: moneySchema.optional(),
  badges: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        tone: z.enum(["accent", "neutral", "critical"])
      })
    )
    .optional(),
  tags: z.array(z.string()).optional(),
  media: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
      alt: z.string()
    })
  ),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
  metadata: z.record(z.union([z.string(), z.number(), z.boolean()])).optional()
});

export const catalogSchema = z.object({
  products: z.array(productSchema)
});

export type CatalogConfigInput = z.infer<typeof catalogSchema>;
