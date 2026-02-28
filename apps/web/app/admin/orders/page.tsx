import Link from "next/link";
import { fetchOrders, type OrderPaymentState, type OrderStatus } from "@/lib/api-client";

const PAGE_SIZE = 20;

const statusFilters: Array<{ label: string; value?: OrderStatus }> = [
  { label: "Все" },
  { label: "Pending", value: "pending" },
  { label: "Redirect", value: "redirect" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Paid", value: "paid" },
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
  const allowed: OrderStatus[] = ["pending", "redirect", "confirmed", "paid", "failed", "cancelled"];
  return allowed.includes(value as OrderStatus) ? (value as OrderStatus) : undefined;
}

function parseOrderPaymentState(value: string | undefined): OrderPaymentState | undefined {
  if (!value) {
    return undefined;
  }
  const allowed: OrderPaymentState[] = ["awaiting", "paid", "failed", "cancelled"];
  return allowed.includes(value as OrderPaymentState) ? (value as OrderPaymentState) : undefined;
}

function buildOrdersHref(options: {
  status?: OrderStatus;
  paymentState?: OrderPaymentState;
  offset?: number;
}): string {
  const params = new URLSearchParams();
  if (options.status) {
    params.set("status", options.status);
  }
  if (options.paymentState) {
    params.set("payment_state", options.paymentState);
  }
  if (options.offset !== undefined && options.offset > 0) {
    params.set("offset", String(options.offset));
  }
  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

function getPaymentBadge(status: OrderStatus): { label: string; className: string } {
  if (status === "paid") {
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

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams?: {
    status?: string;
    payment_state?: string;
    offset?: string;
  };
}) {
  const status = parseOrderStatus(searchParams?.status);
  const paymentState = parseOrderPaymentState(searchParams?.payment_state);
  const offset = toPositiveInt(searchParams?.offset, 0);

  const response = await fetchOrders({
    status,
    paymentState,
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

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => {
          const active = filter.value === status || (!filter.value && !status);
          return (
            <Link
              key={filter.label}
              href={buildOrdersHref({ status: filter.value, paymentState, offset: 0 })}
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
              href={buildOrdersHref({ status, paymentState: filter.value, offset: 0 })}
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
            </tr>
          </thead>
          <tbody>
            {response.items.map((order) => {
              const paymentBadge = getPaymentBadge(order.status);
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
              </tr>
            );
            })}
            {response.items.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={7}>
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
            href={buildOrdersHref({ status, paymentState, offset: nextOffset })}
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
