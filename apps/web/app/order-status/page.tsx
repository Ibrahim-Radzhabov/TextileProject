import Link from "next/link";
import { Surface } from "@store-platform/ui";
import { ApiError, fetchOrderById, type OrderStatus } from "@/lib/api-client";
import { OrderStatusLookupCard } from "@/components/order-status-lookup-card";

function getOrderStatusLabel(status: OrderStatus): { label: string; className: string } {
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
  if (status === "redirect") {
    return {
      label: "Ожидает завершения Stripe Checkout",
      className: "border-amber-400/40 bg-amber-500/10 text-amber-300"
    };
  }
  return {
    label: "Ожидает оплаты",
    className: "border-amber-400/40 bg-amber-500/10 text-amber-300"
  };
}

function normalizeOrderId(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length ? normalized : undefined;
  }
  if (Array.isArray(value) && value.length > 0) {
    return normalizeOrderId(value[0]);
  }
  return undefined;
}

export default async function OrderStatusPage({
  searchParams
}: {
  searchParams?: {
    order_id?: string | string[];
  };
}) {
  const orderId = normalizeOrderId(searchParams?.order_id);

  let order:
    | Awaited<ReturnType<typeof fetchOrderById>>
    | null = null;
  let lookupError: string | null = null;

  if (orderId) {
    try {
      order = await fetchOrderById(orderId);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        lookupError = "Заказ не найден. Проверьте номер и попробуйте снова.";
      } else {
        lookupError = "Не удалось получить статус заказа. Попробуйте позже.";
      }
    }
  }
  const orderStatusMeta = order ? getOrderStatusLabel(order.status) : null;

  return (
    <div className="space-y-6 pb-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Статус заказа</h1>
        <p className="text-sm text-muted-foreground">
          Здесь можно проверить актуальный статус по номеру заказа.
        </p>
      </header>

      <OrderStatusLookupCard defaultOrderId={orderId} />

      {!orderId && (
        <Surface className="px-5 py-4 text-sm text-muted-foreground">
          Введите <code className="rounded bg-muted/40 px-1 py-0.5 text-xs">order_id</code>,
          чтобы увидеть состояние оплаты и обработки заказа.
        </Surface>
      )}

      {lookupError && (
        <Surface className="border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {lookupError}
        </Surface>
      )}

      {order && (
        <Surface className="space-y-5 px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs text-muted-foreground">{order.orderId}</p>
            {orderStatusMeta && (
              <span
                className={[
                  "rounded-full border px-3 py-1 text-xs",
                  orderStatusMeta.className
                ].join(" ")}
              >
                {orderStatusMeta.label}
              </span>
            )}
          </div>

          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Сумма</dt>
              <dd className="mt-1 font-medium">
                {order.amount.toLocaleString(undefined, {
                  style: "currency",
                  currency: order.currency
                })}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Позиций</dt>
              <dd className="mt-1 font-medium">{order.cart.items.length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Создан</dt>
              <dd className="mt-1 font-medium">{new Date(order.createdAt).toLocaleString()}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-accent/60 bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90"
            >
              В каталог
            </Link>
            {order.status === "redirect" && order.redirectUrl && (
              <a
                href={order.redirectUrl}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border/60 px-4 text-sm font-medium text-foreground transition-colors hover:border-accent/50"
              >
                Завершить оплату
              </a>
            )}
          </div>
        </Surface>
      )}
    </div>
  );
}
