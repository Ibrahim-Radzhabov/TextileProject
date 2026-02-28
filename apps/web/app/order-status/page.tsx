import Link from "next/link";
import { Surface } from "@store-platform/ui";
import { ApiError, fetchOrderById, type OrderStatus } from "@/lib/api-client";
import { OrderStatusLookupCard } from "@/components/order-status-lookup-card";

type TimelineStepState = "completed" | "current" | "failed" | "upcoming";
type TimelineStep = {
  id: string;
  title: string;
  description: string;
  state: TimelineStepState;
  timestamp?: string;
};

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

function formatTimelineTimestamp(value: string): string {
  return new Date(value).toLocaleString();
}

function getOrderTimeline(order: Awaited<ReturnType<typeof fetchOrderById>>): TimelineStep[] {
  const createdAt = formatTimelineTimestamp(order.createdAt);
  const updatedAt = formatTimelineTimestamp(order.updatedAt);

  const createdStep: TimelineStep = {
    id: "created",
    title: "Заказ создан",
    description: "Мы получили заказ и зафиксировали его в системе.",
    state: "completed",
    timestamp: createdAt
  };

  if (order.status === "paid") {
    return [
      createdStep,
      {
        id: "payment",
        title: "Оплата подтверждена",
        description: "Платеж успешно принят.",
        state: "completed",
        timestamp: updatedAt
      },
      {
        id: "processing",
        title: "Заказ передан в обработку",
        description: "Команда магазина начала подготовку вашего заказа.",
        state: "current",
        timestamp: updatedAt
      }
    ];
  }

  if (order.status === "failed") {
    return [
      createdStep,
      {
        id: "payment",
        title: "Ошибка оплаты",
        description: "Платеж не прошел. Попробуйте оплатить заказ повторно.",
        state: "failed",
        timestamp: updatedAt
      },
      {
        id: "next",
        title: "Ожидаем повторную оплату",
        description: "После успешной оплаты статус заказа обновится автоматически.",
        state: "upcoming"
      }
    ];
  }

  if (order.status === "cancelled") {
    return [
      createdStep,
      {
        id: "payment",
        title: "Оплата отменена",
        description: "Платеж был отменен и заказ не передан в обработку.",
        state: "failed",
        timestamp: updatedAt
      },
      {
        id: "next",
        title: "Можно оформить заново",
        description: "Если заказ всё ещё актуален, оформите его повторно.",
        state: "upcoming"
      }
    ];
  }

  if (order.status === "redirect") {
    return [
      createdStep,
      {
        id: "payment",
        title: "Ожидает оплаты в Stripe Checkout",
        description: "Перейдите к оплате, чтобы завершить оформление.",
        state: "current",
        timestamp: updatedAt
      },
      {
        id: "next",
        title: "Дождитесь подтверждения",
        description: "После оплаты мы автоматически обновим статус заказа.",
        state: "upcoming"
      }
    ];
  }

  return [
    createdStep,
    {
      id: "payment",
      title: "Ожидает оплаты",
      description: "Заказ сохранен и ждет подтверждения оплаты.",
      state: "current",
      timestamp: updatedAt
    },
    {
      id: "next",
      title: "Подготовка к обработке",
      description: "После подтверждения оплаты начнется обработка заказа.",
      state: "upcoming"
    }
  ];
}

function getTimelineDotClass(state: TimelineStepState): string {
  if (state === "completed") {
    return "bg-emerald-400";
  }
  if (state === "current") {
    return "bg-accent";
  }
  if (state === "failed") {
    return "bg-red-400";
  }
  return "bg-muted-foreground/40";
}

function getTimelineTitleClass(state: TimelineStepState): string {
  if (state === "failed") {
    return "text-red-300";
  }
  if (state === "upcoming") {
    return "text-muted-foreground";
  }
  return "text-foreground";
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
  const timeline = order ? getOrderTimeline(order) : [];

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

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Ход заказа
            </h2>
            <ol className="space-y-3">
              {timeline.map((step, index) => (
                <li key={step.id} className="flex gap-3">
                  <div className="flex flex-col items-center pt-1">
                    <span
                      className={[
                        "h-2.5 w-2.5 rounded-full",
                        getTimelineDotClass(step.state)
                      ].join(" ")}
                    />
                    {index < timeline.length - 1 && (
                      <span className="mt-1 h-full w-px bg-border/60" />
                    )}
                  </div>
                  <div className="space-y-1 pb-1">
                    <p className={["text-sm font-medium", getTimelineTitleClass(step.state)].join(" ")}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                    {step.timestamp && (
                      <p className="text-xs text-muted-foreground/80">{step.timestamp}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

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
