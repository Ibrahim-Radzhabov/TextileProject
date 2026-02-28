import Link from "next/link";
import { fetchOrders, type OrderStatus } from "@/lib/api-client";

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

function buildOrdersHref(options: { status?: OrderStatus; offset?: number }): string {
  const params = new URLSearchParams();
  if (options.status) {
    params.set("status", options.status);
  }
  if (options.offset !== undefined && options.offset > 0) {
    params.set("offset", String(options.offset));
  }
  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams?: {
    status?: string;
    offset?: string;
  };
}) {
  const status = parseOrderStatus(searchParams?.status);
  const offset = toPositiveInt(searchParams?.offset, 0);

  const response = await fetchOrders({
    status,
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
              href={buildOrdersHref({ status: filter.value, offset: 0 })}
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
        <table className="w-full min-w-[760px] table-fixed border-collapse text-left text-sm">
          <thead className="bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Клиент</th>
              <th className="px-4 py-3">Итого</th>
              <th className="px-4 py-3">Позиций</th>
            </tr>
          </thead>
          <tbody>
            {response.items.map((order) => (
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
            ))}
            {response.items.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={6}>
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
            href={buildOrdersHref({ status, offset: Math.max(0, response.offset - response.limit) })}
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
            href={buildOrdersHref({ status, offset: nextOffset })}
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
