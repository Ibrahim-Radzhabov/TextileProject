"use client";

import * as React from "react";
import { Button, Input, Surface } from "@store-platform/ui";

export type AdminProductFormDefaults = {
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
};

export type ExistingAdminProductIdentity = {
  id: string;
  slug: string;
};

type AdminProductFormProps = {
  action: string;
  submitLabel: string;
  defaults: AdminProductFormDefaults;
  readOnlyId?: boolean;
  returnTo?: string;
  existingProducts?: ExistingAdminProductIdentity[];
};

type AdminMediaItem = {
  id: string;
  url: string;
  alt: string;
};

type UploadResponse = {
  files?: Array<{
    id?: string;
    url?: string;
    alt?: string;
  }>;
  detail?: string;
};

const CYRILLIC_TO_LATIN_MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya"
};

function transliterateCyrillic(value: string): string {
  return Array.from(value)
    .map((char) => CYRILLIC_TO_LATIN_MAP[char.toLowerCase()] ?? char)
    .join("");
}

function slugifyIdentitySegment(value: string): string {
  const transliterated = transliterateCyrillic(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ");

  return transliterated
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 56);
}

function buildUniqueIdentityValue(
  baseValue: string,
  usedValues: Set<string>,
  fallbackPrefix: string
): string {
  const normalizedBase = (baseValue || fallbackPrefix).slice(0, 56) || fallbackPrefix;
  let candidate = normalizedBase;
  let counter = 2;

  while (usedValues.has(candidate.toLowerCase())) {
    const suffix = `-${counter}`;
    candidate = `${normalizedBase.slice(0, Math.max(1, 56 - suffix.length))}${suffix}`;
    counter += 1;
  }

  return candidate;
}

function buildGeneratedSlug(name: string, usedSlugs: Set<string>): string {
  if (!name.trim()) {
    return "";
  }
  const baseSlug = slugifyIdentitySegment(name) || "product";
  return buildUniqueIdentityValue(baseSlug, usedSlugs, "product");
}

function buildGeneratedId(name: string, usedIds: Set<string>): string {
  if (!name.trim()) {
    return "";
  }
  const slugBase = slugifyIdentitySegment(name) || "product";
  const baseId = `product-${slugBase}`;
  return buildUniqueIdentityValue(baseId, usedIds, "product-item");
}

function FormFieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label className="space-y-1" htmlFor={htmlFor}>
      <span className="text-xs text-muted-foreground">{children}</span>
    </label>
  );
}

function serializeMediaItems(items: AdminMediaItem[]): string {
  if (items.length === 0) {
    return "";
  }
  return JSON.stringify(items, null, 2);
}

function parseMediaItems(raw: string): { items: AdminMediaItem[]; error: string | null } {
  const normalized = raw.trim();
  if (!normalized) {
    return { items: [], error: null };
  }

  try {
    const parsed = JSON.parse(normalized);
    if (!Array.isArray(parsed)) {
      return { items: [], error: "media_json должен быть JSON-массивом." };
    }

    const items = parsed.map((item, index) => {
      if (!item || Array.isArray(item) || typeof item !== "object") {
        throw new Error(`media_json[${index}] должен быть объектом.`);
      }

      const id = typeof item.id === "string" ? item.id.trim() : "";
      const url = typeof item.url === "string" ? item.url.trim() : "";
      const alt = typeof item.alt === "string" ? item.alt.trim() : "";

      if (!id || !url || !alt) {
        throw new Error(`media_json[${index}] должен содержать id, url и alt.`);
      }

      return { id, url, alt };
    });

    return { items, error: null };
  } catch (error) {
    return {
      items: [],
      error: error instanceof Error ? error.message : "media_json содержит некорректный JSON."
    };
  }
}

function buildLegacyMediaItem(defaults: AdminProductFormDefaults, values: {
  mediaId: string;
  mediaUrl: string;
  mediaAlt: string;
}): AdminMediaItem[] {
  const mediaUrl = values.mediaUrl.trim();
  if (!mediaUrl) {
    return [];
  }

  return [
    {
      id: values.mediaId.trim() || defaults.id || "product-media-1",
      url: mediaUrl,
      alt: values.mediaAlt.trim() || defaults.name || "Product image"
    }
  ];
}

function normalizeUploadedFiles(payload: UploadResponse | null | undefined): AdminMediaItem[] {
  if (!payload || !Array.isArray(payload.files)) {
    return [];
  }

  return payload.files
    .map((item) => {
      const id = typeof item?.id === "string" ? item.id.trim() : "";
      const url = typeof item?.url === "string" ? item.url.trim() : "";
      const alt = typeof item?.alt === "string" ? item.alt.trim() : "";
      return id && url && alt ? { id, url, alt } : null;
    })
    .filter((item): item is AdminMediaItem => item !== null);
}

function dedupeMediaItems(items: AdminMediaItem[]): AdminMediaItem[] {
  const seen = new Set<string>();
  const unique: AdminMediaItem[] = [];

  for (const item of items) {
    const key = `${item.id}::${item.url}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(item);
  }

  return unique;
}

export function AdminProductForm({
  action,
  submitLabel,
  defaults,
  readOnlyId = false,
  returnTo,
  existingProducts = [],
}: AdminProductFormProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [nameValue, setNameValue] = React.useState(defaults.name);
  const [idValue, setIdValue] = React.useState(defaults.id);
  const [slugValue, setSlugValue] = React.useState(defaults.slug);
  const [idManuallyEdited, setIdManuallyEdited] = React.useState(defaults.id.trim().length > 0);
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(defaults.slug.trim().length > 0);
  const [mediaJsonValue, setMediaJsonValue] = React.useState(defaults.mediaJson);
  const [legacyMediaId, setLegacyMediaId] = React.useState(defaults.mediaId);
  const [legacyMediaUrl, setLegacyMediaUrl] = React.useState(defaults.mediaUrl);
  const [legacyMediaAlt, setLegacyMediaAlt] = React.useState(defaults.mediaAlt);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = React.useState<string | null>(null);
  const usedIdValues = React.useMemo(
    () => new Set(existingProducts.map((product) => product.id.trim().toLowerCase()).filter(Boolean)),
    [existingProducts]
  );
  const usedSlugValues = React.useMemo(
    () => new Set(existingProducts.map((product) => product.slug.trim().toLowerCase()).filter(Boolean)),
    [existingProducts]
  );

  const parsedMediaState = React.useMemo(
    () => parseMediaItems(mediaJsonValue),
    [mediaJsonValue]
  );
  const legacyMediaItems = React.useMemo(
    () =>
      buildLegacyMediaItem(defaults, {
        mediaId: legacyMediaId,
        mediaUrl: legacyMediaUrl,
        mediaAlt: legacyMediaAlt
      }),
    [defaults, legacyMediaAlt, legacyMediaId, legacyMediaUrl]
  );
  const hasStructuredGallery = mediaJsonValue.trim().length > 0;
  const effectiveMediaItems = hasStructuredGallery
    ? parsedMediaState.items
    : legacyMediaItems;
  const generatedIdentity = React.useMemo(
    () => ({
      id: buildGeneratedId(nameValue, usedIdValues),
      slug: buildGeneratedSlug(nameValue, usedSlugValues)
    }),
    [nameValue, usedIdValues, usedSlugValues]
  );

  const syncMediaItems = React.useCallback((items: AdminMediaItem[]) => {
    setMediaJsonValue(serializeMediaItems(items));
  }, []);

  React.useEffect(() => {
    if (!readOnlyId && !idManuallyEdited) {
      setIdValue(generatedIdentity.id);
    }
  }, [generatedIdentity.id, idManuallyEdited, readOnlyId]);

  React.useEffect(() => {
    if (!slugManuallyEdited) {
      setSlugValue(generatedIdentity.slug);
    }
  }, [generatedIdentity.slug, slugManuallyEdited]);

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleGenerateId = () => {
    setIdValue(generatedIdentity.id);
    setIdManuallyEdited(false);
  };

  const handleGenerateSlug = () => {
    setSlugValue(generatedIdentity.slug);
    setSlugManuallyEdited(false);
  };

  const handleMediaItemChange = (
    index: number,
    key: keyof AdminMediaItem,
    value: string
  ) => {
    if (!hasStructuredGallery || parsedMediaState.error) {
      return;
    }

    const nextItems = parsedMediaState.items.map((item, itemIndex) =>
      itemIndex === index
        ? {
            ...item,
            [key]: value
          }
        : item
    );

    syncMediaItems(nextItems);
  };

  const handleRemoveMediaItem = (index: number) => {
    if (!hasStructuredGallery || parsedMediaState.error) {
      return;
    }

    const nextItems = parsedMediaState.items.filter((_, itemIndex) => itemIndex !== index);
    syncMediaItems(nextItems);
  };

  const handlePromoteLegacyMedia = () => {
    if (legacyMediaItems.length === 0) {
      return;
    }

    syncMediaItems(legacyMediaItems);
    setUploadError(null);
    setUploadSuccess("Текущее изображение переведено в gallery-режим.");
  };

  const handleUploadSelection = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    setUploadError(null);
    setUploadSuccess(null);

    if (parsedMediaState.error) {
      setUploadError("Сначала исправь media_json, потом загружай новые файлы.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      const response = await fetch("/admin/uploads", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json().catch(() => null)) as UploadResponse | null;

      if (!response.ok) {
        throw new Error(payload?.detail ?? "Не удалось загрузить изображения.");
      }

      const uploadedItems = normalizeUploadedFiles(payload);
      if (uploadedItems.length === 0) {
        throw new Error("Сервер не вернул данные загруженных изображений.");
      }

      const baseItems = hasStructuredGallery ? parsedMediaState.items : legacyMediaItems;
      const nextItems = dedupeMediaItems([...baseItems, ...uploadedItems]);
      syncMediaItems(nextItems);
      setUploadSuccess(`Загружено файлов: ${uploadedItems.length}.`);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Не удалось загрузить изображения."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Surface tone="subtle" className="space-y-4 rounded-2xl px-4 py-4">
      <form action={action} method="post" className="grid gap-4 sm:grid-cols-2">
        {returnTo && <input type="hidden" name="return_to" value={returnTo} />}

        <section className="space-y-4 rounded-2xl border border-border/55 bg-card/35 px-4 py-4 sm:col-span-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Основное</p>
            <p className="text-xs text-muted-foreground">
              На первом шаге достаточно заполнить название, цену, краткое описание и загрузить фото.
              `ID` и `Slug` создаются автоматически и доступны в дополнительных настройках.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <FormFieldLabel htmlFor="product-name">Название</FormFieldLabel>
              <Input
                id="product-name"
                name="name"
                value={nameValue}
                onChange={(event) => {
                  setNameValue(event.target.value);
                }}
                required
              />
            </div>

            <div className="space-y-1">
              <FormFieldLabel htmlFor="product-price-amount">Цена</FormFieldLabel>
              <Input
                id="product-price-amount"
                name="price_amount"
                type="number"
                min="0.01"
                step="0.01"
                defaultValue={defaults.priceAmount}
                required
              />
            </div>

            <div className="space-y-1">
              <FormFieldLabel htmlFor="product-price-currency">Валюта</FormFieldLabel>
              <Input
                id="product-price-currency"
                name="price_currency"
                defaultValue={defaults.priceCurrency}
                required
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <FormFieldLabel htmlFor="product-short-description">Короткое описание</FormFieldLabel>
              <Input
                id="product-short-description"
                name="short_description"
                defaultValue={defaults.shortDescription}
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <FormFieldLabel htmlFor="product-description">Описание</FormFieldLabel>
              <textarea
                id="product-description"
                name="description"
                defaultValue={defaults.description}
                rows={4}
                className="w-full rounded-md border border-border/65 bg-input/80 px-3 py-2 text-sm text-foreground shadow-inset outline-none transition-all duration-[var(--motion-fast)] placeholder:text-muted-foreground focus:border-accent/55 focus:ring-2 focus:ring-ring/60"
              />
            </div>

            <label className="inline-flex items-center gap-2 rounded-xl border border-border/45 bg-background/55 px-3 py-2 sm:col-span-2">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={defaults.isActive}
                className="h-4 w-4 rounded border-border/65 bg-input/80"
              />
              <span className="text-sm text-muted-foreground">Товар активен сразу после создания</span>
            </label>
          </div>
        </section>

        <div className="space-y-4 rounded-2xl border border-border/55 bg-card/35 px-4 py-4 sm:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Фотографии товара</p>
              <p className="text-xs text-muted-foreground">
                Загружай изображения кнопкой, а галерея соберется в `media_json` автоматически.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!hasStructuredGallery && legacyMediaItems.length > 0 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handlePromoteLegacyMedia}
                >
                  Перевести в gallery
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                onClick={handleUploadButtonClick}
                disabled={isUploading}
              >
                {isUploading ? "Загрузка..." : "Загрузить фото"}
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
            multiple
            className="hidden"
            onChange={handleUploadSelection}
          />

          {uploadError ? (
            <p className="rounded-xl border border-red-300/50 bg-red-50/70 px-3 py-2 text-sm text-red-700">
              {uploadError}
            </p>
          ) : null}

          {uploadSuccess ? (
            <p className="rounded-xl border border-emerald-300/50 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-700">
              {uploadSuccess}
            </p>
          ) : null}

          {parsedMediaState.error ? (
            <p className="rounded-xl border border-amber-300/50 bg-amber-50/70 px-3 py-2 text-sm text-amber-800">
              {parsedMediaState.error}
            </p>
          ) : null}

          <p className="text-xs text-muted-foreground">
            Поддерживаются PNG, JPG, WEBP, AVIF и GIF до 10 MB на файл.
          </p>

          {effectiveMediaItems.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {effectiveMediaItems.map((item, index) => {
                const canEditCard = hasStructuredGallery && !parsedMediaState.error;

                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="overflow-hidden rounded-[18px] border border-border/55 bg-card/60"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-background/70">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={item.alt}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-3 top-3 rounded-full border border-border/50 bg-card/82 px-2 py-1 text-[11px] text-foreground/80 backdrop-blur">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="space-y-3 px-3 py-3">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">ID изображения</span>
                        <Input
                          value={item.id}
                          onChange={(event) => {
                            handleMediaItemChange(index, "id", event.target.value);
                          }}
                          disabled={!canEditCard}
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">ALT</span>
                        <Input
                          value={item.alt}
                          onChange={(event) => {
                            handleMediaItemChange(index, "alt", event.target.value);
                          }}
                          disabled={!canEditCard}
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">URL</span>
                        <Input
                          value={item.url}
                          onChange={(event) => {
                            handleMediaItemChange(index, "url", event.target.value);
                          }}
                          disabled={!canEditCard}
                        />
                      </div>

                      {canEditCard ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            handleRemoveMediaItem(index);
                          }}
                        >
                          Удалить фото
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[18px] border border-dashed border-border/55 bg-background/35 px-4 py-6 text-sm text-muted-foreground">
              Пока нет загруженных фото. Добавь изображения кнопкой выше или заполни legacy-поля в расширенных настройках.
            </div>
          )}
        </div>

        <details className="rounded-lg border border-border/55 bg-card/35 px-3 py-2 sm:col-span-2">
          <summary className="cursor-pointer text-xs text-muted-foreground">
            Дополнительные настройки
          </summary>
          <div className="mt-3 space-y-3">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Системные поля
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <FormFieldLabel htmlFor="product-id">ID</FormFieldLabel>
                    {!readOnlyId ? (
                      <button
                        type="button"
                        className="text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                        onClick={handleGenerateId}
                      >
                        Сгенерировать
                      </button>
                    ) : null}
                  </div>
                  <Input
                    id="product-id"
                    name="id"
                    value={idValue}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setIdValue(nextValue);
                      setIdManuallyEdited(nextValue.trim().length > 0);
                    }}
                    required
                    readOnly={readOnlyId}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <FormFieldLabel htmlFor="product-slug">Slug</FormFieldLabel>
                    <button
                      type="button"
                      className="text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                      onClick={handleGenerateSlug}
                    >
                      Сгенерировать
                    </button>
                  </div>
                  <Input
                    id="product-slug"
                    name="slug"
                    value={slugValue}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setSlugValue(nextValue);
                      setSlugManuallyEdited(nextValue.trim().length > 0);
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Каталог и продвижение
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <FormFieldLabel htmlFor="product-compare-amount">Compare price</FormFieldLabel>
                  <Input
                    id="product-compare-amount"
                    name="compare_price_amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    defaultValue={defaults.comparePriceAmount}
                  />
                </div>

                <div className="space-y-1">
                  <FormFieldLabel htmlFor="product-compare-currency">Валюта compare</FormFieldLabel>
                  <Input
                    id="product-compare-currency"
                    name="compare_price_currency"
                    defaultValue={defaults.comparePriceCurrency}
                  />
                </div>

                <div className="space-y-1">
                  <FormFieldLabel htmlFor="product-sort-order">Sort order</FormFieldLabel>
                  <Input
                    id="product-sort-order"
                    name="sort_order"
                    type="number"
                    defaultValue={defaults.sortOrder}
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <FormFieldLabel htmlFor="product-tags">Теги (через запятую)</FormFieldLabel>
                  <Input id="product-tags" name="tags" defaultValue={defaults.tags} />
                </div>
              </div>

              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_featured"
                  defaultChecked={defaults.isFeatured}
                  className="h-4 w-4 rounded border-border/65 bg-input/80"
                />
                <span className="text-sm text-muted-foreground">Показывать как featured</span>
              </label>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                JSON и fallback
              </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <FormFieldLabel htmlFor="product-media-id">Legacy media ID</FormFieldLabel>
                <Input
                  id="product-media-id"
                  name="media_id"
                  value={legacyMediaId}
                  onChange={(event) => {
                    setLegacyMediaId(event.target.value);
                  }}
                />
              </div>

              <div className="space-y-1">
                <FormFieldLabel htmlFor="product-media-url">Legacy media URL</FormFieldLabel>
                <Input
                  id="product-media-url"
                  name="media_url"
                  value={legacyMediaUrl}
                  onChange={(event) => {
                    setLegacyMediaUrl(event.target.value);
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <FormFieldLabel htmlFor="product-media-alt">Legacy media ALT</FormFieldLabel>
              <Input
                id="product-media-alt"
                name="media_alt"
                value={legacyMediaAlt}
                onChange={(event) => {
                  setLegacyMediaAlt(event.target.value);
                }}
              />
            </div>

            <div className="space-y-1">
              <FormFieldLabel htmlFor="product-media-json">media_json</FormFieldLabel>
              <textarea
                id="product-media-json"
                name="media_json"
                value={mediaJsonValue}
                onChange={(event) => {
                  setMediaJsonValue(event.target.value);
                  setUploadError(null);
                  setUploadSuccess(null);
                }}
                rows={8}
                className="w-full rounded-md border border-border/65 bg-input/80 px-3 py-2 font-mono text-xs text-foreground shadow-inset outline-none transition-all duration-[var(--motion-fast)] focus:border-accent/55 focus:ring-2 focus:ring-ring/60"
              />
            </div>

            <div className="space-y-1">
              <FormFieldLabel htmlFor="product-badges-json">badges_json</FormFieldLabel>
              <textarea
                id="product-badges-json"
                name="badges_json"
                defaultValue={defaults.badgesJson}
                rows={4}
                className="w-full rounded-md border border-border/65 bg-input/80 px-3 py-2 font-mono text-xs text-foreground shadow-inset outline-none transition-all duration-[var(--motion-fast)] focus:border-accent/55 focus:ring-2 focus:ring-ring/60"
              />
            </div>

            <div className="space-y-1">
              <FormFieldLabel htmlFor="product-color-options-json">color_options_json</FormFieldLabel>
              <textarea
                id="product-color-options-json"
                name="color_options_json"
                defaultValue={defaults.colorOptionsJson}
                rows={6}
                className="w-full rounded-md border border-border/65 bg-input/80 px-3 py-2 font-mono text-xs text-foreground shadow-inset outline-none transition-all duration-[var(--motion-fast)] focus:border-accent/55 focus:ring-2 focus:ring-ring/60"
              />
              <p className="text-[11px] text-muted-foreground">
                Формат: [{`{ id, label, tone, mediaIds: ["media-id-1"] }`}] — mediaIds должны ссылаться на id из media_json.
              </p>
            </div>

            <div className="space-y-1">
              <FormFieldLabel htmlFor="product-metadata-json">metadata_json</FormFieldLabel>
              <textarea
                id="product-metadata-json"
                name="metadata_json"
                defaultValue={defaults.metadataJson}
                rows={4}
                className="w-full rounded-md border border-border/65 bg-input/80 px-3 py-2 font-mono text-xs text-foreground shadow-inset outline-none transition-all duration-[var(--motion-fast)] focus:border-accent/55 focus:ring-2 focus:ring-ring/60"
              />
            </div>
            </div>
          </div>
        </details>

        <div className="sm:col-span-2">
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Surface>
  );
}
