import type { ThemeConfig, ThemeVariant } from "@store-platform/shared-types";

export const THEME_VARIANT_COOKIE = "store_theme_variant";

function toBaseVariant(theme: ThemeConfig): ThemeVariant {
  return {
    id: theme.id,
    name: theme.name,
    colors: theme.colors,
    radii: theme.radii,
    shadows: theme.shadows,
    typography: theme.typography,
    gradients: theme.gradients
  };
}

export function resolveThemeVariants(theme: ThemeConfig): ThemeVariant[] {
  const input = theme.variants && theme.variants.length > 0 ? theme.variants : [toBaseVariant(theme)];
  const deduped = new Map<string, ThemeVariant>();

  for (const variant of input) {
    if (!deduped.has(variant.id)) {
      deduped.set(variant.id, variant);
    }
  }

  return Array.from(deduped.values());
}

export function resolveThemeVariantId(theme: ThemeConfig, requestedVariantId?: string | null): string {
  const variants = resolveThemeVariants(theme);
  const requested = requestedVariantId?.trim();
  if (requested && variants.some((variant) => variant.id === requested)) {
    return requested;
  }

  if (theme.defaultVariant && variants.some((variant) => variant.id === theme.defaultVariant)) {
    return theme.defaultVariant;
  }

  return variants[0]?.id ?? theme.id;
}

export function resolveThemeByVariantId(theme: ThemeConfig, requestedVariantId?: string | null): ThemeConfig {
  const variants = resolveThemeVariants(theme);
  const activeVariantId = resolveThemeVariantId(theme, requestedVariantId);
  const active = variants.find((variant) => variant.id === activeVariantId) ?? variants[0] ?? toBaseVariant(theme);

  return {
    id: active.id,
    name: active.name,
    colors: active.colors,
    radii: active.radii,
    shadows: active.shadows,
    typography: active.typography,
    gradients: active.gradients,
    defaultVariant: theme.defaultVariant ?? variants[0]?.id,
    variants
  };
}
