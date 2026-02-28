export * from "./shop";
export * from "./theme";
export * from "./catalog";
export * from "./pages";
export * from "./seo";
export * from "./integrations";
export declare const storefrontConfigSchema: import("zod").ZodIntersection<import("zod").ZodIntersection<import("zod").ZodIntersection<import("zod").ZodIntersection<import("zod").ZodIntersection<import("zod").ZodObject<{
    id: import("zod").ZodString;
    name: import("zod").ZodString;
    logo: import("zod").ZodOptional<import("zod").ZodObject<{
        src: import("zod").ZodString;
        alt: import("zod").ZodString;
    }, "strip", import("zod").ZodTypeAny, {
        alt: string;
        src: string;
    }, {
        alt: string;
        src: string;
    }>>;
    primaryLocale: import("zod").ZodString;
    currency: import("zod").ZodString;
}, "strip", import("zod").ZodTypeAny, {
    currency: string;
    id: string;
    name: string;
    primaryLocale: string;
    logo?: {
        alt: string;
        src: string;
    } | undefined;
}, {
    currency: string;
    id: string;
    name: string;
    primaryLocale: string;
    logo?: {
        alt: string;
        src: string;
    } | undefined;
}>, import("zod").ZodObject<{
    id: import("zod").ZodString;
    name: import("zod").ZodString;
    colors: import("zod").ZodObject<{
        background: import("zod").ZodString;
        foreground: import("zod").ZodString;
        muted: import("zod").ZodString;
        mutedForeground: import("zod").ZodString;
        accent: import("zod").ZodString;
        accentSoft: import("zod").ZodString;
        border: import("zod").ZodString;
        input: import("zod").ZodString;
        ring: import("zod").ZodString;
        card: import("zod").ZodString;
        cardForeground: import("zod").ZodString;
    }, "strip", import("zod").ZodTypeAny, {
        accent: string;
        background: string;
        foreground: string;
        muted: string;
        mutedForeground: string;
        accentSoft: string;
        border: string;
        input: string;
        ring: string;
        card: string;
        cardForeground: string;
    }, {
        accent: string;
        background: string;
        foreground: string;
        muted: string;
        mutedForeground: string;
        accentSoft: string;
        border: string;
        input: string;
        ring: string;
        card: string;
        cardForeground: string;
    }>;
    radii: import("zod").ZodObject<{
        xl: import("zod").ZodNumber;
        lg: import("zod").ZodNumber;
        md: import("zod").ZodNumber;
        sm: import("zod").ZodNumber;
    }, "strip", import("zod").ZodTypeAny, {
        xl: number;
        lg: number;
        md: number;
        sm: number;
    }, {
        xl: number;
        lg: number;
        md: number;
        sm: number;
    }>;
    shadows: import("zod").ZodObject<{
        soft: import("zod").ZodString;
        softSubtle: import("zod").ZodString;
        ring: import("zod").ZodString;
    }, "strip", import("zod").ZodTypeAny, {
        ring: string;
        soft: string;
        softSubtle: string;
    }, {
        ring: string;
        soft: string;
        softSubtle: string;
    }>;
    typography: import("zod").ZodObject<{
        fontSans: import("zod").ZodString;
        baseFontSize: import("zod").ZodNumber;
        scaleRatio: import("zod").ZodNumber;
    }, "strip", import("zod").ZodTypeAny, {
        fontSans: string;
        baseFontSize: number;
        scaleRatio: number;
    }, {
        fontSans: string;
        baseFontSize: number;
        scaleRatio: number;
    }>;
    gradients: import("zod").ZodObject<{
        hero: import("zod").ZodString;
        surface: import("zod").ZodString;
    }, "strip", import("zod").ZodTypeAny, {
        hero: string;
        surface: string;
    }, {
        hero: string;
        surface: string;
    }>;
}, "strip", import("zod").ZodTypeAny, {
    id: string;
    name: string;
    colors: {
        accent: string;
        background: string;
        foreground: string;
        muted: string;
        mutedForeground: string;
        accentSoft: string;
        border: string;
        input: string;
        ring: string;
        card: string;
        cardForeground: string;
    };
    radii: {
        xl: number;
        lg: number;
        md: number;
        sm: number;
    };
    shadows: {
        ring: string;
        soft: string;
        softSubtle: string;
    };
    typography: {
        fontSans: string;
        baseFontSize: number;
        scaleRatio: number;
    };
    gradients: {
        hero: string;
        surface: string;
    };
}, {
    id: string;
    name: string;
    colors: {
        accent: string;
        background: string;
        foreground: string;
        muted: string;
        mutedForeground: string;
        accentSoft: string;
        border: string;
        input: string;
        ring: string;
        card: string;
        cardForeground: string;
    };
    radii: {
        xl: number;
        lg: number;
        md: number;
        sm: number;
    };
    shadows: {
        ring: string;
        soft: string;
        softSubtle: string;
    };
    typography: {
        fontSans: string;
        baseFontSize: number;
        scaleRatio: number;
    };
    gradients: {
        hero: string;
        surface: string;
    };
}>>, import("zod").ZodObject<{
    products: import("zod").ZodArray<import("zod").ZodObject<{
        id: import("zod").ZodString;
        slug: import("zod").ZodString;
        name: import("zod").ZodString;
        description: import("zod").ZodOptional<import("zod").ZodString>;
        shortDescription: import("zod").ZodOptional<import("zod").ZodString>;
        price: import("zod").ZodObject<{
            currency: import("zod").ZodString;
            amount: import("zod").ZodNumber;
        }, "strip", import("zod").ZodTypeAny, {
            currency: string;
            amount: number;
        }, {
            currency: string;
            amount: number;
        }>;
        compareAtPrice: import("zod").ZodOptional<import("zod").ZodObject<{
            currency: import("zod").ZodString;
            amount: import("zod").ZodNumber;
        }, "strip", import("zod").ZodTypeAny, {
            currency: string;
            amount: number;
        }, {
            currency: string;
            amount: number;
        }>>;
        badges: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
            id: import("zod").ZodString;
            label: import("zod").ZodString;
            tone: import("zod").ZodEnum<["accent", "neutral", "critical"]>;
        }, "strip", import("zod").ZodTypeAny, {
            id: string;
            label: string;
            tone: "accent" | "neutral" | "critical";
        }, {
            id: string;
            label: string;
            tone: "accent" | "neutral" | "critical";
        }>, "many">>;
        tags: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
        media: import("zod").ZodArray<import("zod").ZodObject<{
            id: import("zod").ZodString;
            url: import("zod").ZodString;
            alt: import("zod").ZodString;
        }, "strip", import("zod").ZodTypeAny, {
            id: string;
            url: string;
            alt: string;
        }, {
            id: string;
            url: string;
            alt: string;
        }>, "many">;
        isActive: import("zod").ZodOptional<import("zod").ZodBoolean>;
        sortOrder: import("zod").ZodOptional<import("zod").ZodNumber>;
        isFeatured: import("zod").ZodOptional<import("zod").ZodBoolean>;
        metadata: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnion<[import("zod").ZodString, import("zod").ZodNumber, import("zod").ZodBoolean]>>>;
    }, "strip", import("zod").ZodTypeAny, {
        id: string;
        slug: string;
        name: string;
        price: {
            currency: string;
            amount: number;
        };
        media: {
            id: string;
            url: string;
            alt: string;
        }[];
        description?: string | undefined;
        shortDescription?: string | undefined;
        compareAtPrice?: {
            currency: string;
            amount: number;
        } | undefined;
        badges?: {
            id: string;
            label: string;
            tone: "accent" | "neutral" | "critical";
        }[] | undefined;
        tags?: string[] | undefined;
        isActive?: boolean | undefined;
        sortOrder?: number | undefined;
        isFeatured?: boolean | undefined;
        metadata?: Record<string, string | number | boolean> | undefined;
    }, {
        id: string;
        slug: string;
        name: string;
        price: {
            currency: string;
            amount: number;
        };
        media: {
            id: string;
            url: string;
            alt: string;
        }[];
        description?: string | undefined;
        shortDescription?: string | undefined;
        compareAtPrice?: {
            currency: string;
            amount: number;
        } | undefined;
        badges?: {
            id: string;
            label: string;
            tone: "accent" | "neutral" | "critical";
        }[] | undefined;
        tags?: string[] | undefined;
        isActive?: boolean | undefined;
        sortOrder?: number | undefined;
        isFeatured?: boolean | undefined;
        metadata?: Record<string, string | number | boolean> | undefined;
    }>, "many">;
}, "strip", import("zod").ZodTypeAny, {
    products: {
        id: string;
        slug: string;
        name: string;
        price: {
            currency: string;
            amount: number;
        };
        media: {
            id: string;
            url: string;
            alt: string;
        }[];
        description?: string | undefined;
        shortDescription?: string | undefined;
        compareAtPrice?: {
            currency: string;
            amount: number;
        } | undefined;
        badges?: {
            id: string;
            label: string;
            tone: "accent" | "neutral" | "critical";
        }[] | undefined;
        tags?: string[] | undefined;
        isActive?: boolean | undefined;
        sortOrder?: number | undefined;
        isFeatured?: boolean | undefined;
        metadata?: Record<string, string | number | boolean> | undefined;
    }[];
}, {
    products: {
        id: string;
        slug: string;
        name: string;
        price: {
            currency: string;
            amount: number;
        };
        media: {
            id: string;
            url: string;
            alt: string;
        }[];
        description?: string | undefined;
        shortDescription?: string | undefined;
        compareAtPrice?: {
            currency: string;
            amount: number;
        } | undefined;
        badges?: {
            id: string;
            label: string;
            tone: "accent" | "neutral" | "critical";
        }[] | undefined;
        tags?: string[] | undefined;
        isActive?: boolean | undefined;
        sortOrder?: number | undefined;
        isFeatured?: boolean | undefined;
        metadata?: Record<string, string | number | boolean> | undefined;
    }[];
}>>, import("zod").ZodEffects<import("zod").ZodArray<import("zod").ZodEffects<import("zod").ZodObject<{
    id: import("zod").ZodString;
    slug: import("zod").ZodString;
    kind: import("zod").ZodEnum<["home", "catalog", "product", "custom"]>;
    title: import("zod").ZodString;
    blocks: import("zod").ZodArray<import("zod").ZodDiscriminatedUnion<"type", [import("zod").ZodObject<{
        id: import("zod").ZodString;
        type: import("zod").ZodLiteral<"hero">;
        eyebrow: import("zod").ZodOptional<import("zod").ZodString>;
        title: import("zod").ZodString;
        subtitle: import("zod").ZodOptional<import("zod").ZodString>;
        primaryCta: import("zod").ZodOptional<import("zod").ZodObject<{
            label: import("zod").ZodString;
            href: import("zod").ZodEffects<import("zod").ZodString, string, string>;
        }, "strip", import("zod").ZodTypeAny, {
            label: string;
            href: string;
        }, {
            label: string;
            href: string;
        }>>;
        secondaryCta: import("zod").ZodOptional<import("zod").ZodObject<{
            label: import("zod").ZodString;
            href: import("zod").ZodEffects<import("zod").ZodString, string, string>;
        }, "strip", import("zod").ZodTypeAny, {
            label: string;
            href: string;
        }, {
            label: string;
            href: string;
        }>>;
    }, "strip", import("zod").ZodTypeAny, {
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
    }>, import("zod").ZodObject<{
        id: import("zod").ZodString;
        type: import("zod").ZodLiteral<"product-grid">;
        title: import("zod").ZodOptional<import("zod").ZodString>;
        subtitle: import("zod").ZodOptional<import("zod").ZodString>;
        layout: import("zod").ZodOptional<import("zod").ZodEnum<["auto-fit", "3-col", "4-col"]>>;
        filter: import("zod").ZodOptional<import("zod").ZodObject<{
            featured: import("zod").ZodOptional<import("zod").ZodBoolean>;
            tags: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
        }, "strip", import("zod").ZodTypeAny, {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        }, {
            tags?: string[] | undefined;
            featured?: boolean | undefined;
        }>>;
    }, "strip", import("zod").ZodTypeAny, {
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
    }>, import("zod").ZodObject<{
        id: import("zod").ZodString;
        type: import("zod").ZodLiteral<"rich-text">;
        content: import("zod").ZodString;
    }, "strip", import("zod").ZodTypeAny, {
        type: "rich-text";
        id: string;
        content: string;
    }, {
        type: "rich-text";
        id: string;
        content: string;
    }>, import("zod").ZodObject<{
        id: import("zod").ZodString;
        type: import("zod").ZodLiteral<"cta-strip">;
        title: import("zod").ZodString;
        href: import("zod").ZodEffects<import("zod").ZodString, string, string>;
    }, "strip", import("zod").ZodTypeAny, {
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
}, "strip", import("zod").ZodTypeAny, {
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
}[]>>, import("zod").ZodObject<{
    titleTemplate: import("zod").ZodString;
    defaultTitle: import("zod").ZodString;
    description: import("zod").ZodString;
    openGraphImage: import("zod").ZodOptional<import("zod").ZodString>;
}, "strip", import("zod").ZodTypeAny, {
    description: string;
    titleTemplate: string;
    defaultTitle: string;
    openGraphImage?: string | undefined;
}, {
    description: string;
    titleTemplate: string;
    defaultTitle: string;
    openGraphImage?: string | undefined;
}>>, import("zod").ZodObject<{
    stripe: import("zod").ZodOptional<import("zod").ZodObject<{
        type: import("zod").ZodLiteral<"stripe">;
        publishableKey: import("zod").ZodString;
        secretKey: import("zod").ZodString;
        webhookSecret: import("zod").ZodOptional<import("zod").ZodString>;
    }, "strip", import("zod").ZodTypeAny, {
        type: "stripe";
        publishableKey: string;
        secretKey: string;
        webhookSecret?: string | undefined;
    }, {
        type: "stripe";
        publishableKey: string;
        secretKey: string;
        webhookSecret?: string | undefined;
    }>>;
    telegram: import("zod").ZodOptional<import("zod").ZodObject<{
        type: import("zod").ZodLiteral<"telegram">;
        botToken: import("zod").ZodString;
        chatId: import("zod").ZodString;
    }, "strip", import("zod").ZodTypeAny, {
        type: "telegram";
        botToken: string;
        chatId: string;
    }, {
        type: "telegram";
        botToken: string;
        chatId: string;
    }>>;
}, "strip", import("zod").ZodTypeAny, {
    stripe?: {
        type: "stripe";
        publishableKey: string;
        secretKey: string;
        webhookSecret?: string | undefined;
    } | undefined;
    telegram?: {
        type: "telegram";
        botToken: string;
        chatId: string;
    } | undefined;
}, {
    stripe?: {
        type: "stripe";
        publishableKey: string;
        secretKey: string;
        webhookSecret?: string | undefined;
    } | undefined;
    telegram?: {
        type: "telegram";
        botToken: string;
        chatId: string;
    } | undefined;
}>>;
