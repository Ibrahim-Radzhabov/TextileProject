import Link from "next/link";
import { ApiError, fetchProductByIdAdmin } from "@/lib/api-client";
import { productToFormDefaults } from "@/lib/admin-products";
import { AdminProductForm } from "../product-form";

export default async function AdminEditProductPage({
  params,
}: {
  params: { productId: string };
}) {
  try {
    const product = await fetchProductByIdAdmin(params.productId);
    const defaults = productToFormDefaults(product);

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
          <h1 className="break-all text-2xl font-semibold tracking-tight sm:text-3xl">
            Редактирование {product.id}
          </h1>
        </header>

        <AdminProductForm
          action={`/admin/products/${encodeURIComponent(product.id)}/update`}
          submitLabel="Сохранить изменения"
          defaults={defaults}
          readOnlyId
          returnTo="/admin/products"
        />
      </div>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <div className="space-y-3 py-8">
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
          <h1 className="text-xl font-semibold tracking-tight">Товар не найден</h1>
          <p className="text-sm text-muted-foreground">Проверьте идентификатор товара.</p>
        </div>
      );
    }
    throw error;
  }
}
