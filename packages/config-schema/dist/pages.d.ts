import { z } from "zod";
export declare const pageBlockSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<"hero">;
    content: z.ZodOptional<z.ZodObject<{
        eyebrow: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        subtitle: z.ZodOptional<z.ZodString>;
        trustLine: z.ZodOptional<z.ZodString>;
        quickLinks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            subtitle: z.ZodOptional<z.ZodString>;
            href: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }, {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }>, "many">>;
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
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    }, {
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    }>>;
    contentPlacement: z.ZodOptional<z.ZodEnum<["overlay", "below"]>>;
    eyebrow: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    subtitle: z.ZodOptional<z.ZodString>;
    trustLine: z.ZodOptional<z.ZodString>;
    quickLinks: z.ZodOptional<z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        subtitle: z.ZodOptional<z.ZodString>;
        href: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        label: string;
        href: string;
        subtitle?: string | undefined;
    }, {
        label: string;
        href: string;
        subtitle?: string | undefined;
    }>, "many">>;
    media: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        type: z.ZodEnum<["image", "video"]>;
        src: z.ZodEffects<z.ZodString, string, string>;
        mobileSrc: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        poster: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        alt: z.ZodOptional<z.ZodString>;
        overlayOpacity: z.ZodOptional<z.ZodNumber>;
        overlayPreset: z.ZodOptional<z.ZodEnum<["editorial", "balanced", "contrast"]>>;
        objectPosition: z.ZodOptional<z.ZodString>;
        mobileObjectPosition: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "image" | "video";
        src: string;
        alt?: string | undefined;
        mobileSrc?: string | undefined;
        poster?: string | undefined;
        overlayOpacity?: number | undefined;
        overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
        objectPosition?: string | undefined;
        mobileObjectPosition?: string | undefined;
    }, {
        type: "image" | "video";
        src: string;
        alt?: string | undefined;
        mobileSrc?: string | undefined;
        poster?: string | undefined;
        overlayOpacity?: number | undefined;
        overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
        objectPosition?: string | undefined;
        mobileObjectPosition?: string | undefined;
    }>, {
        type: "image" | "video";
        src: string;
        alt?: string | undefined;
        mobileSrc?: string | undefined;
        poster?: string | undefined;
        overlayOpacity?: number | undefined;
        overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
        objectPosition?: string | undefined;
        mobileObjectPosition?: string | undefined;
    }, {
        type: "image" | "video";
        src: string;
        alt?: string | undefined;
        mobileSrc?: string | undefined;
        poster?: string | undefined;
        overlayOpacity?: number | undefined;
        overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
        objectPosition?: string | undefined;
        mobileObjectPosition?: string | undefined;
    }>>;
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
    media?: {
        type: "image" | "video";
        src: string;
        alt?: string | undefined;
        mobileSrc?: string | undefined;
        poster?: string | undefined;
        overlayOpacity?: number | undefined;
        overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
        objectPosition?: string | undefined;
        mobileObjectPosition?: string | undefined;
    } | undefined;
    eyebrow?: string | undefined;
    title?: string | undefined;
    subtitle?: string | undefined;
    trustLine?: string | undefined;
    quickLinks?: {
        label: string;
        href: string;
        subtitle?: string | undefined;
    }[] | undefined;
    primaryCta?: {
        label: string;
        href: string;
    } | undefined;
    secondaryCta?: {
        label: string;
        href: string;
    } | undefined;
    content?: {
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    } | undefined;
    contentPlacement?: "overlay" | "below" | undefined;
}, {
    type: "hero";
    id: string;
    media?: {
        type: "image" | "video";
        src: string;
        alt?: string | undefined;
        mobileSrc?: string | undefined;
        poster?: string | undefined;
        overlayOpacity?: number | undefined;
        overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
        objectPosition?: string | undefined;
        mobileObjectPosition?: string | undefined;
    } | undefined;
    eyebrow?: string | undefined;
    title?: string | undefined;
    subtitle?: string | undefined;
    trustLine?: string | undefined;
    quickLinks?: {
        label: string;
        href: string;
        subtitle?: string | undefined;
    }[] | undefined;
    primaryCta?: {
        label: string;
        href: string;
    } | undefined;
    secondaryCta?: {
        label: string;
        href: string;
    } | undefined;
    content?: {
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
    } | undefined;
    contentPlacement?: "overlay" | "below" | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<"media-feature">;
    eyebrow: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    subtitle: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    align: z.ZodOptional<z.ZodEnum<["left", "right"]>>;
    media: z.ZodEffects<z.ZodObject<{
        type: z.ZodEnum<["image", "video"]>;
        src: z.ZodEffects<z.ZodString, string, string>;
        mobileSrc: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        poster: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        alt: z.ZodOptional<z.ZodString>;
        overlayOpacity: z.ZodOptional<z.ZodNumber>;
        overlayPreset: z.ZodOptional<z.ZodEnum<["editorial", "balanced", "contrast"]>>;
        objectPosition: z.ZodOptional<z.ZodString>;
        mobileObjectPosition: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "image" | "video";
        src: string;
        alt?: string | undefined;
        mobileSrc?: string | undefined;
        poster?: string | undefined;
        overlayOpacity?: number | undefined;
        overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
        objectPosition?: string | undefined;
        mobileObjectPosition?: string | undefined;
    }, {
        type: "image" | "video";
        src: string;
        alt?: string | undefined;
        mobileSrc?: string | undefined;
        poster?: string | undefined;
        overlayOpacity?: number | undefined;
        overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
        objectPosition?: string | undefined;
        mobileObjectPosition?: string | undefined;
    }>, {
        type: "image" | "video";
        src: string;
        alt?: string | undefined;
        mobileSrc?: string | undefined;
        poster?: string | undefined;
        overlayOpacity?: number | undefined;
        overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
        objectPosition?: string | undefined;
        mobileObjectPosition?: string | undefined;
    }, {
        type: "image" | "video";
        src: string;
        alt?: string | undefined;
        mobileSrc?: string | undefined;
        poster?: string | undefined;
        overlayOpacity?: number | undefined;
        overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
        objectPosition?: string | undefined;
        mobileObjectPosition?: string | undefined;
    }>;
    cta: z.ZodOptional<z.ZodObject<{
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
    type: "media-feature";
    id: string;
    media: {
        type: "image" | "video";
        src: string;
        alt?: string | undefined;
        mobileSrc?: string | undefined;
        poster?: string | undefined;
        overlayOpacity?: number | undefined;
        overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
        objectPosition?: string | undefined;
        mobileObjectPosition?: string | undefined;
    };
    title: string;
    eyebrow?: string | undefined;
    subtitle?: string | undefined;
    body?: string | undefined;
    align?: "left" | "right" | undefined;
    cta?: {
        label: string;
        href: string;
    } | undefined;
}, {
    type: "media-feature";
    id: string;
    media: {
        type: "image" | "video";
        src: string;
        alt?: string | undefined;
        mobileSrc?: string | undefined;
        poster?: string | undefined;
        overlayOpacity?: number | undefined;
        overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
        objectPosition?: string | undefined;
        mobileObjectPosition?: string | undefined;
    };
    title: string;
    eyebrow?: string | undefined;
    subtitle?: string | undefined;
    body?: string | undefined;
    align?: "left" | "right" | undefined;
    cta?: {
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
        content: z.ZodOptional<z.ZodObject<{
            eyebrow: z.ZodOptional<z.ZodString>;
            title: z.ZodString;
            subtitle: z.ZodOptional<z.ZodString>;
            trustLine: z.ZodOptional<z.ZodString>;
            quickLinks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                subtitle: z.ZodOptional<z.ZodString>;
                href: z.ZodEffects<z.ZodString, string, string>;
            }, "strip", z.ZodTypeAny, {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }, {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }>, "many">>;
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
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        }, {
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        }>>;
        contentPlacement: z.ZodOptional<z.ZodEnum<["overlay", "below"]>>;
        eyebrow: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        subtitle: z.ZodOptional<z.ZodString>;
        trustLine: z.ZodOptional<z.ZodString>;
        quickLinks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            subtitle: z.ZodOptional<z.ZodString>;
            href: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }, {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }>, "many">>;
        media: z.ZodOptional<z.ZodEffects<z.ZodObject<{
            type: z.ZodEnum<["image", "video"]>;
            src: z.ZodEffects<z.ZodString, string, string>;
            mobileSrc: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            poster: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            alt: z.ZodOptional<z.ZodString>;
            overlayOpacity: z.ZodOptional<z.ZodNumber>;
            overlayPreset: z.ZodOptional<z.ZodEnum<["editorial", "balanced", "contrast"]>>;
            objectPosition: z.ZodOptional<z.ZodString>;
            mobileObjectPosition: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        }, {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        }>, {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        }, {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        }>>;
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
        media?: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        } | undefined;
        eyebrow?: string | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
        content?: {
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        } | undefined;
        contentPlacement?: "overlay" | "below" | undefined;
    }, {
        type: "hero";
        id: string;
        media?: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        } | undefined;
        eyebrow?: string | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
        content?: {
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        } | undefined;
        contentPlacement?: "overlay" | "below" | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        type: z.ZodLiteral<"media-feature">;
        eyebrow: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        subtitle: z.ZodOptional<z.ZodString>;
        body: z.ZodOptional<z.ZodString>;
        align: z.ZodOptional<z.ZodEnum<["left", "right"]>>;
        media: z.ZodEffects<z.ZodObject<{
            type: z.ZodEnum<["image", "video"]>;
            src: z.ZodEffects<z.ZodString, string, string>;
            mobileSrc: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            poster: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            alt: z.ZodOptional<z.ZodString>;
            overlayOpacity: z.ZodOptional<z.ZodNumber>;
            overlayPreset: z.ZodOptional<z.ZodEnum<["editorial", "balanced", "contrast"]>>;
            objectPosition: z.ZodOptional<z.ZodString>;
            mobileObjectPosition: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        }, {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        }>, {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        }, {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        }>;
        cta: z.ZodOptional<z.ZodObject<{
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
        type: "media-feature";
        id: string;
        media: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        };
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        body?: string | undefined;
        align?: "left" | "right" | undefined;
        cta?: {
            label: string;
            href: string;
        } | undefined;
    }, {
        type: "media-feature";
        id: string;
        media: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        };
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        body?: string | undefined;
        align?: "left" | "right" | undefined;
        cta?: {
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
        media?: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        } | undefined;
        eyebrow?: string | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
        content?: {
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        } | undefined;
        contentPlacement?: "overlay" | "below" | undefined;
    } | {
        type: "media-feature";
        id: string;
        media: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        };
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        body?: string | undefined;
        align?: "left" | "right" | undefined;
        cta?: {
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
        media?: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        } | undefined;
        eyebrow?: string | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
        content?: {
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        } | undefined;
        contentPlacement?: "overlay" | "below" | undefined;
    } | {
        type: "media-feature";
        id: string;
        media: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        };
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        body?: string | undefined;
        align?: "left" | "right" | undefined;
        cta?: {
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
        media?: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        } | undefined;
        eyebrow?: string | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
        content?: {
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        } | undefined;
        contentPlacement?: "overlay" | "below" | undefined;
    } | {
        type: "media-feature";
        id: string;
        media: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        };
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        body?: string | undefined;
        align?: "left" | "right" | undefined;
        cta?: {
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
        media?: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        } | undefined;
        eyebrow?: string | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
        content?: {
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        } | undefined;
        contentPlacement?: "overlay" | "below" | undefined;
    } | {
        type: "media-feature";
        id: string;
        media: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        };
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        body?: string | undefined;
        align?: "left" | "right" | undefined;
        cta?: {
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
        content: z.ZodOptional<z.ZodObject<{
            eyebrow: z.ZodOptional<z.ZodString>;
            title: z.ZodString;
            subtitle: z.ZodOptional<z.ZodString>;
            trustLine: z.ZodOptional<z.ZodString>;
            quickLinks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                subtitle: z.ZodOptional<z.ZodString>;
                href: z.ZodEffects<z.ZodString, string, string>;
            }, "strip", z.ZodTypeAny, {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }, {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }>, "many">>;
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
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        }, {
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        }>>;
        contentPlacement: z.ZodOptional<z.ZodEnum<["overlay", "below"]>>;
        eyebrow: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        subtitle: z.ZodOptional<z.ZodString>;
        trustLine: z.ZodOptional<z.ZodString>;
        quickLinks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            subtitle: z.ZodOptional<z.ZodString>;
            href: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }, {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }>, "many">>;
        media: z.ZodOptional<z.ZodEffects<z.ZodObject<{
            type: z.ZodEnum<["image", "video"]>;
            src: z.ZodEffects<z.ZodString, string, string>;
            mobileSrc: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            poster: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            alt: z.ZodOptional<z.ZodString>;
            overlayOpacity: z.ZodOptional<z.ZodNumber>;
            overlayPreset: z.ZodOptional<z.ZodEnum<["editorial", "balanced", "contrast"]>>;
            objectPosition: z.ZodOptional<z.ZodString>;
            mobileObjectPosition: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        }, {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        }>, {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        }, {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        }>>;
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
        media?: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        } | undefined;
        eyebrow?: string | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
        content?: {
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        } | undefined;
        contentPlacement?: "overlay" | "below" | undefined;
    }, {
        type: "hero";
        id: string;
        media?: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        } | undefined;
        eyebrow?: string | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
        content?: {
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        } | undefined;
        contentPlacement?: "overlay" | "below" | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        type: z.ZodLiteral<"media-feature">;
        eyebrow: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        subtitle: z.ZodOptional<z.ZodString>;
        body: z.ZodOptional<z.ZodString>;
        align: z.ZodOptional<z.ZodEnum<["left", "right"]>>;
        media: z.ZodEffects<z.ZodObject<{
            type: z.ZodEnum<["image", "video"]>;
            src: z.ZodEffects<z.ZodString, string, string>;
            mobileSrc: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            poster: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            alt: z.ZodOptional<z.ZodString>;
            overlayOpacity: z.ZodOptional<z.ZodNumber>;
            overlayPreset: z.ZodOptional<z.ZodEnum<["editorial", "balanced", "contrast"]>>;
            objectPosition: z.ZodOptional<z.ZodString>;
            mobileObjectPosition: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        }, {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        }>, {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        }, {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        }>;
        cta: z.ZodOptional<z.ZodObject<{
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
        type: "media-feature";
        id: string;
        media: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        };
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        body?: string | undefined;
        align?: "left" | "right" | undefined;
        cta?: {
            label: string;
            href: string;
        } | undefined;
    }, {
        type: "media-feature";
        id: string;
        media: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        };
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        body?: string | undefined;
        align?: "left" | "right" | undefined;
        cta?: {
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
        media?: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        } | undefined;
        eyebrow?: string | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
        content?: {
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        } | undefined;
        contentPlacement?: "overlay" | "below" | undefined;
    } | {
        type: "media-feature";
        id: string;
        media: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        };
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        body?: string | undefined;
        align?: "left" | "right" | undefined;
        cta?: {
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
        media?: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        } | undefined;
        eyebrow?: string | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
        content?: {
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        } | undefined;
        contentPlacement?: "overlay" | "below" | undefined;
    } | {
        type: "media-feature";
        id: string;
        media: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        };
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        body?: string | undefined;
        align?: "left" | "right" | undefined;
        cta?: {
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
        media?: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        } | undefined;
        eyebrow?: string | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
        content?: {
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        } | undefined;
        contentPlacement?: "overlay" | "below" | undefined;
    } | {
        type: "media-feature";
        id: string;
        media: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        };
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        body?: string | undefined;
        align?: "left" | "right" | undefined;
        cta?: {
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
        media?: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        } | undefined;
        eyebrow?: string | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
        content?: {
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        } | undefined;
        contentPlacement?: "overlay" | "below" | undefined;
    } | {
        type: "media-feature";
        id: string;
        media: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        };
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        body?: string | undefined;
        align?: "left" | "right" | undefined;
        cta?: {
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
        media?: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        } | undefined;
        eyebrow?: string | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
        content?: {
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        } | undefined;
        contentPlacement?: "overlay" | "below" | undefined;
    } | {
        type: "media-feature";
        id: string;
        media: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        };
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        body?: string | undefined;
        align?: "left" | "right" | undefined;
        cta?: {
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
        media?: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        } | undefined;
        eyebrow?: string | undefined;
        title?: string | undefined;
        subtitle?: string | undefined;
        trustLine?: string | undefined;
        quickLinks?: {
            label: string;
            href: string;
            subtitle?: string | undefined;
        }[] | undefined;
        primaryCta?: {
            label: string;
            href: string;
        } | undefined;
        secondaryCta?: {
            label: string;
            href: string;
        } | undefined;
        content?: {
            title: string;
            eyebrow?: string | undefined;
            subtitle?: string | undefined;
            trustLine?: string | undefined;
            quickLinks?: {
                label: string;
                href: string;
                subtitle?: string | undefined;
            }[] | undefined;
            primaryCta?: {
                label: string;
                href: string;
            } | undefined;
            secondaryCta?: {
                label: string;
                href: string;
            } | undefined;
        } | undefined;
        contentPlacement?: "overlay" | "below" | undefined;
    } | {
        type: "media-feature";
        id: string;
        media: {
            type: "image" | "video";
            src: string;
            alt?: string | undefined;
            mobileSrc?: string | undefined;
            poster?: string | undefined;
            overlayOpacity?: number | undefined;
            overlayPreset?: "editorial" | "balanced" | "contrast" | undefined;
            objectPosition?: string | undefined;
            mobileObjectPosition?: string | undefined;
        };
        title: string;
        eyebrow?: string | undefined;
        subtitle?: string | undefined;
        body?: string | undefined;
        align?: "left" | "right" | undefined;
        cta?: {
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
