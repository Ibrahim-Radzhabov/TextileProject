import { Button, Surface } from "@store-platform/ui";

type OrderStatusLookupCardProps = {
  defaultOrderId?: string;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  className?: string;
};

export function OrderStatusLookupCard({
  defaultOrderId,
  title = "Проверить статус заказа",
  subtitle = "Введите номер заказа и получите актуальный статус оплаты.",
  submitLabel = "Проверить",
  className
}: OrderStatusLookupCardProps) {
  return (
    <Surface className={["space-y-4 px-5 py-5", className].filter(Boolean).join(" ")}>
      <div className="space-y-1">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <form action="/order-status" method="get" className="flex flex-col gap-3 sm:flex-row">
        <input
          name="order_id"
          defaultValue={defaultOrderId}
          placeholder="Например, 8f610e25-..."
          className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
          autoComplete="off"
          spellCheck={false}
          required
        />
        <Button type="submit" className="sm:min-w-36">
          {submitLabel}
        </Button>
      </form>
    </Surface>
  );
}
