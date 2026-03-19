import type { JsonValue, Product, ProductBadge, ProductMedia } from "@store-platform/shared-types";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

function parseRequiredString(value: FormDataEntryValue | null, fieldName: string): string {
  if (typeof value !== "string") {
    throw new Error(`Поле "${fieldName}" обязательно.`);
  }
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`Поле "${fieldName}" обязательно.`);
  }
  return normalized;
}

function parseOptionalString(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function parseMoneyAmount(value: FormDataEntryValue | null, fieldName: string): number {
  if (typeof value !== "string") {
    throw new Error(`Поле "${fieldName}" обязательно.`);
  }
  const normalized = value.replace(",", ".").trim();
  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Поле "${fieldName}" должно быть числом больше 0.`);
  }
  return amount;
}

function parseOptionalMoneyAmount(value: FormDataEntryValue | null, fieldName: string): number | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.replace(",", ".").trim();
  if (!normalized.length) {
    return undefined;
  }
  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Поле "${fieldName}" должно быть числом больше 0.`);
  }
  return amount;
}

function parseOptionalInteger(value: FormDataEntryValue | null, fieldName: string): number | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim();
  if (!normalized.length) {
    return undefined;
  }
  if (!/^-?\d+$/.test(normalized)) {
    throw new Error(`Поле "${fieldName}" должно быть целым числом.`);
  }
  const parsed = Number.parseInt(normalized, 10);
  if (!Number.isInteger(parsed)) {
    throw new Error(`Поле "${fieldName}" должно быть целым числом.`);
  }
  return parsed;
}

function parseTags(value: FormDataEntryValue | null): string[] | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const tags = value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
  return tags.length ? tags : undefined;
}

function parseJsonArray<T>(raw: string, fieldName: string): T[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Поле "${fieldName}" должно быть валидным JSON-массивом.`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`Поле "${fieldName}" должно быть JSON-массивом.`);
  }
  return parsed as T[];
}

function parseJsonObject(raw: string, fieldName: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Поле "${fieldName}" должно быть валидным JSON-объектом.`);
  }
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error(`Поле "${fieldName}" должно быть JSON-объектом.`);
  }
  return parsed as Record<string, unknown>;
}

function normalizeJsonValue(value: unknown, fieldName: string, path: string): JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry, index) => normalizeJsonValue(entry, fieldName, `${path}[${index}]`));
  }

  if (typeof value === "object") {
    const normalized: Record<string, JsonValue> = {};
    for (const [key, entry] of Object.entries(value)) {
      normalized[key] = normalizeJsonValue(entry, fieldName, `${path}.${key}`);
    }
    return normalized;
  }

  throw new Error(`Поле "${fieldName}" содержит неподдерживаемое значение в "${path}".`);
}

function parseMediaFromJson(raw: string): ProductMedia[] {
  const items = parseJsonArray<Record<string, unknown>>(raw, "media_json");
  return items.map((item, index) => {
    const id = typeof item.id === "string" ? item.id.trim() : "";
    const url = typeof item.url === "string" ? item.url.trim() : "";
    const alt = typeof item.alt === "string" ? item.alt.trim() : "";
    const thumbnailUrl = typeof item.thumbnailUrl === "string" ? item.thumbnailUrl.trim() : "";
    const zoomUrl = typeof item.zoomUrl === "string" ? item.zoomUrl.trim() : "";
    const width = item.width;
    const height = item.height;
    if (!id || !url || !alt) {
      throw new Error(`media_json[${index}] должен содержать id, url и alt.`);
    }
    const normalizedWidth =
      width === undefined || width === null || width === ""
        ? undefined
        : typeof width === "number"
          ? width
          : typeof width === "string" && /^\d+$/.test(width.trim())
            ? Number.parseInt(width.trim(), 10)
            : Number.NaN;
    const normalizedHeight =
      height === undefined || height === null || height === ""
        ? undefined
        : typeof height === "number"
          ? height
          : typeof height === "string" && /^\d+$/.test(height.trim())
            ? Number.parseInt(height.trim(), 10)
            : Number.NaN;

    if (
      normalizedWidth !== undefined &&
      (!Number.isInteger(normalizedWidth) || normalizedWidth <= 0)
    ) {
      throw new Error(`media_json[${index}].width должен быть положительным целым числом.`);
    }

    if (
      normalizedHeight !== undefined &&
      (!Number.isInteger(normalizedHeight) || normalizedHeight <= 0)
    ) {
      throw new Error(`media_json[${index}].height должен быть положительным целым числом.`);
    }

    return {
      id,
      url,
      alt,
      thumbnailUrl: thumbnailUrl || undefined,
      zoomUrl: zoomUrl || undefined,
      width: normalizedWidth,
      height: normalizedHeight,
    };
  });
}

function parseBadgesFromJson(raw: string): ProductBadge[] {
  const items = parseJsonArray<Record<string, unknown>>(raw, "badges_json");
  return items.map((item, index) => {
    const id = typeof item.id === "string" ? item.id.trim() : "";
    const label = typeof item.label === "string" ? item.label.trim() : "";
    const tone = item.tone;
    if (!id || !label || (tone !== "accent" && tone !== "neutral" && tone !== "critical")) {
      throw new Error(`badges_json[${index}] должен содержать id, label и корректный tone.`);
    }
    return { id, label, tone };
  });
}

function parseMetadataFromJson(raw: string): Record<string, JsonValue> {
  const record = parseJsonObject(raw, "metadata_json");
  const normalized: Record<string, JsonValue> = {};

  for (const [key, value] of Object.entries(record)) {
    normalized[key] = normalizeJsonValue(value, "metadata_json", key);
  }

  return normalized;
}

type ProductColorOptionInput = {
  id: string;
  label: string;
  tone: string;
  mediaIds: string[];
};

function parseColorOptionsFromJson(raw: string): ProductColorOptionInput[] {
  const items = parseJsonArray<Record<string, unknown>>(raw, "color_options_json");

  return items.map((item, index) => {
    const id = typeof item.id === "string" ? item.id.trim() : "";
    const label = typeof item.label === "string" ? item.label.trim() : "";
    const tone = typeof item.tone === "string" ? item.tone.trim().toLowerCase() : "";
    const mediaIds = Array.isArray(item.mediaIds)
      ? item.mediaIds.filter((mediaId): mediaId is string => typeof mediaId === "string").map((mediaId) => mediaId.trim()).filter(Boolean)
      : [];

    if (!id || !label || !tone || mediaIds.length === 0) {
      throw new Error(
        `color_options_json[${index}] должен содержать id, label, tone и непустой mediaIds[]`
      );
    }

    return {
      id,
      label,
      tone,
      mediaIds,
    };
  });
}

export function resolveStoreApiUrl(): string {
  return process.env.STORE_API_URL ?? process.env.NEXT_PUBLIC_STORE_API_URL ?? "http://127.0.0.1:8000";
}

function extractBearerToken(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match ? match[1]?.trim() ?? null : null;
}

function parseCookieValue(cookieHeader: string | null, cookieName: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const chunk of cookieHeader.split(";")) {
    const [rawName, ...rest] = chunk.split("=");
    if (rawName?.trim() !== cookieName) {
      continue;
    }

    const value = rest.join("=").trim();
    if (!value) {
      return null;
    }

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return null;
}

export function buildAdminApiHeaders(request?: Request): HeadersInit {
  const token =
    process.env.ADMIN_TOKEN?.trim() ||
    request?.headers.get("x-admin-token")?.trim() ||
    extractBearerToken(request?.headers.get("authorization") ?? null) ||
    parseCookieValue(request?.headers.get("cookie") ?? null, ADMIN_COOKIE_NAME);

  if (!token) {
    return {};
  }

  return { "x-admin-token": token };
}

export function buildProductPayloadFromFormData(formData: FormData): Product {
  const id = parseRequiredString(formData.get("id"), "id");
  const slug = parseRequiredString(formData.get("slug"), "slug");
  const name = parseRequiredString(formData.get("name"), "name");
  const description = parseOptionalString(formData.get("description"));
  const shortDescription = parseOptionalString(formData.get("short_description"));
  const priceAmount = parseMoneyAmount(formData.get("price_amount"), "price_amount");
  const priceCurrency = parseRequiredString(formData.get("price_currency"), "price_currency").toUpperCase();
  const compareAmount = parseOptionalMoneyAmount(formData.get("compare_price_amount"), "compare_price_amount");
  const compareCurrencyRaw = parseOptionalString(formData.get("compare_price_currency"));
  const sortOrder = parseOptionalInteger(formData.get("sort_order"), "sort_order");
  const tags = parseTags(formData.get("tags"));
  const isActive =
    formData.get("is_active") === "on" ||
    formData.get("is_active") === "true" ||
    formData.get("is_active") === "1";
  const isFeatured =
    formData.get("is_featured") === "on" ||
    formData.get("is_featured") === "true" ||
    formData.get("is_featured") === "1";

  const mediaJsonRaw = parseOptionalString(formData.get("media_json"));
  let media: ProductMedia[];
  if (mediaJsonRaw) {
    media = parseMediaFromJson(mediaJsonRaw);
  } else {
    const mediaId = parseOptionalString(formData.get("media_id")) ?? `${id}-media-1`;
    const mediaUrl = parseRequiredString(formData.get("media_url"), "media_url");
    const mediaAlt = parseRequiredString(formData.get("media_alt"), "media_alt");
    media = [{ id: mediaId, url: mediaUrl, alt: mediaAlt }];
  }

  const badgesJsonRaw = parseOptionalString(formData.get("badges_json"));
  const badges = badgesJsonRaw ? parseBadgesFromJson(badgesJsonRaw) : undefined;

  const colorOptionsJsonRaw = parseOptionalString(formData.get("color_options_json"));
  const colorOptions = colorOptionsJsonRaw ? parseColorOptionsFromJson(colorOptionsJsonRaw) : undefined;

  const metadataJsonRaw = parseOptionalString(formData.get("metadata_json"));
  const metadata = metadataJsonRaw ? parseMetadataFromJson(metadataJsonRaw) : {};
  if (colorOptions && colorOptions.length > 0) {
    metadata.colorOptions = colorOptions;
  }

  return {
    id,
    slug,
    name,
    description,
    shortDescription,
    price: {
      currency: priceCurrency,
      amount: priceAmount,
    },
    compareAtPrice:
      compareAmount !== undefined
        ? {
            currency: (compareCurrencyRaw ?? priceCurrency).toUpperCase(),
            amount: compareAmount,
          }
        : undefined,
    badges,
    tags,
    media,
    isActive,
    sortOrder,
    isFeatured,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}

export function productToFormDefaults(product: Product): {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  priceAmount: string;
  priceCurrency: string;
  comparePriceAmount: string;
  comparePriceCurrency: string;
  sortOrder: string;
  tags: string;
  isActive: boolean;
  isFeatured: boolean;
  mediaId: string;
  mediaUrl: string;
  mediaAlt: string;
  mediaJson: string;
  badgesJson: string;
  metadataJson: string;
  colorOptionsJson: string;
} {
  const firstMedia = product.media[0] ?? { id: "", url: "", alt: "" };
  const rawColorOptions =
    product.metadata && typeof product.metadata === "object" && !Array.isArray(product.metadata)
      ? product.metadata.colorOptions
      : undefined;
  const colorOptionsJson = Array.isArray(rawColorOptions)
    ? JSON.stringify(rawColorOptions, null, 2)
    : "";
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description ?? "",
    shortDescription: product.shortDescription ?? "",
    priceAmount: String(product.price.amount),
    priceCurrency: product.price.currency,
    comparePriceAmount: product.compareAtPrice ? String(product.compareAtPrice.amount) : "",
    comparePriceCurrency: product.compareAtPrice?.currency ?? "",
    sortOrder: product.sortOrder !== undefined && product.sortOrder !== null ? String(product.sortOrder) : "",
    tags: product.tags?.join(", ") ?? "",
    isActive: product.isActive !== false,
    isFeatured: Boolean(product.isFeatured),
    mediaId: firstMedia.id,
    mediaUrl: firstMedia.url,
    mediaAlt: firstMedia.alt,
    mediaJson: JSON.stringify(product.media ?? [], null, 2),
    badgesJson: JSON.stringify(product.badges ?? [], null, 2),
    metadataJson: JSON.stringify(product.metadata ?? {}, null, 2),
    colorOptionsJson,
  };
}
