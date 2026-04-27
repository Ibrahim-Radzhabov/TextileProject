import Link from "next/link";
import { getAllowedManualStatuses, type ManualOrderStatus } from "@store-platform/shared-types";
import {
  ApiError,
  fetchOrderById,
  fetchOrderStatusAudit,
  fetchWebhookAudit,
  type OrderStatus,
  type SortOrder,
  type StatusAuditActorType,
  type WebhookProcessingStatus
} from "@/lib/api-client";

const WEBHOOK_AUDIT_PAGE_SIZE = 20;
const STATUS_AUDIT_PAGE_SIZE = 10;

const auditFilters: Array<{ label: string; value?: WebhookProcessingStatus }> = [
  { label: "Все" },
  { label: "Processing", value: "processing" },
  { label: "Processed", value: "processed" },
  { label: "Ignored", value: "ignored" },
  { label: "Failed", value: "failed" }
];

const manualStatusOptions: Array<{ label: string; value: ManualOrderStatus }> = [
  { label: "В обработку", value: "processing" },
  { label: "Отправлен", value: "shipped" },
  { label: "Отменен", value: "cancelled" }
];

const statusAuditStatusFilters: Array<{ label: string; value?: OrderStatus }> = [
  { label: "Все статусы" },
  { label: "Pending", value: "pending" },
  { label: "Redirect", value: "redirect" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Paid", value: "paid" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" }
];

const statusAuditActorFilters: Array<{ label: string; value?: StatusAuditActorType }> = [
  { label: "Все источники" },
  { label: "Checkout", value: "checkout" },
  { label: "Webhook", value: "webhook" },
  { label: "Admin", value: "admin" },
  { label: "System", value: "system" }
];

const sortFilters: Array<{ label: string; value: SortOrder }> = [
  { label: "Новые сверху", value: "newest" },
  { label: "Старые сверху", value: "oldest" }
];

function parseProcessingStatus(value: string | undefined): WebhookProcessingStatus | undefined {
  if (!value) {
    return undefined;
  }
  const allowed: WebhookProcessingStatus[] = ["processing", "processed", "ignored", "failed"];
  return allowed.includes(value as WebhookProcessingStatus)
    ? (value as WebhookProcessingStatus)
    : undefined;
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

function parseStatusAuditActor(value: string | undefined): StatusAuditActorType | undefined {
  if (!value) {
    return undefined;
  }
  const allowed: StatusAuditActorType[] = ["checkout", "webhook", "admin", "system"];
  return allowed.includes(value as StatusAuditActorType)
    ? (value as StatusAuditActorType)
    : undefined;
}

function parseSortOrder(value: string | undefined): SortOrder | undefined {
  if (!value) {
    return undefined;
  }
  const allowed: SortOrder[] = ["newest", "oldest"];
  return allowed.includes(value as SortOrder) ? (value as SortOrder) : undefined;
}

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

function buildOrderHref(options: {
  orderId: string;
  processingStatus?: WebhookProcessingStatus;
  actionError?: string;
  offset?: number;
  statusAuditTo?: OrderStatus;
  statusAuditActor?: StatusAuditActorType;
  statusAuditSort?: SortOrder;
  statusAuditOffset?: number;
}): string {
  const params = new URLSearchParams();
  if (options.processingStatus) {
    params.set("processing_status", options.processingStatus);
  }
  if (options.offset !== undefined && options.offset > 0) {
    params.set("offset", String(options.offset));
  }
  if (options.actionError) {
    params.set("action_error", options.actionError);
  }
  if (options.statusAuditTo) {
    params.set("status_audit_to", options.statusAuditTo);
  }
  if (options.statusAuditActor) {
    params.set("status_audit_actor", options.statusAuditActor);
  }
  if (options.statusAuditSort) {
    params.set("status_audit_sort", options.statusAuditSort);
  }
  if (options.statusAuditOffset !== undefined && options.statusAuditOffset > 0) {
    params.set("status_audit_offset", String(options.statusAuditOffset));
  }

  const query = params.toString();
  const base = `/admin/orders/${encodeURIComponent(options.orderId)}`;
  return query ? `${base}?${query}` : base;
}

export default async function AdminOrderDetailsPage({
  params,
  searchParams
}: {
  params: { orderId: string };
  searchParams?: {
    processing_status?: string;
    action_error?: string;
    offset?: string;
    status_audit_to?: string;
    status_audit_actor?: string;
    status_audit_sort?: string;
    status_audit_offset?: string;
  };
}) {
  const processingStatus = parseProcessingStatus(searchParams?.processing_status);
  const statusAuditTo = parseOrderStatus(searchParams?.status_audit_to);
  const statusAuditActor = parseStatusAuditActor(searchParams?.status_audit_actor);
  const statusAuditSort = parseSortOrder(searchParams?.status_audit_sort) ?? "newest";
  const actionError =
    typeof searchParams?.action_error === "string" && searchParams.action_error.trim().length > 0
      ? searchParams.action_error
      : null;
  const webhookOffset = toPositiveInt(searchParams?.offset, 0);
  const statusAuditOffset = toPositiveInt(searchParams?.status_audit_offset, 0);

  try {
    const [order, audit, statusAudit] = await Promise.all([
      fetchOrderById(params.orderId),
      fetchWebhookAudit({
        orderId: params.orderId,
        processingStatus,
        limit: WEBHOOK_AUDIT_PAGE_SIZE,
        offset: webhookOffset
      }),
      fetchOrderStatusAudit({
        orderId: params.orderId,
        limit: STATUS_AUDIT_PAGE_SIZE,
        offset: statusAuditOffset,
        toStatus: statusAuditTo,
        actorType: statusAuditActor,
        sort: statusAuditSort
      })
    ]);

    const webhookHasPrev = audit.offset > 0;
    const webhookNextOffset = audit.offset + audit.limit;
    const webhookHasNext = webhookNextOffset < audit.total;

    const statusAuditHasPrev = statusAudit.offset > 0;
    const statusAuditNextOffset = statusAudit.offset + statusAudit.limit;
    const statusAuditHasNext = statusAuditNextOffset < statusAudit.total;
    const allowedManualStatuses = getAllowedManualStatuses(order.status);

    return (
      <div className="space-y-6 pb-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href="/admin/orders"
              className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              ← К списку заказов
            </Link>
            <div className="flex items-center gap-2">
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
          <h1 className="break-all text-2xl font-semibold tracking-tight sm:text-3xl">Заказ {order.orderId}</h1>
        </header>

        {actionError && (
          <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {actionError}
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border/60 bg-card/40 px-4 py-3">
            <p className="text-xs text-muted-foreground">Статус</p>
            <p className="mt-1 text-sm font-medium">{order.status}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/40 px-4 py-3">
            <p className="text-xs text-muted-foreground">Сумма</p>
            <p className="mt-1 text-sm font-medium">
              {order.amount.toLocaleString(undefined, {
                style: "currency",
                currency: order.currency
              })}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/40 px-4 py-3">
            <p className="text-xs text-muted-foreground">Создан</p>
            <p className="mt-1 text-sm font-medium">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/40 px-4 py-3">
            <p className="text-xs text-muted-foreground">Клиент</p>
            <p className="mt-1 text-sm font-medium break-all">{order.customer.email}</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium tracking-tight text-muted-foreground">Операции</h2>
          <form
            action={`/admin/orders/${encodeURIComponent(params.orderId)}/status`}
            method="post"
            className="grid gap-3 rounded-2xl border border-border/60 bg-card/40 px-4 py-4 sm:grid-cols-4"
          >
            <input type="hidden" name="processing_status" value={processingStatus ?? ""} />
            <input type="hidden" name="offset" value={webhookOffset > 0 ? String(webhookOffset) : ""} />
            <input type="hidden" name="status_audit_to" value={statusAuditTo ?? ""} />
            <input type="hidden" name="status_audit_actor" value={statusAuditActor ?? ""} />
            <input type="hidden" name="status_audit_sort" value={statusAuditSort} />
            <input
              type="hidden"
              name="status_audit_offset"
              value={statusAuditOffset > 0 ? String(statusAuditOffset) : ""}
            />

            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Новый статус</span>
              <select
                name="status"
                className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Выберите действие
                </option>
                {manualStatusOptions
                  .filter((option) => allowedManualStatuses.includes(option.value))
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </label>

            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs text-muted-foreground">Комментарий (опционально)</span>
              <input
                name="reason"
                placeholder="Например, передано на склад"
                className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-accent/60 bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={allowedManualStatuses.length === 0}
              >
                Обновить статус
              </button>
            </div>
          </form>
          {allowedManualStatuses.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Для текущего статуса нет доступных ручных переходов.
            </p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium tracking-tight text-muted-foreground">История статусов</h2>
          <form method="get" className="grid gap-3 rounded-2xl border border-border/60 bg-card/40 px-4 py-4 sm:grid-cols-4">
            <input type="hidden" name="processing_status" value={processingStatus ?? ""} />
            <input type="hidden" name="offset" value={webhookOffset > 0 ? String(webhookOffset) : ""} />

            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Статус назначения</span>
              <select
                name="status_audit_to"
                defaultValue={statusAuditTo ?? ""}
                className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
              >
                {statusAuditStatusFilters.map((filter) => (
                  <option key={filter.label} value={filter.value ?? ""}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Источник</span>
              <select
                name="status_audit_actor"
                defaultValue={statusAuditActor ?? ""}
                className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
              >
                {statusAuditActorFilters.map((filter) => (
                  <option key={filter.label} value={filter.value ?? ""}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Сортировка</span>
              <select
                name="status_audit_sort"
                defaultValue={statusAuditSort}
                className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
              >
                {sortFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end gap-2 sm:col-span-1">
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-accent/60 bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90"
              >
                Применить фильтры
              </button>
              <Link
                href={buildOrderHref({
                  orderId: params.orderId,
                  processingStatus,
                  offset: webhookOffset
                })}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border/60 px-4 text-sm text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
              >
                Сбросить
              </Link>
            </div>
          </form>

          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
            <table className="w-full min-w-[760px] table-fixed border-collapse text-left text-sm">
              <thead className="bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Когда</th>
                  <th className="px-4 py-3">Откуда</th>
                  <th className="px-4 py-3">Куда</th>
                  <th className="px-4 py-3">Источник</th>
                  <th className="px-4 py-3">Комментарий</th>
                </tr>
              </thead>
              <tbody>
                {statusAudit.items.map((entry) => (
                  <tr key={entry.id} className="border-t border-border/50">
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{entry.fromStatus ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs">
                        {entry.toStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{entry.actorType}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{entry.reason ?? "—"}</td>
                  </tr>
                ))}
                {statusAudit.items.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-muted-foreground" colSpan={5}>
                      История изменений статуса пока пустая.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Показано {statusAudit.items.length} из {statusAudit.total}
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={buildOrderHref({
                  orderId: params.orderId,
                  processingStatus,
                  offset: webhookOffset,
                  statusAuditTo,
                  statusAuditActor,
                  statusAuditSort,
                  statusAuditOffset: Math.max(0, statusAudit.offset - statusAudit.limit)
                })}
                className={[
                  "rounded-lg border px-3 py-1.5 text-xs",
                  statusAuditHasPrev
                    ? "border-border/60 text-foreground hover:border-accent/50"
                    : "pointer-events-none border-border/40 text-muted-foreground/60"
                ].join(" ")}
              >
                Назад
              </Link>
              <Link
                href={buildOrderHref({
                  orderId: params.orderId,
                  processingStatus,
                  offset: webhookOffset,
                  statusAuditTo,
                  statusAuditActor,
                  statusAuditSort,
                  statusAuditOffset: statusAuditNextOffset
                })}
                className={[
                  "rounded-lg border px-3 py-1.5 text-xs",
                  statusAuditHasNext
                    ? "border-border/60 text-foreground hover:border-accent/50"
                    : "pointer-events-none border-border/40 text-muted-foreground/60"
                ].join(" ")}
              >
                Вперёд
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium tracking-tight text-muted-foreground">Позиции</h2>
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
            <table className="w-full min-w-[680px] table-fixed border-collapse text-left text-sm">
              <thead className="bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Товар</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Line</th>
                </tr>
              </thead>
              <tbody>
                {order.cart.items.map((item) => (
                  <tr key={item.id} className="border-t border-border/50">
                    <td className="px-4 py-3 text-sm">{item.productSnapshot.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {item.productSnapshot.slug}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.quantity}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {item.unitPrice.amount.toLocaleString(undefined, {
                        style: "currency",
                        currency: item.unitPrice.currency
                      })}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {item.lineTotal.amount.toLocaleString(undefined, {
                        style: "currency",
                        currency: item.lineTotal.currency
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium tracking-tight text-muted-foreground">Клиент</h2>
          <div className="rounded-2xl border border-border/60 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{order.customer.email}</p>
            {order.customer.name && <p className="mt-1">{order.customer.name}</p>}
            {order.customer.addressLine1 && <p>{order.customer.addressLine1}</p>}
            <p>
              {[order.customer.addressCity, order.customer.postalCode, order.customer.addressCountry]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium tracking-tight text-muted-foreground">
              Webhook audit
            </h2>
            <div className="flex flex-wrap gap-2">
              {auditFilters.map((filter) => {
                const active =
                  filter.value === processingStatus || (!filter.value && !processingStatus);
                return (
                  <Link
                    key={filter.label}
                    href={buildOrderHref({
                      orderId: params.orderId,
                      processingStatus: filter.value,
                      offset: 0,
                      statusAuditTo,
                      statusAuditActor,
                      statusAuditSort,
                      statusAuditOffset
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
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
            <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-sm">
              <thead className="bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Event ID</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Processing</th>
                  <th className="px-4 py-3">Order status</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {audit.items.map((entry) => (
                  <tr key={`${entry.id}-${entry.eventId}`} className="border-t border-border/50">
                    <td className="truncate px-4 py-3 font-mono text-xs text-muted-foreground">
                      {entry.eventId}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{entry.eventType}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs">
                        {entry.processingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {entry.orderStatus ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {entry.accountId || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                      {entry.errorText && (
                        <p className="mt-1 max-w-[320px] truncate text-red-400">
                          {entry.errorText}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
                {audit.items.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-muted-foreground" colSpan={6}>
                      Для этого заказа audit событий пока нет.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Показано {audit.items.length} из {audit.total}
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={buildOrderHref({
                  orderId: params.orderId,
                  processingStatus,
                  offset: Math.max(0, audit.offset - audit.limit),
                  statusAuditTo,
                  statusAuditActor,
                  statusAuditSort,
                  statusAuditOffset
                })}
                className={[
                  "rounded-lg border px-3 py-1.5 text-xs",
                  webhookHasPrev
                    ? "border-border/60 text-foreground hover:border-accent/50"
                    : "pointer-events-none border-border/40 text-muted-foreground/60"
                ].join(" ")}
              >
                Назад
              </Link>
              <Link
                href={buildOrderHref({
                  orderId: params.orderId,
                  processingStatus,
                  offset: webhookNextOffset,
                  statusAuditTo,
                  statusAuditActor,
                  statusAuditSort,
                  statusAuditOffset
                })}
                className={[
                  "rounded-lg border px-3 py-1.5 text-xs",
                  webhookHasNext
                    ? "border-border/60 text-foreground hover:border-accent/50"
                    : "pointer-events-none border-border/40 text-muted-foreground/60"
                ].join(" ")}
              >
                Вперёд
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <div className="space-y-3 py-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href="/admin/orders"
              className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              ← К списку заказов
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
          <h1 className="text-xl font-semibold tracking-tight">Заказ не найден</h1>
          <p className="text-sm text-muted-foreground">
            Проверьте идентификатор заказа или фильтр по tenant.
          </p>
        </div>
      );
    }

    throw error;
  }
}
