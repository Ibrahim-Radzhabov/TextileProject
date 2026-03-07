import { readFile, access } from "node:fs/promises";
import path from "node:path";
import type { StorefrontConfig } from "@store-platform/shared-types";
import { normalizeStorefrontConfig } from "./api-client";

const CLIENT_CONFIG_FILES = [
  "shop",
  "theme",
  "seo",
  "pages",
  "catalog",
  "integrations"
] as const;

async function resolveClientsDir(): Promise<string | null> {
  if (typeof process === "undefined" || !process.cwd) {
    return null;
  }
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "clients"),
    path.join(cwd, "..", "..", "clients")
  ];
  for (const dir of candidates) {
    try {
      await access(dir);
      return dir;
    } catch {
      // continue
    }
  }
  return null;
}

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Load storefront config from clients/{clientId}/*.json (build-time, no API).
 * Returns null when not in Node or when client dir is missing/invalid.
 */
export async function loadStorefrontConfigFromFs(
  clientId: string
): Promise<StorefrontConfig | null> {
  if (typeof process === "undefined") {
    return null;
  }

  const clientsDir = await resolveClientsDir();
  if (!clientsDir) {
    return null;
  }

  const clientDir = path.join(clientsDir, clientId);
  const read = (name: string) =>
    readJson(path.join(clientDir, `${name}.json`));

  const [shop, theme, seo, pages, catalog, integrations] = await Promise.all(
    CLIENT_CONFIG_FILES.map((name) => read(name))
  );

  if (!shop || !theme || !seo || !pages || !catalog || !integrations) {
    return null;
  }

  if (!Array.isArray(pages)) {
    return null;
  }

  const dto = {
    shop: shop as {
      id: string;
      name: string;
      logo?: { src: string; alt: string };
      primaryLocale?: string;
      primary_locale?: string;
      currency: string;
    },
    theme: theme as StorefrontConfig["theme"],
    seo: seo as StorefrontConfig["seo"],
    pages: pages as StorefrontConfig["pages"],
    catalog,
    integrations: integrations as StorefrontConfig["integrations"] & {
      stripe?: {
        type: "stripe";
        publishableKey?: string;
        publishable_key?: string;
        secretKey?: string;
        secret_key?: string;
        webhookSecret?: string;
        webhook_secret?: string;
      };
      telegram?: {
        type: "telegram";
        botToken?: string;
        bot_token?: string;
        chatId?: string;
        chat_id?: string;
      };
    }
  };

  return normalizeStorefrontConfig(
    dto as Parameters<typeof normalizeStorefrontConfig>[0]
  );
}

export function getClientId(): string {
  const raw =
    process.env.CLIENT_ID?.trim() ??
    process.env.NEXT_PUBLIC_CLIENT_ID?.trim() ??
    "demo";
  return raw.length ? raw : "demo";
}
