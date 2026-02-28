import Link from "next/link";
import { AdminProductForm, type AdminProductFormDefaults } from "../product-form";

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
  tags: "",
  isFeatured: false,
  mediaId: "",
  mediaUrl: "",
  mediaAlt: "",
  mediaJson: "",
  badgesJson: "",
  metadataJson: "",
};

export default function AdminNewProductPage() {
  return (
    <div className="space-y-6 pb-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/admin/products"
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

      <AdminProductForm action="/admin/products/create" submitLabel="Создать товар" defaults={emptyProductDefaults} />
    </div>
  );
}
