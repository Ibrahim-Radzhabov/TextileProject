import { z } from "zod";
export declare const pageBlockSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<"hero">;
    eyebrow: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    subtitle: z.ZodOptional<z.ZodString>;
    primaryCta: z.ZodOptional<z.ZodObject<{
        label: z.ZodString;
        href: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        label: string;
        href: string;
    }, {
        label: string;
        href: string;
    }>>;
    secondaryCta: z.ZodOptional<z.ZodObject<{
        label: z.ZodString;
        href: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        label: string;
        href: string;
    }, {
        label: string;
        href: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "hero";
    id: string;
    title: string;
    eyebrow?: string | undefined;
    subtitle?: string | undefined;
    primaryCta?: {
        label: string;
        href: string;
    } | undefined;
    secondaryCta?: {
        label: string;
        href: string;
    } | undefined;
}, {
    type: "hero";
    id: string;
    title: string;
    eyebrow?: string | undefined;
    subtitle?: string | undefined;
    primaryCta?: {
        label: string;
        href: string;
    } | undefined;
    secondaryCta?: {
        label: string;
        href: string;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<"product-grid">;
    title: z.ZodOptional<z.ZodString>;
    subtitle: z.ZodOptional<z.ZodString>;
    layout: z.ZodOptional<z.ZodEnum<["auto-fit", "3-col", "4-col"]>>;
    filter: z.ZodOptional<z.ZodObject<{
        featured: z.ZodOptional<z.ZodBoolean>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        tags?: string[] | undefined;
        featured?: boolean | undefined;
    }, {
        tags?: string[] | undefined;
        featured?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "product-grid";
    id: string;
    filter?: {
        tags?: string[] | undefined;
        featured?: boolean | undefined;
    } | undefined;
    title?: string | undefined;
    subtitle?: string | undefined;
    layout?: "auto-fit" | "3-col" | "4-col" | undefined;
}, {
    type: "product-grid";
    id: string;
    filter?: {
        tags?: string[] | undefined;
        featured?: boolean | undefined;
    } | undefined;
    title?: string | undefined;
    subtitle?: string | undefined;
    layout?: "auto-fit" | "3-col" | "4-col" | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<"rich-text">;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "rich-text";
    id: string;
    content: string;
}, {
    type: "rich-text";
    id: string;
    content: string;
}>, z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<"cta-strip">;
    title: z.ZodString;
    href: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    type: "cta-strip";
    id: string;
    title: string;
    href: string;
}, {
    type: "cta-strip";
    id: string;
    title: string;
    href: string;
}>]>;
export declare const pageSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    kind: z.ZodEnum<["home", "catalog", "product", "custom"]>;
    title: z.ZodString;
    blocks: z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        id: z.ZodString;
        type: z.ZodLiteral<"hero">;
        eyebrow: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        subtitle: z.ZodOptional<z.ZodString>;
        primaryCta: z.ZodOptional<z.ZodObject<{
            label: z.ZodString;
            href: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            label: string;
            href: string;
        }, {
            label: string;
            href: string;
        }>>;
        secondaryCta: z.ZodOptional<z.ZodObject<{
            label: z.ZodString;
            href: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            label: string;
            href: string;
        }, {
            label: string;
            href: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "hero";
        id: string;
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    }, {
        type: "hero";
        id: string;
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        type: z.ZodLiteral<"product-grid">;
        title: z.ZodOptional<z.ZodString>;
        subtitle: z.ZodOptional<z.ZodString>;
        layout: z.ZodOptional<z.ZodEnum<["auto-fit", "3-col", "4-col"]>>;
        filter: z.ZodOptional<z.ZodObject<{
            featured: z.ZodOptional<z.ZodBoolean>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        }, {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "product-grid";
        id: string;
        filter?: {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        } | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        layout?: "auto-fit" | "3-col" | "4-col" | undefined;
    }, {
        type: "product-grid";
        id: string;
        filter?: {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        } | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        layout?: "auto-fit" | "3-col" | "4-col" | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        type: z.ZodLiteral<"rich-text">;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "rich-text";
        id: string;
        content: string;
    }, {
        type: "rich-text";
        id: string;
        content: string;
    }>, z.ZodObject<{
        id: z.ZodString;
        type: z.ZodLiteral<"cta-strip">;
        title: z.ZodString;
        href: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        type: "cta-strip";
        id: string;
        title: string;
        href: string;
    }, {
        type: "cta-strip";
        id: string;
        title: string;
        href: string;
    }>]>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    slug: string;
    title: string;
    kind: "custom" | "home" | "catalog" | "product";
    blocks: ({
        type: "hero";
        id: string;
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    } | {
        type: "product-grid";
        id: string;
        filter?: {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        } | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        layout?: "auto-fit" | "3-col" | "4-col" | undefined;
    } | {
        type: "rich-text";
        id: string;
        content: string;
    } | {
        type: "cta-strip";
        id: string;
        title: string;
        href: string;
    })[];
}, {
    id: string;
    slug: string;
    title: string;
    kind: "custom" | "home" | "catalog" | "product";
    blocks: ({
        type: "hero";
        id: string;
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    } | {
        type: "product-grid";
        id: string;
        filter?: {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        } | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        layout?: "auto-fit" | "3-col" | "4-col" | undefined;
    } | {
        type: "rich-text";
        id: string;
        content: string;
    } | {
        type: "cta-strip";
        id: string;
        title: string;
        href: string;
    })[];
}>, {
    id: string;
    slug: string;
    title: string;
    kind: "custom" | "home" | "catalog" | "product";
    blocks: ({
        type: "hero";
        id: string;
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    } | {
        type: "product-grid";
        id: string;
        filter?: {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        } | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        layout?: "auto-fit" | "3-col" | "4-col" | undefined;
    } | {
        type: "rich-text";
        id: string;
        content: string;
    } | {
        type: "cta-strip";
        id: string;
        title: string;
        href: string;
    })[];
}, {
    id: string;
    slug: string;
    title: string;
    kind: "custom" | "home" | "catalog" | "product";
    blocks: ({
        type: "hero";
        id: string;
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    } | {
        type: "product-grid";
        id: string;
        filter?: {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        } | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        layout?: "auto-fit" | "3-col" | "4-col" | undefined;
    } | {
        type: "rich-text";
        id: string;
        content: string;
    } | {
        type: "cta-strip";
        id: string;
        title: string;
        href: string;
    })[];
}>;
export declare const pagesSchema: z.ZodEffects<z.ZodArray<z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    kind: z.ZodEnum<["home", "catalog", "product", "custom"]>;
    title: z.ZodString;
    blocks: z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        id: z.ZodString;
        type: z.ZodLiteral<"hero">;
        eyebrow: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        subtitle: z.ZodOptional<z.ZodString>;
        primaryCta: z.ZodOptional<z.ZodObject<{
            label: z.ZodString;
            href: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            label: string;
            href: string;
        }, {
            label: string;
            href: string;
        }>>;
        secondaryCta: z.ZodOptional<z.ZodObject<{
            label: z.ZodString;
            href: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            label: string;
            href: string;
        }, {
            label: string;
            href: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "hero";
        id: string;
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    }, {
        type: "hero";
        id: string;
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        type: z.ZodLiteral<"product-grid">;
        title: z.ZodOptional<z.ZodString>;
        subtitle: z.ZodOptional<z.ZodString>;
        layout: z.ZodOptional<z.ZodEnum<["auto-fit", "3-col", "4-col"]>>;
        filter: z.ZodOptional<z.ZodObject<{
            featured: z.ZodOptional<z.ZodBoolean>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        }, {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "product-grid";
        id: string;
        filter?: {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        } | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        layout?: "auto-fit" | "3-col" | "4-col" | undefined;
    }, {
        type: "product-grid";
        id: string;
        filter?: {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        } | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        layout?: "auto-fit" | "3-col" | "4-col" | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        type: z.ZodLiteral<"rich-text">;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "rich-text";
        id: string;
        content: string;
    }, {
        type: "rich-text";
        id: string;
        content: string;
    }>, z.ZodObject<{
        id: z.ZodString;
        type: z.ZodLiteral<"cta-strip">;
        title: z.ZodString;
        href: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        type: "cta-strip";
        id: string;
        title: string;
        href: string;
    }, {
        type: "cta-strip";
        id: string;
        title: string;
        href: string;
    }>]>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    slug: string;
    title: string;
    kind: "custom" | "home" | "catalog" | "product";
    blocks: ({
        type: "hero";
        id: string;
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    } | {
        type: "product-grid";
        id: string;
        filter?: {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        } | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        layout?: "auto-fit" | "3-col" | "4-col" | undefined;
    } | {
        type: "rich-text";
        id: string;
        content: string;
    } | {
        type: "cta-strip";
        id: string;
        title: string;
        href: string;
    })[];
}, {
    id: string;
    slug: string;
    title: string;
    kind: "custom" | "home" | "catalog" | "product";
    blocks: ({
        type: "hero";
        id: string;
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    } | {
        type: "product-grid";
        id: string;
        filter?: {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        } | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        layout?: "auto-fit" | "3-col" | "4-col" | undefined;
    } | {
        type: "rich-text";
        id: string;
        content: string;
    } | {
        type: "cta-strip";
        id: string;
        title: string;
        href: string;
    })[];
}>, {
    id: string;
    slug: string;
    title: string;
    kind: "custom" | "home" | "catalog" | "product";
    blocks: ({
        type: "hero";
        id: string;
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    } | {
        type: "product-grid";
        id: string;
        filter?: {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        } | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        layout?: "auto-fit" | "3-col" | "4-col" | undefined;
    } | {
        type: "rich-text";
        id: string;
        content: string;
    } | {
        type: "cta-strip";
        id: string;
        title: string;
        href: string;
    })[];
}, {
    id: string;
    slug: string;
    title: string;
    kind: "custom" | "home" | "catalog" | "product";
    blocks: ({
        type: "hero";
        id: string;
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    } | {
        type: "product-grid";
        id: string;
        filter?: {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        } | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        layout?: "auto-fit" | "3-col" | "4-col" | undefined;
    } | {
        type: "rich-text";
        id: string;
        content: string;
    } | {
        type: "cta-strip";
        id: string;
        title: string;
        href: string;
    })[];
}>, "many">, {
    id: string;
    slug: string;
    title: string;
    kind: "custom" | "home" | "catalog" | "product";
    blocks: ({
        type: "hero";
        id: string;
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    } | {
        type: "product-grid";
        id: string;
        filter?: {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        } | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        layout?: "auto-fit" | "3-col" | "4-col" | undefined;
    } | {
        type: "rich-text";
        id: string;
        content: string;
    } | {
        type: "cta-strip";
        id: string;
        title: string;
        href: string;
    })[];
}[], {
    id: string;
    slug: string;
    title: string;
    kind: "custom" | "home" | "catalog" | "product";
    blocks: ({
        type: "hero";
        id: string;
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    } | {
        type: "product-grid";
        id: string;
        filter?: {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        } | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        layout?: "auto-fit" | "3-col" | "4-col" | undefined;
    } | {
        type: "rich-text";
        id: string;
        content: string;
    } | {
        type: "cta-strip";
        id: string;
        title: string;
        href: string;
    })[];
}[]>;
export type PageConfigInput = z.infer<typeof pageSchema>;
export type PageBlockInput = z.infer<typeof pageBlockSchema>;
