import Link from "next/link";
import {
  fetchPwaInstallDailySummary,
  fetchPwaInstallEvents,
  type PwaInstallDailySummaryEntry,
  type PwaInstallEvent,
  type SortOrder
} from "@/lib/api-client";
import type { PwaInstallMetric } from "@store-platform/shared-types";

const PAGE_SIZE = 30;
const CHART_WIDTH = 720;
const CHART_HEIGHT = 220;
const CHART_PADDING_X = 26;
const CHART_PADDING_Y = 22;

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

const datePresets: Array<{ label: string; daysBack: number }> = [
  { label: "Сегодня", daysBack: 0 },
  { label: "7 дней", daysBack: 6 },
  { label: "30 дней", daysBack: 29 }
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

function buildPwaExportHref(options: {
  metric?: PwaInstallMetric;
  pathPrefix?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: SortOrder;
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
  const query = params.toString();
  return query ? `/admin/analytics/pwa/export?${query}` : "/admin/analytics/pwa/export";
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

function formatDayLabel(value: string): string {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short"
  });
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

function downsampleDailySeries(
  items: PwaInstallDailySummaryEntry[],
  maxPoints: number
): PwaInstallDailySummaryEntry[] {
  if (items.length <= maxPoints) {
    return items;
  }
  const stride = Math.ceil(items.length / maxPoints);
  const sampled = items.filter((_, index) => index % stride === 0);
  return sampled.slice(-maxPoints);
}

function getChartPoint(
  index: number,
  pointsCount: number,
  value: number,
  maxValue: number
): { x: number; y: number } {
  const innerWidth = CHART_WIDTH - CHART_PADDING_X * 2;
  const innerHeight = CHART_HEIGHT - CHART_PADDING_Y * 2;
  const safeMax = Math.max(1, maxValue);
  const x =
    pointsCount <= 1
      ? CHART_WIDTH / 2
      : CHART_PADDING_X + (innerWidth / (pointsCount - 1)) * index;
  const y = CHART_HEIGHT - CHART_PADDING_Y - (value / safeMax) * innerHeight;
  return { x, y };
}

function buildLinePoints(values: number[], maxValue: number): string {
  if (!values.length) {
    return "";
  }
  return values
    .map((value, index) => {
      const point = getChartPoint(index, values.length, value, maxValue);
      return `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
    })
    .join(" ");
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

  const exportHref = buildPwaExportHref({
    metric,
    pathPrefix,
    dateFrom: effectiveDateFrom,
    dateTo: effectiveDateTo,
    sort
  });

  const quickDateRanges = datePresets.map((preset) => ({
    ...preset,
    ...buildPresetRange(preset.daysBack)
  }));

  const [eventsResponse, dailyResponse, ...funnelResponses] = await Promise.all([
    fetchPwaInstallEvents({
      metric,
      pathPrefix,
      dateFrom: effectiveDateFrom,
      dateTo: effectiveDateTo,
      sort,
      limit: PAGE_SIZE,
      offset
    }),
    fetchPwaInstallDailySummary({
      pathPrefix,
      dateFrom: effectiveDateFrom,
      dateTo: effectiveDateTo
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

  const dailySeries = downsampleDailySeries(dailyResponse.items, 48);
  const dailyPromptAvailable = dailySeries.map((item) => item.promptAvailable);
  const dailyInstalled = dailySeries.map((item) => item.installed);
  const maxDailyValue = Math.max(1, ...dailyPromptAvailable, ...dailyInstalled);
  const promptAvailableLinePoints = buildLinePoints(dailyPromptAvailable, maxDailyValue);
  const installedLinePoints = buildLinePoints(dailyInstalled, maxDailyValue);
  const dailyStart = dailySeries[0]?.date;
  const dailyEnd = dailySeries[dailySeries.length - 1]?.date;

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
              href={exportHref}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border/60 px-3 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
            >
              Экспорт CSV
            </Link>
            <Link
              href="/admin/orders"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border/60 px-3 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
            >
              Заказы
            </Link>
            <Link
              href="/admin/analytics/favorites"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border/60 px-3 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
            >
              Favorites
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

        <div className="flex flex-wrap items-end gap-2 sm:col-span-3">
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

        <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-2 sm:col-span-5">
          <span className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Быстрый диапазон</span>
          {quickDateRanges.map((preset) => {
            const isActive = dateFrom === preset.dateFrom && dateTo === preset.dateTo;
            return (
              <Link
                key={preset.label}
                href={buildAnalyticsHref({
                  metric,
                  pathPrefix,
                  dateFrom: preset.dateFrom,
                  dateTo: preset.dateTo,
                  sort,
                  offset: 0
                })}
                className={`inline-flex h-8 items-center justify-center rounded-lg border px-2 text-[11px] transition-colors ${
                  isActive
                    ? "border-accent/70 bg-accent/15 text-foreground"
                    : "border-border/60 text-muted-foreground hover:border-accent/50 hover:text-foreground"
                }`}
              >
                {preset.label}
              </Link>
            );
          })}
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
          <p className="text-xs text-muted-foreground">Итого: {formatPercent(ratio(installed, promptAvailable))}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-border/60 bg-surface-soft p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Динамика по дням</h2>
          <span className="text-xs text-muted-foreground">{dailySeries.length} точек</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Сравнение prompt_available и installed в выбранном диапазоне.
        </p>

        {dailySeries.length > 0 ? (
          <>
            <div className="mt-4 overflow-x-auto">
              <div className="min-w-[740px] rounded-xl border border-border/60 bg-surface-strong/60 p-3">
                <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-56 w-full" role="img">
                  {[0.25, 0.5, 0.75, 1].map((fraction) => {
                    const y =
                      CHART_HEIGHT -
                      CHART_PADDING_Y -
                      (CHART_HEIGHT - CHART_PADDING_Y * 2) * fraction;
                    return (
                      <line
                        key={fraction}
                        x1={CHART_PADDING_X}
                        y1={y}
                        x2={CHART_WIDTH - CHART_PADDING_X}
                        y2={y}
                        stroke="currentColor"
                        className="text-border/50"
                        strokeWidth="1"
                      />
                    );
                  })}
                  <line
                    x1={CHART_PADDING_X}
                    y1={CHART_HEIGHT - CHART_PADDING_Y}
                    x2={CHART_WIDTH - CHART_PADDING_X}
                    y2={CHART_HEIGHT - CHART_PADDING_Y}
                    stroke="currentColor"
                    className="text-border/70"
                    strokeWidth="1"
                  />

                  <polyline
                    points={promptAvailableLinePoints}
                    fill="none"
                    stroke="currentColor"
                    className="text-amber-300"
                    strokeWidth="2.2"
                  />
                  <polyline
                    points={installedLinePoints}
                    fill="none"
                    stroke="currentColor"
                    className="text-emerald-300"
                    strokeWidth="2.2"
                  />

                  {dailySeries.map((item, index) => {
                    const availablePoint = getChartPoint(
                      index,
                      dailySeries.length,
                      item.promptAvailable,
                      maxDailyValue
                    );
                    const installedPoint = getChartPoint(
                      index,
                      dailySeries.length,
                      item.installed,
                      maxDailyValue
                    );
                    return (
                      <g key={item.date}>
                        <circle
                          cx={availablePoint.x}
                          cy={availablePoint.y}
                          r="2.6"
                          fill="currentColor"
                          className="text-amber-300"
                        />
                        <circle
                          cx={installedPoint.x}
                          cy={installedPoint.y}
                          r="2.6"
                          fill="currentColor"
                          className="text-emerald-300"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{dailyStart ? formatDayLabel(dailyStart) : "—"}</span>
              <span>Максимум: {maxDailyValue}</span>
              <span>{dailyEnd ? formatDayLabel(dailyEnd) : "—"}</span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-border/50 bg-surface-strong px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">prompt_available</p>
                <p className="mt-1 text-lg font-semibold text-amber-200">
                  {dailySeries.reduce((sum, item) => sum + item.promptAvailable, 0)}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-surface-strong px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">installed</p>
                <p className="mt-1 text-lg font-semibold text-emerald-300">
                  {dailySeries.reduce((sum, item) => sum + item.installed, 0)}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-xl border border-border/50 bg-surface-strong px-3 py-3 text-sm text-muted-foreground">
            Нет данных для графика по текущим фильтрам.
          </div>
        )}
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
        Перmalink фильтра: <span className="font-mono text-[11px] text-foreground">{currentHref}</span>
      </div>
    </div>
  );
}
