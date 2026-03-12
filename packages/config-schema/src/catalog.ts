import { z } from "zod";

const moneySchema = z.object({
  currency: z.string().min(3).max(3),
  amount: z.number()
});

const jsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(jsonValueSchema), z.record(jsonValueSchema)])
);

const colorOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  tone: z.string().min(1),
  mediaIds: z.array(z.string().min(1)).min(1)
});

const productSchema = z
  .object({
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
    metadata: z.record(jsonValueSchema).optional()
  })
  .superRefine((product, ctx) => {
    const rawColorOptions = product.metadata?.colorOptions;
    if (rawColorOptions === undefined) {
      return;
    }

    const parsed = colorOptionSchema.array().safeParse(rawColorOptions);
    if (!parsed.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["metadata", "colorOptions"],
        message:
          "metadata.colorOptions must be an array of { id, label, tone, mediaIds[] } with at least one media id"
      });
      return;
    }

    const mediaIds = new Set(product.media.map((item) => item.id));
    for (const option of parsed.data) {
      for (const mediaId of option.mediaIds) {
        if (!mediaIds.has(mediaId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["metadata", "colorOptions"],
            message: `metadata.colorOptions[${option.id}] references unknown mediaId "${mediaId}"`
          });
        }
      }
    }
  });

export const catalogSchema = z.object({
  products: z.array(productSchema)
});

export type CatalogConfigInput = z.infer<typeof catalogSchema>;
