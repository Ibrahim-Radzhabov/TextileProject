import { z } from "zod";

const themeTokensSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  colors: z.object({
    background: z.string(),
    foreground: z.string(),
    muted: z.string(),
    mutedForeground: z.string(),
    accent: z.string(),
    accentSoft: z.string(),
    border: z.string(),
    input: z.string(),
    ring: z.string(),
    card: z.string(),
    cardForeground: z.string()
  }),
  radii: z.object({
    xl: z.number().nonnegative(),
    lg: z.number().nonnegative(),
    md: z.number().nonnegative(),
    sm: z.number().nonnegative()
  }),
  shadows: z.object({
    soft: z.string(),
    softSubtle: z.string(),
    ring: z.string()
  }),
  typography: z.object({
    fontSans: z.string(),
    baseFontSize: z.number().positive(),
    scaleRatio: z.number().positive()
  }),
  gradients: z.object({
    hero: z.string(),
    surface: z.string()
  })
});

export const themeVariantSchema = themeTokensSchema;

export const themeSchema = themeTokensSchema.extend({
  defaultVariant: z.string().min(1).optional(),
  variants: z.array(themeVariantSchema).min(1).optional()
});

export type ThemeConfigInput = z.infer<typeof themeSchema>;
