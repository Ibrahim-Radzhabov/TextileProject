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
};

export type ProductBadge = {
  id: string;
  label: string;
  tone: "accent" | "neutral" | "critical";
};

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
  metadata?: Record<string, string | number | boolean>;
};
