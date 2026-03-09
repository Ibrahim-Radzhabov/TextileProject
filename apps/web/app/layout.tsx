import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode, CSSProperties } from "react";
import { cookies } from "next/headers";
import { Lora, Manrope } from "next/font/google";
import type { ThemeConfig } from "@store-platform/shared-types";
import { getStorefrontConfig } from "@/lib/get-storefront-config";
import { buildOpenGraphImage, resolveMetadataBaseFromHeaders } from "@/lib/seo";
import {
  resolveThemeByVariantId,
  resolveThemeVariantId,
  THEME_VARIANT_COOKIE
} from "@/lib/theme-variants";
import { PwaRegister } from "./pwa-register";
import { StorefrontShell } from "./storefront-shell";

export const dynamic = "force-dynamic";

const veluraUiFont = Manrope({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-velura-ui"
});

const veluraDisplayFont = Lora({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-velura-display"
});

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
  const accentChannels = toRgbChannels(theme.colors.accent);
  const cardChannels = toRgbChannels(theme.colors.card);
  const borderChannels = toRgbChannels(theme.colors.border);
  const backgroundChannels = toRgbChannels(theme.colors.background);
  const foregroundChannels = toRgbChannels(theme.colors.foreground);

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
    "--gradient-page": `${theme.gradients.hero}, linear-gradient(180deg, rgba(${backgroundChannels} / 1), rgba(${backgroundChannels} / 0.96))`,
    "--gradient-accent-soft": `linear-gradient(135deg, rgba(${accentChannels} / 0.32), rgba(${accentChannels} / 0.1) 42%, rgba(${backgroundChannels} / 0.18) 100%)`,
    "--gradient-outline": `linear-gradient(135deg, rgba(${borderChannels} / 0.7), rgba(${accentChannels} / 0.45))`,
    "--surface-border-strong": `rgba(${borderChannels} / 0.56)`,
    "--surface-bg-soft": `rgba(${cardChannels} / 0.62)`,
    "--surface-bg-strong": `rgba(${cardChannels} / 0.86)`,
    "--text-accent-contrast": `rgb(${foregroundChannels})`,
    "--radius-pill": "999px",
    "--shadow-floating": `0 24px 60px rgba(${backgroundChannels} / 0.34)`,
    "--shadow-glow": `0 0 0 1px rgba(${accentChannels} / 0.24), 0 20px 55px rgba(${accentChannels} / 0.18)`,
    "--shadow-inset-soft": `inset 0 1px 0 rgba(${foregroundChannels} / 0.1)`,
    "--motion-fast": "180ms",
    "--motion-normal": "320ms",
    "--font-sans": `var(--font-velura-ui), ${theme.typography.fontSans}`,
    "--font-base-size": `${theme.typography.baseFontSize}px`,
    "--font-scale-ratio": `${theme.typography.scaleRatio}`
  } as CSSProperties;
}

function resolveShortName(shopName: string): string {
  const normalized = shopName.trim();
  if (normalized.length <= 20) {
    return normalized;
  }

  return normalized.slice(0, 20).trimEnd();
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();
  const shortName = resolveShortName(config.shop.name);
  const ogImage = buildOpenGraphImage(config);

  return {
    metadataBase: resolveMetadataBaseFromHeaders(),
    applicationName: config.shop.name,
    title: {
      default: config.seo.defaultTitle,
      template: config.seo.titleTemplate
    },
    description: config.seo.description,
    openGraph: {
      title: config.seo.defaultTitle,
      description: config.seo.description,
      siteName: config.shop.name,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined
    },
    twitter: {
      card: "summary_large_image",
      title: config.seo.defaultTitle,
      description: config.seo.description,
      images: ogImage ? [ogImage] : undefined
    },
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: shortName,
      statusBarStyle: "default"
    },
    icons: {
      icon: [
        { url: "/icons/icon-192.svg", type: "image/svg+xml", sizes: "192x192" },
        { url: "/icons/icon-512.svg", type: "image/svg+xml", sizes: "512x512" }
      ],
      apple: [{ url: "/icons/apple-touch-icon.svg", type: "image/svg+xml", sizes: "180x180" }],
      shortcut: [{ url: "/icons/icon-192.svg", type: "image/svg+xml", sizes: "192x192" }]
    },
    other: {
      "mobile-web-app-capable": "yes"
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export async function generateViewport(): Promise<Viewport> {
  const config = await getStorefrontConfig();
  const cookieStore = cookies();
  const activeTheme = resolveThemeByVariantId(
    config.theme,
    cookieStore.get(THEME_VARIANT_COOKIE)?.value
  );

  return {
    themeColor: activeTheme.colors.background,
    colorScheme: "dark",
    width: "device-width",
    initialScale: 1
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const config = await getStorefrontConfig();
  const cookieStore = cookies();
  const activeThemeVariantId = resolveThemeVariantId(
    config.theme,
    cookieStore.get(THEME_VARIANT_COOKIE)?.value
  );
  const activeTheme = resolveThemeByVariantId(config.theme, activeThemeVariantId);
  const themeStyle = themeToCssVars(activeTheme);

  return (
    <html lang="ru">
      <body className={`${veluraUiFont.variable} ${veluraDisplayFont.variable}`} style={themeStyle}>
        <PwaRegister />
        <StorefrontShell config={config} activeThemeVariantId={activeThemeVariantId}>
          {children}
        </StorefrontShell>
      </body>
    </html>
  );
}
