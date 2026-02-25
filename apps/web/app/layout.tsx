import "./globals.css";
import type { ReactNode, CSSProperties } from "react";
import type { ThemeConfig } from "@store-platform/shared-types";
import { fetchStorefrontConfig } from "@/lib/api-client";
import { StorefrontShell } from "./storefront-shell";

function themeToCssVars(theme: ThemeConfig): CSSProperties {
  return {
    "--color-background": theme.colors.background,
    "--color-foreground": theme.colors.foreground,
    "--color-muted": theme.colors.muted,
    "--color-muted-foreground": theme.colors.mutedForeground,
    "--color-accent": theme.colors.accent,
    "--color-accent-soft": theme.colors.accentSoft,
    "--color-border": theme.colors.border,
    "--color-input": theme.colors.input,
    "--color-ring": theme.colors.ring,
    "--color-card": theme.colors.card,
    "--color-card-foreground": theme.colors.cardForeground,
    "--radius-xl": `${theme.radii.xl}px`,
    "--radius-lg": `${theme.radii.lg}px`,
    "--radius-md": `${theme.radii.md}px`,
    "--radius-sm": `${theme.radii.sm}px`
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


