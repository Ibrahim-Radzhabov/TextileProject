import { z } from "zod";

const heroBlock = z.object({
  id: z.string(),
  type: z.literal("hero"),
  eyebrow: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  primaryCta: z
    .object({
      label: z.string(),
      href: z.string()
    })
    .optional(),
  secondaryCta: z
    .object({
      label: z.string(),
      href: z.string()
    })
    .optional()
});

const productGridBlock = z.object({
  id: z.string(),
  type: z.literal("product-grid"),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  layout: z.enum(["auto-fit", "3-col", "4-col"]).optional(),
  filter: z
    .object({
      featured: z.boolean().optional(),
      tags: z.array(z.string()).optional()
    })
    .optional()
});

const richTextBlock = z.object({
  id: z.string(),
  type: z.literal("rich-text"),
  content: z.string()
});

const ctaStripBlock = z.object({
  id: z.string(),
  type: z.literal("cta-strip"),
  title: z.string(),
  href: z.string()
});

export const pageBlockSchema = z.discriminatedUnion("type", [
  heroBlock,
  productGridBlock,
  richTextBlock,
  ctaStripBlock
]);

export const pageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  kind: z.enum(["home", "catalog", "product", "custom"]),
  title: z.string(),
  blocks: z.array(pageBlockSchema)
});

export const pagesSchema = z.array(pageSchema);

export type PageConfigInput = z.infer<typeof pageSchema>;
export type PageBlockInput = z.infer<typeof pageBlockSchema>;

