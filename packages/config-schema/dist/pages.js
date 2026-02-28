"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagesSchema = exports.pageSchema = exports.pageBlockSchema = void 0;
const zod_1 = require("zod");
const hrefSchema = zod_1.z
    .string()
    .min(1)
    .refine((value) => /^(\/|#|https?:\/\/)/.test(value), {
    message: "href must start with '/', '#', or 'http(s)://'"
});
const heroBlock = zod_1.z.object({
    id: zod_1.z.string().min(1),
    type: zod_1.z.literal("hero"),
    eyebrow: zod_1.z.string().optional(),
    title: zod_1.z.string().min(1),
    subtitle: zod_1.z.string().optional(),
    primaryCta: zod_1.z
        .object({
        label: zod_1.z.string().min(1),
        href: hrefSchema
    })
        .optional(),
    secondaryCta: zod_1.z
        .object({
        label: zod_1.z.string().min(1),
        href: hrefSchema
    })
        .optional()
});
const productGridBlock = zod_1.z.object({
    id: zod_1.z.string().min(1),
    type: zod_1.z.literal("product-grid"),
    title: zod_1.z.string().optional(),
    subtitle: zod_1.z.string().optional(),
    layout: zod_1.z.enum(["auto-fit", "3-col", "4-col"]).optional(),
    filter: zod_1.z
        .object({
        featured: zod_1.z.boolean().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional()
    })
        .optional()
});
const richTextBlock = zod_1.z.object({
    id: zod_1.z.string().min(1),
    type: zod_1.z.literal("rich-text"),
    content: zod_1.z.string().min(1)
});
const ctaStripBlock = zod_1.z.object({
    id: zod_1.z.string().min(1),
    type: zod_1.z.literal("cta-strip"),
    title: zod_1.z.string().min(1),
    href: hrefSchema
});
exports.pageBlockSchema = zod_1.z.discriminatedUnion("type", [
    heroBlock,
    productGridBlock,
    richTextBlock,
    ctaStripBlock
]);
exports.pageSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    kind: zod_1.z.enum(["home", "catalog", "product", "custom"]),
    title: zod_1.z.string().min(1),
    blocks: zod_1.z.array(exports.pageBlockSchema).min(1)
}).superRefine((page, ctx) => {
    const blockIds = new Set();
    for (let index = 0; index < page.blocks.length; index += 1) {
        const block = page.blocks[index];
        if (blockIds.has(block.id)) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: `Duplicate block id "${block.id}"`,
                path: ["blocks", index, "id"]
            });
        }
        blockIds.add(block.id);
    }
    if (page.kind === "home") {
        if (page.slug !== "/") {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Home page slug must be "/"',
                path: ["slug"]
            });
        }
        if (!page.blocks.some((block) => block.type === "hero")) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Home page must include at least one hero block",
                path: ["blocks"]
            });
        }
        if (!page.blocks.some((block) => block.type === "product-grid")) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Home page must include at least one product-grid block",
                path: ["blocks"]
            });
        }
    }
    if (page.kind === "catalog") {
        if (page.slug !== "/catalog") {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Catalog page slug must be "/catalog"',
                path: ["slug"]
            });
        }
        if (!page.blocks.some((block) => block.type === "product-grid")) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Catalog page must include at least one product-grid block",
                path: ["blocks"]
            });
        }
    }
    if (page.kind === "product") {
        if (page.slug !== "/product/[slug]") {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Product page slug must be "/product/[slug]"',
                path: ["slug"]
            });
        }
        if (!page.blocks.some((block) => block.type === "rich-text")) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Product page must include at least one rich-text block",
                path: ["blocks"]
            });
        }
    }
});
exports.pagesSchema = zod_1.z.array(exports.pageSchema).superRefine((pages, ctx) => {
    const pageIds = new Set();
    const pageSlugs = new Set();
    const builtinKinds = new Set();
    for (let index = 0; index < pages.length; index += 1) {
        const page = pages[index];
        if (pageIds.has(page.id)) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: `Duplicate page id "${page.id}"`,
                path: [index, "id"]
            });
        }
        pageIds.add(page.id);
        if (pageSlugs.has(page.slug)) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: `Duplicate page slug "${page.slug}"`,
                path: [index, "slug"]
            });
        }
        pageSlugs.add(page.slug);
        if (page.kind === "home" || page.kind === "catalog" || page.kind === "product") {
            if (builtinKinds.has(page.kind)) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: `Only one page with kind "${page.kind}" is allowed`,
                    path: [index, "kind"]
                });
            }
            builtinKinds.add(page.kind);
        }
    }
    if (!pages.some((page) => page.kind === "home")) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Pages config must include one "home" page'
        });
    }
});
