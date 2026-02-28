import "./globals.css";
import type { ReactNode, CSSProperties } from "react";
import type { ThemeConfig } from "@store-platform/shared-types";
import { fetchStorefrontConfig } from "@/lib/api-client";
import { StorefrontShell } from "./storefront-shell";

export const dynamic = "force-dynamic";

function toRgbChannels(value: string): string {
  const raw = value.trim();

  if (raw.startsWith("#")) {
    const hex = raw.slice(1);
    const normalized =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;

    if (normalized.length === 6) {
      const r = Number.parseInt(normalized.slice(0, 2), 16);
      const g = Number.parseInt(normalized.slice(2, 4), 16);
      const b = Number.parseInt(normalized.slice(4, 6), 16);
      return `${r} ${g} ${b}`;
    }
  }

  // rgba(148,163,184,0.24) or rgb(148, 163, 184)
  const rgbMatch = raw.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+)\s*)?\)$/
  );
  if (rgbMatch) {
    return `${rgbMatch[1]} ${rgbMatch[2]} ${rgbMatch[3]}`;
  }

  // Fallback: keep as-is (will likely render incorrectly, but avoids crashing).
  return raw;
}

function themeToCssVars(theme: ThemeConfig): CSSProperties {
  return {
    "--color-background": toRgbChannels(theme.colors.background),
    "--color-foreground": toRgbChannels(theme.colors.foreground),
    "--color-muted": toRgbChannels(theme.colors.muted),
    "--color-muted-foreground": toRgbChannels(theme.colors.mutedForeground),
    "--color-accent": toRgbChannels(theme.colors.accent),
    "--color-accent-soft": toRgbChannels(theme.colors.accentSoft),
    "--color-border": toRgbChannels(theme.colors.border),
    "--color-input": toRgbChannels(theme.colors.input),
    "--color-ring": toRgbChannels(theme.colors.ring),
    "--color-card": toRgbChannels(theme.colors.card),
    "--color-card-foreground": toRgbChannels(theme.colors.cardForeground),
    "--radius-xl": `${theme.radii.xl}px`,
    "--radius-lg": `${theme.radii.lg}px`,
    "--radius-md": `${theme.radii.md}px`,
    "--radius-sm": `${theme.radii.sm}px`,
    "--shadow-soft": theme.shadows.soft,
    "--shadow-soft-subtle": theme.shadows.softSubtle,
    "--shadow-ring": theme.shadows.ring,
    "--gradient-hero": theme.gradients.hero,
    "--gradient-surface": theme.gradients.surface,
    "--font-sans": theme.typography.fontSans,
    "--font-base-size": `${theme.typography.baseFontSize}px`,
    "--font-scale-ratio": `${theme.typography.scaleRatio}`
  } as CSSProperties;
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const config = await fetchStorefrontConfig();
  const themeStyle = themeToCssVars(config.theme);

  return (
    <html lang="en">
      <body style={themeStyle}>
        <StorefrontShell config={config}>{children}</StorefrontShell>
      </body>
    </html>
  );
}
