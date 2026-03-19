export type Money = {
  currency: string;
  amount: number;
};

export type PriceTier = {
  id: string;
  label: string;
  unitAmount: Money;
};

export type ProductMedia = {
  id: string;
  url: string;
  alt: string;
  thumbnailUrl?: string;
  zoomUrl?: string;
  width?: number;
  height?: number;
};

export type ProductBadge = {
  id: string;
  label: string;
  tone: "accent" | "neutral" | "critical";
};

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type Product = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: Money;
  compareAtPrice?: Money;
  badges?: ProductBadge[];
  tags?: string[];
  media: ProductMedia[];
  isActive?: boolean;
  sortOrder?: number;
  isFeatured?: boolean;
  metadata?: Record<string, JsonValue>;
};
