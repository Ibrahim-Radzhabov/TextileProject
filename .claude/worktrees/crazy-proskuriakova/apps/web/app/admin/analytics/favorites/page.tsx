import Link from "next/link";
import {
  fetchFavoritesEvents,
  type FavoritesEvent,
  type FavoritesMetric,
  type SortOrder
} from "@/lib/api-client";

const PAGE_SIZE = 30;

const metricOptions: Array<{ label: string; value: FavoritesMetric }> = [
  { label: "Открытие избранного", value: "favorites_opened" },
  { label: "Добавление", value: "favorite_added" },
  { label: "Удаление", value: "favorite_removed" },
  { label: "Очистка списка", value: "favorites_cleared" },
  { label: "Sync pull", value: "favorites_synced_pull" },
  { label: "Sync push", value: "favorites_synced_push" }
];

const sortFilters: Array<{ label: string; value: SortOrder }> = [
  { label: "Новые сверху", value: "newest" },
  { label: "Старые сверху", value: "oldest" }
];

const datePresets: Array<{ label: string; daysBack: number }> = [
  { label: "Сегодня", daysBack: 0 },
  { label: "7 дней", daysBack: 6 },
  { label: "30 дней", daysBack: 29 }
];

function parseMetric(value: string | undefined): FavoritesMetric | undefined {
  if (!value) {
    return undefined;
  }
  const allowed: FavoritesMetric[] = [
    "favorites_opened",
    "favorite_added",
    "favorite_removed",
    "favorites_cleared",
    "favorites_synced_pull",
    "favorites_synced_push"
  ];
  return allowed.includes(value as FavoritesMetric) ? (value as FavoritesMetric) : undefined;
}

function parseSortOrder(value: string | undefined): SortOrder {
  return value === "oldest" ? "oldest" : "newest";
}

function parseDateParam(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed.toISOString().slice(0, 10) === value ? value : undefined;
}

function parseSyncId(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }
  return normalized.slice(0, 120);
}

function parsePathPrefix(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }
  return normalized.slice(0, 200);
}

function toPositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function buildPresetRange(daysBack: number): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - daysBack);
  return {
    dateFrom: toIsoDate(start),
    dateTo: toIsoDate(end)
  };
}

function buildFavoritesAnalyticsHref(options: {
  metric?: FavoritesMetric;
  syncId?: string;
  pathPrefix?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: SortOrder;
  offset?: number;
}): string {
  const params = new URLSearchParams();
  if (options.metric) {
    params.set("metric", options.metric);
  }
  if (options.syncId) {
    params.set("sync_id", options.syncId);
  }
  if (options.pathPrefix) {
    params.set("path_prefix", options.pathPrefix);
  }
  if (options.dateFrom) {
    params.set("date_from", options.dateFrom);
  }
  if (options.dateTo) {
    params.set("date_to", options.dateTo);
  }
  if (options.sort && options.sort !== "newest") {
    params.set("sort", options.sort);
  }
  if (options.offset !== undefined && options.offset > 0) {
    params.set("offset", String(options.offset));
  }
  const query = params.toString();
  return query ? `/admin/analytics/favorites?${query}` : "/admin/analytics/favorites";
}

function buildFavoritesExportHref(options: {
  metric?: FavoritesMetric;
  syncId?: string;
  pathPrefix?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: SortOrder;
}): string {
  const params = new URLSearchParams();
  if (options.metric) {
    params.set("metric", options.metric);
  }
  if (options.syncId) {
    params.set("sync_id", options.syncId);
  }
  if (options.pathPrefix) {
    params.set("path_prefix", options.pathPrefix);
  }
  if (options.dateFrom) {
    params.set("date_from", options.dateFrom);
  }
  if (options.dateTo) {
    params.set("date_to", options.dateTo);
  }
  if (options.sort && options.sort !== "newest") {
    params.set("sort", options.sort);
  }
  const query = params.toString();
  return query ? `/admin/analytics/favorites/export?${query}` : "/admin/analytics/favorites/export";
}

function getMetricBadge(metric: FavoritesMetric): string {
  if (metric === "favorite_added" || metric === "favorites_synced_push") {
    return "border-emerald-400/40 bg-emerald-500/10 text-emerald-300";
  }
  if (metric === "favorite_removed" || metric === "favorites_cleared") {
    return "border-rose-400/40 bg-rose-500/10 text-rose-300";
  }
  if (metric === "favorites_synced_pull") {
    return "border-sky-400/40 bg-sky-500/10 text-sky-300";
  }
  return "border-amber-400/40 bg-amber-500/10 text-amber-300";
}

function formatEventTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function renderEventRow(item: FavoritesEvent) {
  return (
    <tr key={item.id} className="border-b border-border/45 last:border-b-0">
      <td className="px-3 py-2 text-xs text-muted-foreground">{formatEventTime(item.eventTimestamp)}</td>
      <td className="px-3 py-2">
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${getMetricBadge(item.metric)}`}
        >
          {item.metric}
        </span>
      </td>
      <td className="max-w-[240px] truncate px-3 py-2 text-xs text-foreground">{item.syncId}</td>
      <td className="max-w-[260px] truncate px-3 py-2 text-xs text-muted-foreground">{item.path}</td>
      <td className="max-w-[200px] truncate px-3 py-2 text-xs text-muted-foreground">{item.productId ?? "—"}</td>
      <td className="px-3 py-2 text-xs text-muted-foreground">{item.source}</td>
    </tr>
  );
}

export default async function AdminFavoritesAnalyticsPage({
  searchParams
}: {
  searchParams?: {
    metric?: string;
    sync_id?: string;
    path_prefix?: string;
    date_from?: string;
    date_to?: string;
    sort?: string;
    offset?: string;
  };
}) {
  const metric = parseMetric(searchParams?.metric);
  const syncId = parseSyncId(searchParams?.sync_id);
  const pathPrefix = parsePathPrefix(searchParams?.path_prefix);
  const dateFrom = parseDateParam(searchParams?.date_from);
  const dateTo = parseDateParam(searchParams?.date_to);
  const sort = parseSortOrder(searchParams?.sort);
  const offset = toPositiveInt(searchParams?.offset, 0);
  const hasInvalidDateRange = Boolean(dateFrom && dateTo && dateFrom > dateTo);
  const effectiveDateFrom = hasInvalidDateRange ? undefined : dateFrom;
  const effectiveDateTo = hasInvalidDateRange ? undefined : dateTo;

  const currentHref = buildFavoritesAnalyticsHref({
    metric,
    syncId,
    pathPrefix,
    dateFrom,
    dateTo,
    sort,
    offset
  });
  const exportHref = buildFavoritesExportHref({
    metric,
    syncId,
    pathPrefix,
    dateFrom: effectiveDateFrom,
    dateTo: effectiveDateTo,
    sort
  });
  const quickDateRanges = datePresets.map((preset) => ({
    ...preset,
    ...buildPresetRange(preset.daysBack)
  }));

  const eventsResponse = await fetchFavoritesEvents({
    metric,
    syncId,
    pathPrefix,
    dateFrom: effectiveDateFrom,
    dateTo: effectiveDateTo,
    sort,
    limit: PAGE_SIZE,
    offset
  });

  const hasPrev = offset > 0;
  const hasNext = offset + eventsResponse.items.length < eventsResponse.total;
  const prevOffset = Math.max(0, offset - PAGE_SIZE);
  const nextOffset = offset + PAGE_SIZE;
  const uniqueSyncIds = new Set(eventsResponse.items.map((item) => item.syncId));

  return (
    <div className="space-y-6 pb-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Favorites Analytics</h1>
            <span className="inline-flex rounded-full border border-border/60 bg-card/65 px-2 py-0.5 text-xs text-muted-foreground">
              {eventsResponse.total}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/analytics/pwa"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border/60 px-3 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
            >
              PWA
            </Link>
            <Link
              href="/admin/orders"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border/60 px-3 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
            >
              Заказы
            </Link>
            <Link
              href="/admin/products"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border/60 px-3 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
            >
              Товары
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
        <p className="text-sm text-muted-foreground">
          Read-only аналитика действий по избранному с фильтрами и CSV экспортом.
        </p>
      </header>

      <section className="rounded-xl border border-border/45 bg-card/72 p-4">
        <form method="get" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-1">
            <span className="ui-kicker">Metric</span>
            <select
              name="metric"
              defaultValue={metric ?? ""}
              className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
            >
              <option value="">Все</option>
              {metricOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="ui-kicker">Sync ID</span>
            <input
              name="sync_id"
              defaultValue={syncId ?? ""}
              placeholder="anon-..."
              className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
            />
          </label>

          <label className="space-y-1">
            <span className="ui-kicker">Path prefix</span>
            <input
              name="path_prefix"
              defaultValue={pathPrefix ?? ""}
              placeholder="/catalog"
              className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
            />
          </label>

          <label className="space-y-1">
            <span className="ui-kicker">С даты</span>
            <input
              type="date"
              name="date_from"
              defaultValue={dateFrom ?? ""}
              className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
            />
          </label>

          <label className="space-y-1">
            <span className="ui-kicker">По дату</span>
            <input
              type="date"
              name="date_to"
              defaultValue={dateTo ?? ""}
              className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
            />
          </label>

          <label className="space-y-1">
            <span className="ui-kicker">Сортировка</span>
            <select
              name="sort"
              defaultValue={sort}
              className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
            >
              {sortFilters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <input type="hidden" name="offset" value="0" />
          <div className="flex items-center gap-2 md:col-span-2 xl:col-span-3">
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-accent/60 bg-accent px-4 text-xs font-medium text-white transition-colors hover:bg-accent/90"
            >
              Применить
            </button>
            <Link
              href="/admin/analytics/favorites"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border/60 px-4 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
            >
              Сбросить
            </Link>
            <a
              href={exportHref}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border/60 px-4 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
            >
              CSV экспорт
            </a>
          </div>
        </form>

        {hasInvalidDateRange && (
          <p className="mt-3 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            Период задан некорректно: дата начала позже даты конца.
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {quickDateRanges.map((preset) => (
            <Link
              key={preset.label}
              href={buildFavoritesAnalyticsHref({
                metric,
                syncId,
                pathPrefix,
                dateFrom: preset.dateFrom,
                dateTo: preset.dateTo,
                sort,
                offset: 0
              })}
              className="rounded-lg border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
            >
              {preset.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-border/45 bg-card/72 px-3 py-3">
          <p className="ui-kicker">Всего событий</p>
          <p className="mt-1 text-xl font-semibold">{eventsResponse.total}</p>
        </article>
        <article className="rounded-xl border border-border/45 bg-card/72 px-3 py-3">
          <p className="ui-kicker">Sync IDs (страница)</p>
          <p className="mt-1 text-xl font-semibold">{uniqueSyncIds.size}</p>
        </article>
        <article className="rounded-xl border border-border/45 bg-card/72 px-3 py-3">
          <p className="ui-kicker">Текущий offset</p>
          <p className="mt-1 text-xl font-semibold">{offset}</p>
        </article>
      </section>

      <section className="overflow-hidden rounded-xl border border-border/45 bg-card/72">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] text-left">
            <thead className="border-b border-border/45 bg-card/82 text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Время</th>
                <th className="px-3 py-2">Metric</th>
                <th className="px-3 py-2">Sync ID</th>
                <th className="px-3 py-2">Path</th>
                <th className="px-3 py-2">Product ID</th>
                <th className="px-3 py-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {eventsResponse.items.length > 0 ? (
                eventsResponse.items.map(renderEventRow)
              ) : (
                <tr>
                  <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={6}>
                    События не найдены для текущих фильтров.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {offset + 1}-{Math.min(offset + PAGE_SIZE, eventsResponse.total)} из {eventsResponse.total}
        </span>
        <div className="flex items-center gap-2">
          {hasPrev ? (
            <Link
              href={buildFavoritesAnalyticsHref({
                metric,
                syncId,
                pathPrefix,
                dateFrom,
                dateTo,
                sort,
                offset: prevOffset
              })}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-border/60 px-3 transition-colors hover:border-accent/50 hover:text-foreground"
            >
              Назад
            </Link>
          ) : (
            <span className="inline-flex h-8 items-center justify-center rounded-lg border border-border/45 px-3 opacity-50">
              Назад
            </span>
          )}
          {hasNext ? (
            <Link
              href={buildFavoritesAnalyticsHref({
                metric,
                syncId,
                pathPrefix,
                dateFrom,
                dateTo,
                sort,
                offset: nextOffset
              })}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-border/60 px-3 transition-colors hover:border-accent/50 hover:text-foreground"
            >
              Далее
            </Link>
          ) : (
            <span className="inline-flex h-8 items-center justify-center rounded-lg border border-border/45 px-3 opacity-50">
              Далее
            </span>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border/45 bg-card/62 px-3 py-3 text-xs text-muted-foreground">
        <p className="break-all">
          Текущее состояние: <span className="text-foreground">{currentHref}</span>
        </p>
      </section>
    </div>
  );
}
