import Link from "next/link";
import {
  fetchPwaInstallEvents,
  type PwaInstallEvent,
  type SortOrder
} from "@/lib/api-client";
import type { PwaInstallMetric } from "@store-platform/shared-types";

const PAGE_SIZE = 30;

const funnelMetrics: PwaInstallMetric[] = [
  "prompt_available",
  "prompt_opened",
  "prompt_accepted",
  "installed"
];

const metricLabels: Record<PwaInstallMetric, string> = {
  prompt_available: "Prompt доступен",
  ios_hint_shown: "iOS hint",
  prompt_opened: "Prompt открыт",
  installed: "Установлено",
  prompt_accepted: "Принято",
  prompt_dismissed: "Отклонено",
  banner_dismissed: "Баннер закрыт"
};

const sortFilters: Array<{ label: string; value: SortOrder }> = [
  { label: "Новые сверху", value: "newest" },
  { label: "Старые сверху", value: "oldest" }
];

function parseMetric(value: string | undefined): PwaInstallMetric | undefined {
  if (!value) {
    return undefined;
  }
  const allowed: PwaInstallMetric[] = [
    "prompt_available",
    "ios_hint_shown",
    "prompt_opened",
    "installed",
    "prompt_accepted",
    "prompt_dismissed",
    "banner_dismissed"
  ];
  return allowed.includes(value as PwaInstallMetric) ? (value as PwaInstallMetric) : undefined;
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

function parsePathPrefix(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim();
  if (!normalized.length) {
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

function buildAnalyticsHref(options: {
  metric?: PwaInstallMetric;
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
  return query ? `/admin/analytics/pwa?${query}` : "/admin/analytics/pwa";
}

function formatPercent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }
  return `${value.toFixed(1)}%`;
}

function ratio(part: number, total: number): number | null {
  if (total <= 0) {
    return null;
  }
  return (part / total) * 100;
}

function getMetricBadge(metric: PwaInstallMetric): string {
  if (metric === "installed" || metric === "prompt_accepted") {
    return "border-emerald-400/40 bg-emerald-500/10 text-emerald-300";
  }
  if (metric === "prompt_dismissed" || metric === "banner_dismissed") {
    return "border-rose-400/40 bg-rose-500/10 text-rose-300";
  }
  if (metric === "ios_hint_shown") {
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

function renderEventRow(item: PwaInstallEvent) {
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
      <td className="max-w-[380px] truncate px-3 py-2 text-xs text-foreground">{item.path}</td>
      <td className="px-3 py-2 text-xs text-muted-foreground">{item.source}</td>
      <td className="max-w-[340px] truncate px-3 py-2 text-[11px] text-muted-foreground">
        {item.userAgent ?? "—"}
      </td>
    </tr>
  );
}

export default async function AdminPwaAnalyticsPage({
  searchParams
}: {
  searchParams?: {
    metric?: string;
    path_prefix?: string;
    date_from?: string;
    date_to?: string;
    sort?: string;
    offset?: string;
  };
}) {
  const metric = parseMetric(searchParams?.metric);
  const pathPrefix = parsePathPrefix(searchParams?.path_prefix);
  const dateFrom = parseDateParam(searchParams?.date_from);
  const dateTo = parseDateParam(searchParams?.date_to);
  const sort = parseSortOrder(searchParams?.sort);
  const offset = toPositiveInt(searchParams?.offset, 0);
  const hasInvalidDateRange = Boolean(dateFrom && dateTo && dateFrom > dateTo);
  const effectiveDateFrom = hasInvalidDateRange ? undefined : dateFrom;
  const effectiveDateTo = hasInvalidDateRange ? undefined : dateTo;

  const currentHref = buildAnalyticsHref({
    metric,
    pathPrefix,
    dateFrom,
    dateTo,
    sort,
    offset
  });

  const [eventsResponse, ...funnelResponses] = await Promise.all([
    fetchPwaInstallEvents({
      metric,
      pathPrefix,
      dateFrom: effectiveDateFrom,
      dateTo: effectiveDateTo,
      sort,
      limit: PAGE_SIZE,
      offset
    }),
    ...funnelMetrics.map((funnelMetric) =>
      fetchPwaInstallEvents({
        metric: funnelMetric,
        pathPrefix,
        dateFrom: effectiveDateFrom,
        dateTo: effectiveDateTo,
        limit: 1,
        offset: 0
      })
    )
  ]);

  const funnelTotals = funnelMetrics.reduce<Record<PwaInstallMetric, number>>(
    (acc, key, index) => {
      acc[key] = funnelResponses[index]?.total ?? 0;
      return acc;
    },
    {
      prompt_available: 0,
      prompt_opened: 0,
      prompt_accepted: 0,
      installed: 0,
      ios_hint_shown: 0,
      prompt_dismissed: 0,
      banner_dismissed: 0
    }
  );

  const promptAvailable = funnelTotals.prompt_available;
  const promptOpened = funnelTotals.prompt_opened;
  const promptAccepted = funnelTotals.prompt_accepted;
  const installed = funnelTotals.installed;

  const hasPrev = eventsResponse.offset > 0;
  const nextOffset = eventsResponse.offset + eventsResponse.limit;
  const hasNext = nextOffset < eventsResponse.total;

  return (
    <div className="space-y-6 pb-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">PWA Analytics</h1>
          <div className="flex items-center gap-2">
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
          Воронка установки PWA: available → opened → accepted → installed.
        </p>
      </header>

      <form
        method="get"
        className="glass-panel grid gap-3 rounded-2xl border border-border/60 px-4 py-4 sm:grid-cols-5"
      >
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Metric</span>
          <select
            name="metric"
            defaultValue={metric ?? ""}
            className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
          >
            <option value="">Все</option>
            {Object.entries(metricLabels).map(([metricKey, label]) => (
              <option key={metricKey} value={metricKey}>
                {metricKey} — {label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 sm:col-span-2">
          <span className="text-xs text-muted-foreground">Path prefix</span>
          <input
            type="search"
            name="path_prefix"
            defaultValue={pathPrefix}
            placeholder="/catalog"
            className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">С даты</span>
          <input
            type="date"
            name="date_from"
            defaultValue={dateFrom}
            className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">По дату</span>
          <input
            type="date"
            name="date_to"
            defaultValue={dateTo}
            className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
          />
        </label>

        <label className="space-y-1 sm:col-span-2">
          <span className="text-xs text-muted-foreground">Сортировка</span>
          <select
            name="sort"
            defaultValue={sort}
            className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
          >
            {sortFilters.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <div className="sm:col-span-3 flex flex-wrap items-end gap-2">
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border/60 px-3 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
          >
            Применить
          </button>
          <Link
            href="/admin/analytics/pwa"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border/60 px-3 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
          >
            Сбросить
          </Link>
        </div>
      </form>

      {hasInvalidDateRange && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Диапазон дат некорректен: "С даты" позже "По дату". Фильтр даты не применён.
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-border/60 bg-surface-strong px-4 py-3">
          <p className="text-xs text-muted-foreground">prompt_available</p>
          <p className="mt-1 text-2xl font-semibold">{promptAvailable}</p>
        </article>
        <article className="rounded-2xl border border-border/60 bg-surface-strong px-4 py-3">
          <p className="text-xs text-muted-foreground">prompt_opened</p>
          <p className="mt-1 text-2xl font-semibold">{promptOpened}</p>
          <p className="text-xs text-muted-foreground">
            Конверсия: {formatPercent(ratio(promptOpened, promptAvailable))}
          </p>
        </article>
        <article className="rounded-2xl border border-border/60 bg-surface-strong px-4 py-3">
          <p className="text-xs text-muted-foreground">prompt_accepted</p>
          <p className="mt-1 text-2xl font-semibold">{promptAccepted}</p>
          <p className="text-xs text-muted-foreground">
            Конверсия: {formatPercent(ratio(promptAccepted, promptOpened))}
          </p>
        </article>
        <article className="rounded-2xl border border-border/60 bg-surface-strong px-4 py-3">
          <p className="text-xs text-muted-foreground">installed</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-300">{installed}</p>
          <p className="text-xs text-muted-foreground">
            Итого: {formatPercent(ratio(installed, promptAvailable))}
          </p>
        </article>
      </section>

      <section className="space-y-2">
        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-surface-soft">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border/60 text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Время</th>
                <th className="px-3 py-2 font-medium">Metric</th>
                <th className="px-3 py-2 font-medium">Path</th>
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 font-medium">User-Agent</th>
              </tr>
            </thead>
            <tbody>
              {eventsResponse.items.map((item) => renderEventRow(item))}
              {eventsResponse.items.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={5}>
                    События не найдены.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Показано {eventsResponse.items.length} из {eventsResponse.total}
          </span>
          <div className="flex items-center gap-2">
            {hasPrev ? (
              <Link
                href={buildAnalyticsHref({
                  metric,
                  pathPrefix,
                  dateFrom,
                  dateTo,
                  sort,
                  offset: Math.max(0, offset - PAGE_SIZE)
                })}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-border/60 px-2 transition-colors hover:border-accent/50 hover:text-foreground"
              >
                Назад
              </Link>
            ) : (
              <span className="inline-flex h-8 items-center justify-center rounded-lg border border-border/40 px-2 opacity-45">
                Назад
              </span>
            )}
            {hasNext ? (
              <Link
                href={buildAnalyticsHref({
                  metric,
                  pathPrefix,
                  dateFrom,
                  dateTo,
                  sort,
                  offset: nextOffset
                })}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-border/60 px-2 transition-colors hover:border-accent/50 hover:text-foreground"
              >
                Дальше
              </Link>
            ) : (
              <span className="inline-flex h-8 items-center justify-center rounded-lg border border-border/40 px-2 opacity-45">
                Дальше
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="rounded-xl border border-border/50 bg-surface-soft px-3 py-2 text-xs text-muted-foreground">
        Перmalink фильтра:{" "}
        <span className="font-mono text-[11px] text-foreground">{currentHref}</span>
      </div>
    </div>
  );
}
