import Link from "next/link";
import { Badge, Button, Input, Surface } from "@store-platform/ui";
import type { Product } from "@store-platform/shared-types";
import { fetchCatalogProductsAdmin } from "@/lib/api-client";
import { BulkSelectionControls } from "./bulk-selection-controls";

const PAGE_SIZE = 12;

type ProductStateFilter = "all" | "active" | "inactive";
type ProductFeaturedFilter = "all" | "featured" | "regular";
type ProductSort =
  | "sort_order_asc"
  | "sort_order_desc"
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc";

function parseQuery(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim();
  return normalized.length ? normalized.slice(0, 200) : undefined;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

function parseStateFilter(value: string | undefined): ProductStateFilter {
  if (value === "active" || value === "inactive") {
    return value;
  }
  return "all";
}

function parseFeaturedFilter(value: string | undefined): ProductFeaturedFilter {
  if (value === "featured" || value === "regular") {
    return value;
  }
  return "all";
}

function parseSort(value: string | undefined): ProductSort {
  const allowed: ProductSort[] = [
    "sort_order_asc",
    "sort_order_desc",
    "name_asc",
    "name_desc",
    "price_asc",
    "price_desc",
  ];
  if (value && allowed.includes(value as ProductSort)) {
    return value as ProductSort;
  }
  return "sort_order_asc";
}

function buildProductsHref(options?: {
  q?: string;
  state?: ProductStateFilter;
  featured?: ProductFeaturedFilter;
  sort?: ProductSort;
  page?: number;
  actionSuccess?: string;
  actionError?: string;
}): string {
  const params = new URLSearchParams();
  if (options?.q) {
    params.set("q", options.q);
  }
  if (options?.state && options.state !== "all") {
    params.set("state", options.state);
  }
  if (options?.featured && options.featured !== "all") {
    params.set("featured", options.featured);
  }
  if (options?.sort && options.sort !== "sort_order_asc") {
    params.set("sort", options.sort);
  }
  if (options?.page && options.page > 1) {
    params.set("page", String(options.page));
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
    product.id.toLowerCase().includes(q) ||
    product.slug.toLowerCase().includes(q) ||
    product.name.toLowerCase().includes(q) ||
    (product.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
  );
}

function matchesStateFilter(product: Product, state: ProductStateFilter): boolean {
  if (state === "all") {
    return true;
  }
  const isActive = product.isActive !== false;
  if (state === "active") {
    return isActive;
  }
  return !isActive;
}

function matchesFeaturedFilter(product: Product, featured: ProductFeaturedFilter): boolean {
  if (featured === "all") {
    return true;
  }
  const isFeatured = product.isFeatured === true;
  if (featured === "featured") {
    return isFeatured;
  }
  return !isFeatured;
}

function sortProducts(products: Product[], sort: ProductSort): Product[] {
  return [...products].sort((a, b) => {
    if (sort === "name_asc") {
      return a.name.localeCompare(b.name);
    }
    if (sort === "name_desc") {
      return b.name.localeCompare(a.name);
    }
    if (sort === "price_asc") {
      return a.price.amount - b.price.amount;
    }
    if (sort === "price_desc") {
      return b.price.amount - a.price.amount;
    }
    if (sort === "sort_order_desc") {
      return (b.sortOrder ?? 0) - (a.sortOrder ?? 0) || a.name.localeCompare(b.name);
    }
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name);
  });
}

function getStatusBadge(product: Product): { label: string; className: string } {
  if (product.isActive === false) {
    return {
      label: "Inactive",
      className: "border-zinc-400/40 bg-zinc-500/10 text-zinc-300",
    };
  }
  return {
    label: "Active",
    className: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
  };
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    state?: string;
    featured?: string;
    sort?: string;
    page?: string;
    action_success?: string;
    action_error?: string;
  };
}) {
  const query = parseQuery(searchParams?.q);
  const stateFilter = parseStateFilter(searchParams?.state);
  const featuredFilter = parseFeaturedFilter(searchParams?.featured);
  const sort = parseSort(searchParams?.sort);
  const page = parsePositiveInt(searchParams?.page, 1);
  const actionSuccess =
    typeof searchParams?.action_success === "string" && searchParams.action_success.trim().length > 0
      ? searchParams.action_success
      : null;
  const actionError =
    typeof searchParams?.action_error === "string" && searchParams.action_error.trim().length > 0
      ? searchParams.action_error
      : null;

  const products = await fetchCatalogProductsAdmin();
  const filtered = sortProducts(
    products
      .filter((product) => matchesQuery(product, query))
      .filter((product) => matchesStateFilter(product, stateFilter))
      .filter((product) => matchesFeaturedFilter(product, featuredFilter)),
    sort
  );
  const activeCount = products.filter((product) => product.isActive !== false).length;
  const inactiveCount = products.length - activeCount;
  const featuredCount = products.filter((product) => product.isFeatured === true).length;
  const bulkFormId = "bulk-products-form";

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * PAGE_SIZE;
  const paged = filtered.slice(offset, offset + PAGE_SIZE);

  const currentHref = buildProductsHref({
    q: query,
    state: stateFilter,
    featured: featuredFilter,
    sort,
    page: safePage,
  });
  const createHref = `/admin/products/new?return_to=${encodeURIComponent(currentHref)}`;

  return (
    <div className="space-y-6 pb-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Товары</h1>
            <Badge tone="muted">{total}</Badge>
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

      <Surface tone="subtle" className="space-y-3 rounded-2xl px-4 py-4">
        <form method="get" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs text-muted-foreground">Поиск (id / slug / name / tags)</span>
            <Input name="q" type="search" defaultValue={query} placeholder="Например, p1" />
          </label>

          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Статус</span>
            <select
              name="state"
              defaultValue={stateFilter}
              className="h-10 w-full rounded-md border border-border/65 bg-input/80 px-3 text-sm text-foreground shadow-inset outline-none transition-all duration-[var(--motion-fast)] focus:border-accent/55 focus:ring-2 focus:ring-ring/60"
            >
              <option value="all">Все</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Featured</span>
            <select
              name="featured"
              defaultValue={featuredFilter}
              className="h-10 w-full rounded-md border border-border/65 bg-input/80 px-3 text-sm text-foreground shadow-inset outline-none transition-all duration-[var(--motion-fast)] focus:border-accent/55 focus:ring-2 focus:ring-ring/60"
            >
              <option value="all">Все</option>
              <option value="featured">Только featured</option>
              <option value="regular">Без featured</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Сортировка</span>
            <select
              name="sort"
              defaultValue={sort}
              className="h-10 w-full rounded-md border border-border/65 bg-input/80 px-3 text-sm text-foreground shadow-inset outline-none transition-all duration-[var(--motion-fast)] focus:border-accent/55 focus:ring-2 focus:ring-ring/60"
            >
              <option value="sort_order_asc">Sort order (возр.)</option>
              <option value="sort_order_desc">Sort order (убыв.)</option>
              <option value="name_asc">Название A-Z</option>
              <option value="name_desc">Название Z-A</option>
              <option value="price_asc">Цена по возр.</option>
              <option value="price_desc">Цена по убыв.</option>
            </select>
          </label>

          <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-5">
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
              <Link href={createHref}>Добавить товар</Link>
            </Button>
          </div>
        </form>
      </Surface>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Surface tone="subtle" className="rounded-xl px-4 py-3">
          <p className="text-xs text-muted-foreground">Всего</p>
          <p className="mt-1 text-lg font-semibold">{products.length}</p>
        </Surface>
        <Surface tone="subtle" className="rounded-xl px-4 py-3">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="mt-1 text-lg font-semibold text-emerald-300">{activeCount}</p>
        </Surface>
        <Surface tone="subtle" className="rounded-xl px-4 py-3">
          <p className="text-xs text-muted-foreground">Inactive</p>
          <p className="mt-1 text-lg font-semibold text-zinc-300">{inactiveCount}</p>
        </Surface>
        <Surface tone="subtle" className="rounded-xl px-4 py-3">
          <p className="text-xs text-muted-foreground">Featured</p>
          <p className="mt-1 text-lg font-semibold">{featuredCount}</p>
        </Surface>
      </div>

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

      <form
        id={bulkFormId}
        action="/admin/products/bulk"
        method="post"
        className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/60 bg-card/35 px-4 py-3"
      >
        <input type="hidden" name="return_to" value={currentHref} />
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Выберите товары в таблице и примените массовое действие.
          </p>
          <BulkSelectionControls formId={bulkFormId} pageItemsCount={paged.length} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            name="bulk_action"
            value="activate"
            className="inline-flex h-8 items-center justify-center rounded-md border border-emerald-400/35 px-2.5 text-xs text-emerald-300 transition-colors hover:border-emerald-400/60 hover:bg-emerald-500/10"
          >
            Активировать выбранные
          </button>
          <button
            type="submit"
            name="bulk_action"
            value="deactivate"
            className="inline-flex h-8 items-center justify-center rounded-md border border-zinc-400/35 px-2.5 text-xs text-zinc-300 transition-colors hover:border-zinc-300/70 hover:bg-zinc-500/10"
          >
            Деактивировать выбранные
          </button>
          <button
            type="submit"
            name="bulk_action"
            value="sort_up"
            className="inline-flex h-8 items-center justify-center rounded-md border border-border/60 px-2.5 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
          >
            Sort -10
          </button>
          <button
            type="submit"
            name="bulk_action"
            value="sort_down"
            className="inline-flex h-8 items-center justify-center rounded-md border border-border/60 px-2.5 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
          >
            Sort +10
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
        <table className="w-full min-w-[1100px] table-fixed border-collapse text-left text-sm">
          <thead className="bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Название</th>
              <th className="px-4 py-3">Цена</th>
              <th className="px-4 py-3">Sort</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((product) => {
              const status = getStatusBadge(product);
              return (
                <tr key={product.id} className="border-t border-border/50">
                  <td className="px-4 py-3">
                    <input
                      form={bulkFormId}
                      type="checkbox"
                      name="product_ids"
                      value={product.id}
                      aria-label={`Выбрать ${product.id}`}
                      className="h-4 w-4 rounded border-border/65 bg-input/80"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{product.id}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{product.slug}</td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {product.price.amount.toLocaleString(undefined, {
                      style: "currency",
                      currency: product.price.currency,
                    })}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{product.sortOrder ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={["rounded-full border px-2 py-0.5 text-[11px]", status.className].join(" ")}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{product.isFeatured ? "Да" : "Нет"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${encodeURIComponent(product.id)}?return_to=${encodeURIComponent(currentHref)}`}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-border/60 px-2.5 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
                      >
                        Редактировать
                      </Link>
                      <form action={`/admin/products/${encodeURIComponent(product.id)}/delete`} method="post">
                        <input type="hidden" name="return_to" value={currentHref} />
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
              );
            })}
            {paged.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={9}>
                  Товары не найдены.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            Показано {offset + 1}-{Math.min(offset + PAGE_SIZE, total)} из {total}
          </p>
          <div className="flex items-center gap-2">
            {safePage > 1 ? (
              <Link
                href={buildProductsHref({
                  q: query,
                  state: stateFilter,
                  featured: featuredFilter,
                  sort,
                  page: safePage - 1,
                })}
                className="inline-flex h-8 items-center justify-center rounded-md border border-border/60 px-2.5 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
              >
                Назад
              </Link>
            ) : (
              <span className="inline-flex h-8 items-center justify-center rounded-md border border-border/40 px-2.5 text-xs opacity-50">
                Назад
              </span>
            )}
            <span>
              Страница {safePage} / {totalPages}
            </span>
            {safePage < totalPages ? (
              <Link
                href={buildProductsHref({
                  q: query,
                  state: stateFilter,
                  featured: featuredFilter,
                  sort,
                  page: safePage + 1,
                })}
                className="inline-flex h-8 items-center justify-center rounded-md border border-border/60 px-2.5 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
              >
                Далее
              </Link>
            ) : (
              <span className="inline-flex h-8 items-center justify-center rounded-md border border-border/40 px-2.5 text-xs opacity-50">
                Далее
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
