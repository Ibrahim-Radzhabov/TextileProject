import Link from "next/link";
import { Badge, Button, Input, Surface } from "@store-platform/ui";
import type { Product } from "@store-platform/shared-types";
import { fetchCatalogProductsAdmin } from "@/lib/api-client";

function parseQuery(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim();
  return normalized.length ? normalized.slice(0, 200) : undefined;
}

function buildProductsHref(options?: {
  q?: string;
  actionSuccess?: string;
  actionError?: string;
}): string {
  const params = new URLSearchParams();
  if (options?.q) {
    params.set("q", options.q);
  }
  if (options?.actionSuccess) {
    params.set("action_success", options.actionSuccess);
  }
  if (options?.actionError) {
    params.set("action_error", options.actionError);
  }
  const query = params.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
}

function matchesQuery(product: Product, query?: string): boolean {
  if (!query) {
    return true;
  }
  const q = query.toLowerCase();
  return (
    product.id.toLowerCase().includes(q)
    || product.slug.toLowerCase().includes(q)
    || product.name.toLowerCase().includes(q)
    || (product.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
  );
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    action_success?: string;
    action_error?: string;
  };
}) {
  const query = parseQuery(searchParams?.q);
  const actionSuccess =
    typeof searchParams?.action_success === "string" && searchParams.action_success.trim().length > 0
      ? searchParams.action_success
      : null;
  const actionError =
    typeof searchParams?.action_error === "string" && searchParams.action_error.trim().length > 0
      ? searchParams.action_error
      : null;

  const products = await fetchCatalogProductsAdmin();
  const filtered = products.filter((product) => matchesQuery(product, query));
  const returnTo = buildProductsHref({ q: query });

  return (
    <div className="space-y-6 pb-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Товары</h1>
            <Badge tone="muted">{filtered.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/orders"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border/60 px-3 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
            >
              Заказы
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
        </div>
        <p className="text-sm text-muted-foreground">Управление каталогом активного tenant.</p>
      </header>

      <Surface tone="subtle" className="rounded-2xl px-4 py-4">
        <form method="get" className="flex flex-wrap items-end gap-2">
          <label className="flex-1 space-y-1">
            <span className="text-xs text-muted-foreground">Поиск (id / slug / name / tags)</span>
            <Input name="q" type="search" defaultValue={query} placeholder="Например, p1" />
          </label>
          <Button type="submit" variant="secondary" size="sm">
            Применить
          </Button>
          <Link
            href="/admin/products"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border/60 px-3 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
          >
            Сбросить
          </Link>
          <Button asChild size="sm">
            <Link href="/admin/products/new">Добавить товар</Link>
          </Button>
        </form>
      </Surface>

      {actionSuccess && (
        <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {actionError}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
        <table className="w-full min-w-[980px] table-fixed border-collapse text-left text-sm">
          <thead className="bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Название</th>
              <th className="px-4 py-3">Цена</th>
              <th className="px-4 py-3">Теги</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-t border-border/50">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{product.id}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{product.slug}</td>
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {product.price.amount.toLocaleString(undefined, {
                    style: "currency",
                    currency: product.price.currency,
                  })}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{product.tags?.join(", ") || "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{product.isFeatured ? "Да" : "Нет"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${encodeURIComponent(product.id)}`}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-border/60 px-2.5 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
                    >
                      Редактировать
                    </Link>
                    <form action={`/admin/products/${encodeURIComponent(product.id)}/delete`} method="post">
                      <input type="hidden" name="return_to" value={returnTo} />
                      <button
                        type="submit"
                        className="inline-flex h-8 items-center justify-center rounded-md border border-red-400/30 px-2.5 text-xs text-red-300 transition-colors hover:border-red-400/60 hover:bg-red-500/10"
                      >
                        Удалить
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={7}>
                  Товары не найдены.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
