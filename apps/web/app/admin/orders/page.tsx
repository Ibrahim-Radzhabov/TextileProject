import Link from "next/link";
import { QuickActionForms } from "@store-platform/ui";
import { getAllowedManualStatuses, type ManualOrderStatus } from "@store-platform/shared-types";
import {
  fetchOrders,
  type OrderPaymentState,
  type OrderStatus,
  type SortOrder
} from "@/lib/api-client";

const PAGE_SIZE = 20;

const statusFilters: Array<{ label: string; value?: OrderStatus }> = [
  { label: "Все" },
  { label: "Pending", value: "pending" },
  { label: "Redirect", value: "redirect" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Paid", value: "paid" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" }
];

const paymentFilters: Array<{ label: string; value?: OrderPaymentState }> = [
  { label: "Все оплаты" },
  { label: "Ожидают оплаты", value: "awaiting" },
  { label: "Оплаченные", value: "paid" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" }
];

const quickStatusActions: Array<{ label: string; value: ManualOrderStatus }> = [
  { label: "В обработку", value: "processing" },
  { label: "Отправлен", value: "shipped" },
  { label: "Отменить", value: "cancelled" }
];

const sortFilters: Array<{ label: string; value: SortOrder }> = [
  { label: "Новые сверху", value: "newest" },
  { label: "Старые сверху", value: "oldest" }
];

function toPositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

function parseOrderStatus(value: string | undefined): OrderStatus | undefined {
  if (!value) {
    return undefined;
  }
  const allowed: OrderStatus[] = [
    "pending",
    "redirect",
    "confirmed",
    "paid",
    "processing",
    "shipped",
    "failed",
    "cancelled"
  ];
  return allowed.includes(value as OrderStatus) ? (value as OrderStatus) : undefined;
}

function parseOrderPaymentState(value: string | undefined): OrderPaymentState | undefined {
  if (!value) {
    return undefined;
  }
  const allowed: OrderPaymentState[] = ["awaiting", "paid", "failed", "cancelled"];
  return allowed.includes(value as OrderPaymentState) ? (value as OrderPaymentState) : undefined;
}

function parseSortOrder(value: string | undefined): SortOrder | undefined {
  if (!value) {
    return undefined;
  }
  const allowed: SortOrder[] = ["newest", "oldest"];
  return allowed.includes(value as SortOrder) ? (value as SortOrder) : undefined;
}

function parseSearchQuery(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim();
  if (!normalized.length) {
    return undefined;
  }
  return normalized.slice(0, 200);
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

function buildOrdersHref(options: {
  status?: OrderStatus;
  paymentState?: OrderPaymentState;
  query?: string;
  createdFrom?: string;
  createdTo?: string;
  sort?: SortOrder;
  offset?: number;
}): string {
  const params = new URLSearchParams();
  if (options.status) {
    params.set("status", options.status);
  }
  if (options.paymentState) {
    params.set("payment_state", options.paymentState);
  }
  if (options.query) {
    params.set("q", options.query);
  }
  if (options.createdFrom) {
    params.set("created_from", options.createdFrom);
  }
  if (options.createdTo) {
    params.set("created_to", options.createdTo);
  }
  if (options.sort) {
    params.set("sort", options.sort);
  }
  if (options.offset !== undefined && options.offset > 0) {
    params.set("offset", String(options.offset));
  }
  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

function getPaymentBadge(status: OrderStatus): { label: string; className: string } {
  if (status === "paid" || status === "processing" || status === "shipped") {
    return {
      label: "Оплачено",
      className: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
    };
  }
  if (status === "failed") {
    return {
      label: "Ошибка оплаты",
      className: "border-red-400/40 bg-red-500/10 text-red-300"
    };
  }
  if (status === "cancelled") {
    return {
      label: "Отменено",
      className: "border-zinc-400/40 bg-zinc-500/10 text-zinc-300"
    };
  }
  return {
    label: "Ожидает оплаты",
    className: "border-amber-400/40 bg-amber-500/10 text-amber-300"
  };
}

function buildOrdersExportHref(options: {
  status?: OrderStatus;
  paymentState?: OrderPaymentState;
  query?: string;
  createdFrom?: string;
  createdTo?: string;
  sort?: SortOrder;
}): string {
  const params = new URLSearchParams();
  if (options.status) {
    params.set("status", options.status);
  }
  if (options.paymentState) {
    params.set("payment_state", options.paymentState);
  }
  if (options.query) {
    params.set("q", options.query);
  }
  if (options.createdFrom) {
    params.set("created_from", options.createdFrom);
  }
  if (options.createdTo) {
    params.set("created_to", options.createdTo);
  }
  if (options.sort) {
    params.set("sort", options.sort);
  }
  const query = params.toString();
  return query ? `/admin/orders/export?${query}` : "/admin/orders/export";
}

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams?: {
    status?: string;
    payment_state?: string;
    q?: string;
    created_from?: string;
    created_to?: string;
    sort?: string;
    offset?: string;
    action_error?: string;
    action_success?: string;
  };
}) {
  const status = parseOrderStatus(searchParams?.status);
  const paymentState = parseOrderPaymentState(searchParams?.payment_state);
  const query = parseSearchQuery(searchParams?.q);
  const createdFrom = parseDateParam(searchParams?.created_from);
  const createdTo = parseDateParam(searchParams?.created_to);
  const sort = parseSortOrder(searchParams?.sort) ?? "newest";
  const offset = toPositiveInt(searchParams?.offset, 0);
  const actionError =
    typeof searchParams?.action_error === "string" && searchParams.action_error.trim().length > 0
      ? searchParams.action_error
      : null;
  const actionSuccess =
    typeof searchParams?.action_success === "string" && searchParams.action_success.trim().length > 0
      ? searchParams.action_success
      : null;
  const hasInvalidDateRange = Boolean(createdFrom && createdTo && createdFrom > createdTo);
  const effectiveCreatedFrom = hasInvalidDateRange ? undefined : createdFrom;
  const effectiveCreatedTo = hasInvalidDateRange ? undefined : createdTo;
  const currentOrdersHref = buildOrdersHref({
    status,
    paymentState,
    query,
    createdFrom,
    createdTo,
    sort,
    offset
  });

  const response = await fetchOrders({
    status,
    paymentState,
    query,
    createdFrom: effectiveCreatedFrom,
    createdTo: effectiveCreatedTo,
    sort,
    limit: PAGE_SIZE,
    offset
  });

  const hasPrev = response.offset > 0;
  const nextOffset = response.offset + response.limit;
  const hasNext = nextOffset < response.total;

  return (
    <div className="space-y-6 pb-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Заказы</h1>
          <form action="/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
            >
              Выйти
            </button>
          </form>
        </div>
        <p className="text-sm text-muted-foreground">Текущий tenant: витрина активного клиента.</p>
      </header>

      <form
        method="get"
        className="glass-panel grid gap-3 rounded-2xl border border-border/60 px-4 py-4 sm:grid-cols-4"
      >
        {status && <input type="hidden" name="status" value={status} />}
        {paymentState && <input type="hidden" name="payment_state" value={paymentState} />}
        <label className="space-y-1 sm:col-span-2">
          <span className="text-xs text-muted-foreground">Поиск (order_id / email)</span>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Например, e2e@example.com"
            className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">С даты</span>
          <input
            type="date"
            name="created_from"
            defaultValue={createdFrom}
            className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">По дату</span>
          <input
            type="date"
            name="created_to"
            defaultValue={createdTo}
            className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Сортировка</span>
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
        <div className="flex flex-wrap items-center gap-2 sm:col-span-4">
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-accent/60 bg-accent px-4 text-xs font-medium text-white transition-colors hover:bg-accent/90"
          >
            Применить
          </button>
          <Link
            href={buildOrdersHref({ status, paymentState, sort })}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border/60 px-4 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
          >
            Сбросить
          </Link>
          <Link
            href={buildOrdersExportHref({
              status,
              paymentState,
              query,
              createdFrom,
              createdTo,
              sort
            })}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border/60 px-4 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
          >
            Экспорт CSV
          </Link>
        </div>
      </form>

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

      {hasInvalidDateRange && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          Некорректный диапазон дат: "С даты" не может быть позже "По дату".
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => {
          const active = filter.value === status || (!filter.value && !status);
          return (
            <Link
              key={filter.label}
              href={buildOrdersHref({
                status: filter.value,
                paymentState,
                query,
                createdFrom,
                createdTo,
                sort,
                offset: 0
              })}
              className={[
                "rounded-full border px-3 py-1 text-xs transition-colors",
                active
                  ? "border-accent bg-accent text-white"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:border-accent/50 hover:text-foreground"
              ].join(" ")}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {paymentFilters.map((filter) => {
          const active = filter.value === paymentState || (!filter.value && !paymentState);
          return (
            <Link
              key={filter.label}
              href={buildOrdersHref({
                status,
                paymentState: filter.value,
                query,
                createdFrom,
                createdTo,
                sort,
                offset: 0
              })}
              className={[
                "rounded-full border px-3 py-1 text-xs transition-colors",
                active
                  ? "border-accent bg-accent text-white"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:border-accent/50 hover:text-foreground"
              ].join(" ")}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
        <table className="w-full min-w-[920px] table-fixed border-collapse text-left text-sm">
          <thead className="bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Оплата</th>
              <th className="px-4 py-3">Клиент</th>
              <th className="px-4 py-3">Итого</th>
              <th className="px-4 py-3">Позиций</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {response.items.map((order) => {
              const paymentBadge = getPaymentBadge(order.status);
              const allowedManualStatuses = getAllowedManualStatuses(order.status);
              return (
              <tr key={order.orderId} className="border-t border-border/50">
                <td className="truncate px-4 py-3 font-mono text-xs">
                  <Link
                    href={`/admin/orders/${encodeURIComponent(order.orderId)}`}
                    className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    {order.orderId}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs">
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      "rounded-full border px-2 py-0.5 text-xs",
                      paymentBadge.className
                    ].join(" ")}
                  >
                    {paymentBadge.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {order.customer.email}
                </td>
                <td className="px-4 py-3 font-medium">
                  {order.amount.toLocaleString(undefined, {
                    style: "currency",
                    currency: order.currency
                  })}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {order.cart.items.length}
                </td>
                <td className="px-4 py-3">
                  <QuickActionForms
                    formAction={`/admin/orders/${encodeURIComponent(order.orderId)}/status`}
                    actions={quickStatusActions}
                    allowedValues={allowedManualStatuses}
                    hiddenFields={[{ name: "return_to", value: currentOrdersHref }]}
                  />
                </td>
              </tr>
            );
            })}
            {response.items.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={8}>
                  Заказы не найдены.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Показано {response.items.length} из {response.total}
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={buildOrdersHref({
              status,
              paymentState,
              query,
              createdFrom,
              createdTo,
              sort,
              offset: Math.max(0, response.offset - response.limit)
            })}
            className={[
              "rounded-lg border px-3 py-1.5 text-xs",
              hasPrev
                ? "border-border/60 text-foreground hover:border-accent/50"
                : "pointer-events-none border-border/40 text-muted-foreground/60"
            ].join(" ")}
          >
            Назад
          </Link>
          <Link
            href={buildOrdersHref({
              status,
              paymentState,
              query,
              createdFrom,
              createdTo,
              sort,
              offset: nextOffset
            })}
            className={[
              "rounded-lg border px-3 py-1.5 text-xs",
              hasNext
                ? "border-border/60 text-foreground hover:border-accent/50"
                : "pointer-events-none border-border/40 text-muted-foreground/60"
            ].join(" ")}
          >
            Вперёд
          </Link>
        </div>
      </div>
    </div>
  );
}
