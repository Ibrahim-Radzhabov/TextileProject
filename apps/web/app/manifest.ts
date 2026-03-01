import { readFile } from "node:fs/promises";
import path from "node:path";
import type { MetadataRoute } from "next";
import type { SeoConfig, ShopConfig, ThemeConfig } from "@store-platform/shared-types";

export const runtime = "nodejs";

const DEFAULT_CLIENT_ID = "demo";

const FALLBACK_SHOP: ShopConfig = {
  id: DEFAULT_CLIENT_ID,
  name: "Store Platform",
  primaryLocale: "en-US",
  currency: "USD"
};

const FALLBACK_SEO: SeoConfig = {
  titleTemplate: "%s",
  defaultTitle: "Store Platform",
  description: "Config-driven storefront"
};

const FALLBACK_THEME: ThemeConfig = {
  id: "default",
  name: "Default",
  colors: {
    background: "#070E1F",
    foreground: "#F4F1EA",
    muted: "rgba(132,148,176,0.28)",
    mutedForeground: "#AAB2C3",
    accent: "#C78B3E",
    accentSoft: "rgba(199,139,62,0.22)",
    border: "rgba(136,154,186,0.32)",
    input: "rgba(12,20,40,0.78)",
    ring: "rgba(199,139,62,0.58)",
    card: "rgba(14,24,45,0.82)",
    cardForeground: "#F4F1EA"
  },
  radii: {
    xl: 32,
    lg: 24,
    md: 18,
    sm: 12
  },
  shadows: {
    soft: "0 24px 60px rgba(15,23,42,0.26)",
    softSubtle: "0 18px 45px rgba(15,23,42,0.18)",
    ring: "0 0 0 1px rgba(148,163,184,0.3)"
  },
  typography: {
    fontSans: "Soehne, Manrope, Avenir Next, SF Pro Display, sans-serif",
    baseFontSize: 16,
    scaleRatio: 1.18
  },
  gradients: {
    hero: "linear-gradient(160deg, rgba(7,14,31,1), rgba(10,18,34,1))",
    surface: "linear-gradient(150deg, rgba(16,27,50,0.88), rgba(9,17,33,0.96))"
  }
};

type ManifestConfig = {
  shop: ShopConfig;
  seo: SeoConfig;
  theme: ThemeConfig;
};

function resolveClientId(): string {
  const envClient = process.env.CLIENT_ID ?? process.env.NEXT_PUBLIC_CLIENT_ID ?? DEFAULT_CLIENT_ID;
  const normalized = envClient.trim();
  return normalized.length ? normalized : DEFAULT_CLIENT_ID;
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function loadManifestConfig(clientId: string): Promise<ManifestConfig> {
  const clientDir = path.resolve(process.cwd(), "..", "..", "clients", clientId);

  const [shop, seo, theme] = await Promise.all([
    readJsonFile<ShopConfig>(path.join(clientDir, "shop.json")),
    readJsonFile<SeoConfig>(path.join(clientDir, "seo.json")),
    readJsonFile<ThemeConfig>(path.join(clientDir, "theme.json"))
  ]);

  return { shop, seo, theme };
}

async function getManifestConfig(): Promise<ManifestConfig> {
  const clientId = resolveClientId();

  try {
    return await loadManifestConfig(clientId);
  } catch {
    if (clientId !== DEFAULT_CLIENT_ID) {
      try {
        return await loadManifestConfig(DEFAULT_CLIENT_ID);
      } catch {
        return { shop: FALLBACK_SHOP, seo: FALLBACK_SEO, theme: FALLBACK_THEME };
      }
    }

    return { shop: FALLBACK_SHOP, seo: FALLBACK_SEO, theme: FALLBACK_THEME };
  }
}

function resolveShortName(shopName: string): string {
  const normalized = shopName.trim();
  if (normalized.length <= 20) {
    return normalized;
  }

  return normalized.slice(0, 20).trimEnd();
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const config = await getManifestConfig();
  const shortName = resolveShortName(config.shop.name);

  return {
    name: config.shop.name,
    short_name: shortName,
    description: config.seo.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: config.theme.colors.background,
    theme_color: config.theme.colors.accent,
    icons: [
      {
        src: "/icons/icon-192.svg",
        type: "image/svg+xml",
        sizes: "192x192",
        purpose: "any"
      },
      {
        src: "/icons/icon-512.svg",
        type: "image/svg+xml",
        sizes: "512x512",
        purpose: "any"
      },
      {
        src: "/icons/icon-512.svg",
        type: "image/svg+xml",
        sizes: "512x512",
        purpose: "maskable"
      },
      {
        src: "/icons/apple-touch-icon.svg",
        type: "image/svg+xml",
        sizes: "180x180",
        purpose: "any"
      }
    ]
  };
}
