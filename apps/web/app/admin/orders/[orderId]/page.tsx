import Link from "next/link";
import {
  ApiError,
  fetchOrderById,
  fetchWebhookAudit,
  type WebhookProcessingStatus
} from "@/lib/api-client";

const AUDIT_PAGE_SIZE = 20;

const auditFilters: Array<{ label: string; value?: WebhookProcessingStatus }> = [
  { label: "Все" },
  { label: "Processing", value: "processing" },
  { label: "Processed", value: "processed" },
  { label: "Ignored", value: "ignored" },
  { label: "Failed", value: "failed" }
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
  offset?: number;
}): string {
  const params = new URLSearchParams();
  if (options.processingStatus) {
    params.set("processing_status", options.processingStatus);
  }
  if (options.offset !== undefined && options.offset > 0) {
    params.set("offset", String(options.offset));
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
    offset?: string;
  };
}) {
  const processingStatus = parseProcessingStatus(searchParams?.processing_status);
  const offset = toPositiveInt(searchParams?.offset, 0);

  try {
    const [order, audit] = await Promise.all([
      fetchOrderById(params.orderId),
      fetchWebhookAudit({
        orderId: params.orderId,
        processingStatus,
        limit: AUDIT_PAGE_SIZE,
        offset
      })
    ]);

    const hasPrev = audit.offset > 0;
    const nextOffset = audit.offset + audit.limit;
    const hasNext = nextOffset < audit.total;

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
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
              >
                Выйти
              </button>
            </form>
          </div>
          <h1 className="break-all text-2xl font-semibold tracking-tight sm:text-3xl">Заказ {order.orderId}</h1>
        </header>

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
                  offset: Math.max(0, audit.offset - audit.limit)
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
                href={buildOrderHref({
                  orderId: params.orderId,
                  processingStatus,
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
