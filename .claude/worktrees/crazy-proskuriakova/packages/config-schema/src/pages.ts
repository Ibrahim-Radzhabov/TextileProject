import { z } from "zod";

const hrefSchema = z
  .string()
  .min(1)
  .refine((value) => /^(\/|#|https?:\/\/)/.test(value), {
    message: "href must start with '/', '#', or 'http(s)://'"
  });

const heroMediaSchema = z
  .object({
    type: z.enum(["image", "video"]),
    src: hrefSchema,
    mobileSrc: hrefSchema.optional(),
    poster: hrefSchema.optional(),
    alt: z.string().min(1).optional(),
    overlayOpacity: z.number().min(0).max(0.9).optional(),
    overlayPreset: z.enum(["editorial", "balanced", "contrast"]).optional(),
    objectPosition: z.string().min(1).optional(),
    mobileObjectPosition: z.string().min(1).optional()
  })
  .superRefine((media, ctx) => {
    if (media.type === "video" && !media.poster) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "video media requires poster",
        path: ["poster"]
      });
    }
  });

const heroContentSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  trustLine: z.string().min(1).optional(),
  quickLinks: z
    .array(
      z.object({
        label: z.string().min(1),
        subtitle: z.string().optional(),
        href: hrefSchema
      })
    )
    .max(6)
    .optional(),
  primaryCta: z
    .object({
      label: z.string().min(1),
      href: hrefSchema
    })
    .optional(),
  secondaryCta: z
    .object({
      label: z.string().min(1),
      href: hrefSchema
    })
    .optional()
});

const heroBlock = z.object({
  id: z.string().min(1),
  type: z.literal("hero"),
  content: heroContentSchema.optional(),
  contentPlacement: z.enum(["overlay", "below"]).optional(),
  overlayVariant: z.enum(["card", "full"]).optional(),
  cardTitle: z.string().optional(),
  introText: z.string().optional(),
  eyebrow: z.string().optional(),
  title: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  trustLine: z.string().min(1).optional(),
  quickLinks: z
    .array(
      z.object({
        label: z.string().min(1),
        subtitle: z.string().optional(),
        href: hrefSchema
      })
    )
    .max(6)
    .optional(),
  media: heroMediaSchema.optional(),
  primaryCta: z
    .object({
      label: z.string().min(1),
      href: hrefSchema
    })
    .optional(),
  secondaryCta: z
    .object({
      label: z.string().min(1),
      href: hrefSchema
    })
    .optional()
});

const mediaFeatureBlock = z.object({
  id: z.string().min(1),
  type: z.literal("media-feature"),
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  align: z.enum(["left", "right"]).optional(),
  media: heroMediaSchema,
  cta: z
    .object({
      label: z.string().min(1),
      href: hrefSchema
    })
    .optional()
});

const productGridBlock = z.object({
  id: z.string().min(1),
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

const editorialRailItem = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().optional(),
  href: hrefSchema,
  ctaLabel: z.string().min(1).optional(),
  media: heroMediaSchema
});

const editorialRailBlock = z.object({
  id: z.string().min(1),
  type: z.literal("editorial-rail"),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  items: z.array(editorialRailItem).min(1).max(8)
});

const richTextBlock = z.object({
  id: z.string().min(1),
  type: z.literal("rich-text"),
  content: z.string().min(1)
});

const ctaStripBlock = z.object({
  id: z.string().min(1),
  type: z.literal("cta-strip"),
  title: z.string().min(1),
  href: hrefSchema
});

export const pageBlockSchema = z.discriminatedUnion("type", [
  heroBlock,
  mediaFeatureBlock,
  productGridBlock,
  editorialRailBlock,
  richTextBlock,
  ctaStripBlock
]);

export const pageSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  kind: z.enum(["home", "catalog", "product", "custom"]),
  title: z.string().min(1),
  blocks: z.array(pageBlockSchema).min(1)
}).superRefine((page, ctx) => {
  const blockIds = new Set<string>();
  for (let index = 0; index < page.blocks.length; index += 1) {
    const block = page.blocks[index];
    if (blockIds.has(block.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate block id "${block.id}"`,
        path: ["blocks", index, "id"]
      });
    }
    blockIds.add(block.id);

    if (block.type === "hero" && !block.content?.title && !block.title && !block.cardTitle) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "hero block requires title in content.title, legacy title, or cardTitle",
        path: ["blocks", index, "content", "title"]
      });
    }
  }

  if (page.kind === "home") {
    if (page.slug !== "/") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Home page slug must be "/"',
        path: ["slug"]
      });
    }
    if (!page.blocks.some((block) => block.type === "hero")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Home page must include at least one hero block",
        path: ["blocks"]
      });
    }
    if (!page.blocks.some((block) => block.type === "product-grid")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Home page must include at least one product-grid block",
        path: ["blocks"]
      });
    }
  }

  if (page.kind === "catalog") {
    if (page.slug !== "/catalog") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Catalog page slug must be "/catalog"',
        path: ["slug"]
      });
    }
    if (!page.blocks.some((block) => block.type === "product-grid")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Catalog page must include at least one product-grid block",
        path: ["blocks"]
      });
    }
  }

  if (page.kind === "product") {
    if (page.slug !== "/product/[slug]") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Product page slug must be "/product/[slug]"',
        path: ["slug"]
      });
    }
    if (!page.blocks.some((block) => block.type === "rich-text")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Product page must include at least one rich-text block",
        path: ["blocks"]
      });
    }
  }
});

export const pagesSchema = z.array(pageSchema).superRefine((pages, ctx) => {
  const pageIds = new Set<string>();
  const pageSlugs = new Set<string>();
  const builtinKinds = new Set<"home" | "catalog" | "product">();

  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index];

    if (pageIds.has(page.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate page id "${page.id}"`,
        path: [index, "id"]
      });
    }
    pageIds.add(page.id);

    if (pageSlugs.has(page.slug)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate page slug "${page.slug}"`,
        path: [index, "slug"]
      });
    }
    pageSlugs.add(page.slug);

    if (page.kind === "home" || page.kind === "catalog" || page.kind === "product") {
      if (builtinKinds.has(page.kind)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Only one page with kind "${page.kind}" is allowed`,
          path: [index, "kind"]
        });
      }
      builtinKinds.add(page.kind);
    }
  }

  if (!pages.some((page) => page.kind === "home")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Pages config must include one "home" page'
    });
  }
});

export type PageConfigInput = z.infer<typeof pageSchema>;
export type PageBlockInput = z.infer<typeof pageBlockSchema>;
