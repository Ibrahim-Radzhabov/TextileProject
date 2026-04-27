import Link from "next/link";
import { fetchCatalogProductsAdmin } from "@/lib/api-client";
import {
  AdminProductForm,
  type AdminProductFormDefaults,
  type ExistingAdminProductIdentity
} from "../product-form";

const emptyProductDefaults: AdminProductFormDefaults = {
  id: "",
  slug: "",
  name: "",
  description: "",
  shortDescription: "",
  priceAmount: "",
  priceCurrency: "USD",
  comparePriceAmount: "",
  comparePriceCurrency: "",
  sortOrder: "0",
  tags: "",
  isActive: true,
  isFeatured: false,
  mediaId: "",
  mediaUrl: "",
  mediaAlt: "",
  mediaJson: "",
  badgesJson: "",
  metadataJson: "",
  colorOptionsJson: "",
};

function resolveReturnTo(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim();
  if (!normalized.startsWith("/admin/products")) {
    return undefined;
  }
  return normalized;
}

async function fetchExistingProducts(): Promise<ExistingAdminProductIdentity[]> {
  try {
    const products = await fetchCatalogProductsAdmin();
    return products.map((product) => ({
      id: product.id,
      slug: product.slug
    }));
  } catch {
    return [];
  }
}

export default async function AdminNewProductPage({
  searchParams,
}: {
  searchParams?: {
    return_to?: string;
  };
}) {
  const returnTo = resolveReturnTo(searchParams?.return_to) ?? "/admin/products";
  const existingProducts = await fetchExistingProducts();

  return (
    <div className="space-y-6 pb-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href={returnTo}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            ← К списку товаров
          </Link>
          <form action="/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
            >
              Выйти
            </button>
          </form>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Новый товар</h1>
      </header>

      <AdminProductForm
        action="/admin/products/create"
        submitLabel="Создать товар"
        defaults={emptyProductDefaults}
        returnTo={returnTo}
        existingProducts={existingProducts}
      />
    </div>
  );
}
