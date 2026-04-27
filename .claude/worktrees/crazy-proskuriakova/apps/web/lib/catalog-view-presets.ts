export type CatalogSort = "recommended" | "price_asc" | "price_desc" | "name_asc" | "name_desc";

export type CatalogPresetKey = "room" | "light" | "texture" | "kits";

export type CatalogViewPreset = {
  key: CatalogPresetKey;
  label: string;
  description: string;
  tags: string[];
  sort: CatalogSort;
};

const catalogViewPresets: Record<CatalogPresetKey, Omit<CatalogViewPreset, "key">> = {
  room: {
    label: "По комнате",
    description: "Подборка для гостиной, спальни, кабинета и детской.",
    tags: ["living-room", "bedroom", "office", "kids"],
    sort: "recommended"
  },
  light: {
    label: "По светопропусканию",
    description: "Sheer, tulle, dimout, blackout и day-night сценарии.",
    tags: ["sheer", "tulle", "dimout", "blackout", "day-night"],
    sort: "recommended"
  },
  texture: {
    label: "По фактуре",
    description: "Лен, жаккард, вельвет и фактурные материалы.",
    tags: ["linen", "jacquard", "velvet"],
    sort: "price_desc"
  },
  kits: {
    label: "Готовые наборы",
    description: "Комплекты для day-night оформления окна.",
    tags: ["set", "day-night"],
    sort: "recommended"
  }
};

function isCatalogPresetKey(value: string): value is CatalogPresetKey {
  return value in catalogViewPresets;
}

export function resolveCatalogViewPreset(
  view: string | null | undefined,
  availableTags: string[]
): CatalogViewPreset | null {
  if (!view || !isCatalogPresetKey(view)) {
    return null;
  }

  const preset = catalogViewPresets[view];
  const availableTagSet = new Set(availableTags);
  const tags = preset.tags.filter((tag) => availableTagSet.has(tag));

  if (tags.length === 0) {
    return null;
  }

  return {
    key: view,
    label: preset.label,
    description: preset.description,
    tags,
    sort: preset.sort
  };
}
