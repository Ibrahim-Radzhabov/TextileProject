"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button, Surface } from "@store-platform/ui";
import { useCartStore } from "@/store/cart-store";
import { ApiError, checkout } from "@/lib/api-client";

const checkoutSchema = z.object({
  email: z.string().email("Введите корректный email"),
  name: z.string().min(2, "Введите имя"),
  addressLine1: z.string().min(4, "Укажите улицу и дом"),
  addressCity: z.string().min(2, "Укажите город"),
  addressCountry: z.string().min(2, "Укажите страну"),
  postalCode: z.string().min(2, "Укажите индекс")
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

function createIdempotencyKey(): string {
  return `checkout-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function formatMoney(amount: number, currency: string): string {
  return amount.toLocaleString(undefined, {
    style: "currency",
    currency
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, lines, isPricing } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef(createIdempotencyKey());
  const hasItems = lines.length > 0;
  const itemCount = lines.reduce((acc, line) => acc + line.quantity, 0);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      name: "",
      addressLine1: "",
      addressCity: "",
      addressCountry: "",
      postalCode: ""
    }
  });

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!lines.length) {
      setError("Корзина пуста.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await checkout({
        idempotencyKey: idempotencyKeyRef.current,
        cart: {
          items: lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity
          }))
        },
        customer: values
      });
      if (res.status === "redirect" && res.redirectUrl) {
        window.location.href = res.redirectUrl;
        return;
      }
      router.push(`/checkout/success?order_id=${encodeURIComponent(res.orderId)}`);
    } catch (e) {
      console.error(e);
      if (e instanceof ApiError && e.status === 409) {
        idempotencyKeyRef.current = createIdempotencyKey();
        setError("Конфликт повторной отправки. Мы обновили ключ запроса, повторите оформление.");
      } else {
        setError("Не удалось оформить заказ. Попробуйте ещё раз.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const totalFormatted =
    cart?.totals.grandTotal.amount.toLocaleString(undefined, {
      style: "currency",
      currency: cart.totals.grandTotal.currency
    }) ?? "—";

  return (
    <div className="grid gap-6 pb-10 sm:gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Surface tone="elevated" className="relative overflow-hidden rounded-xl px-5 py-6 sm:px-6">
          <div className="relative z-10 space-y-3">
            <div>
              <h1 className="ui-title text-2xl sm:text-3xl">Оформление заказа</h1>
              <p className="ui-subtle mt-1 text-sm">
                Контакты и адрес. В корзине {itemCount} поз.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="ui-kicker rounded-[10px] border border-border/45 bg-card/45 px-2.5 py-1">Безопасная оплата</span>
              <span className="ui-kicker rounded-[10px] border border-border/45 bg-card/45 px-2.5 py-1">Поддержка магазина</span>
              <span className="ui-kicker rounded-[10px] border border-border/45 bg-card/45 px-2.5 py-1">Fast checkout</span>
            </div>
          </div>
        </Surface>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        {!hasItems && (
          <Surface tone="subtle" className="space-y-4 px-5 py-5">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold tracking-tight">Корзина пуста</h2>
              <p className="text-sm text-muted-foreground">
                Добавьте товары в корзину и вернитесь к оформлению.
              </p>
            </div>
            <Button asChild>
              <Link href="/catalog">Перейти в каталог</Link>
            </Button>
          </Surface>
        )}

        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Surface tone="subtle" className="space-y-4 rounded-xl px-5 py-5">
            <p className="ui-kicker">Контакт</p>
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="checkout-email" className="text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  autoComplete="email"
                  className="h-10 w-full rounded-[10px] border border-border/55 bg-input/80 px-3 text-sm outline-none transition-colors focus:border-border/80 focus:ring-1 focus:ring-ring"
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>
              <div className="space-y-1">
                <label htmlFor="checkout-name" className="text-xs font-medium text-muted-foreground">
                  Имя
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  autoComplete="name"
                  className="h-10 w-full rounded-[10px] border border-border/55 bg-input/80 px-3 text-sm outline-none transition-colors focus:border-border/80 focus:ring-1 focus:ring-ring"
                  {...register("name")}
                />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>
            </div>
          </Surface>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Surface tone="subtle" className="space-y-4 rounded-xl px-5 py-5">
            <p className="ui-kicker">Адрес доставки</p>
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="checkout-address-line1" className="text-xs font-medium text-muted-foreground">
                  Улица и дом
                </label>
                <input
                  id="checkout-address-line1"
                  type="text"
                  autoComplete="address-line1"
                  className="h-10 w-full rounded-[10px] border border-border/55 bg-input/80 px-3 text-sm outline-none transition-colors focus:border-border/80 focus:ring-1 focus:ring-ring"
                  {...register("addressLine1")}
                />
                {errors.addressLine1 && <p className="text-xs text-red-400">{errors.addressLine1.message}</p>}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="checkout-city" className="text-xs font-medium text-muted-foreground">
                    Город
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    autoComplete="address-level2"
                    className="h-10 w-full rounded-[10px] border border-border/55 bg-input/80 px-3 text-sm outline-none transition-colors focus:border-border/80 focus:ring-1 focus:ring-ring"
                    {...register("addressCity")}
                  />
                  {errors.addressCity && <p className="text-xs text-red-400">{errors.addressCity.message}</p>}
                </div>
                <div className="space-y-1">
                  <label htmlFor="checkout-postal-code" className="text-xs font-medium text-muted-foreground">
                    Индекс
                  </label>
                  <input
                    id="checkout-postal-code"
                    type="text"
                    autoComplete="postal-code"
                    className="h-10 w-full rounded-[10px] border border-border/55 bg-input/80 px-3 text-sm outline-none transition-colors focus:border-border/80 focus:ring-1 focus:ring-ring"
                    {...register("postalCode")}
                  />
                  {errors.postalCode && <p className="text-xs text-red-400">{errors.postalCode.message}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="checkout-country" className="text-xs font-medium text-muted-foreground">
                  Страна
                </label>
                <input
                  id="checkout-country"
                  type="text"
                  autoComplete="country-name"
                  className="h-10 w-full rounded-[10px] border border-border/55 bg-input/80 px-3 text-sm outline-none transition-colors focus:border-border/80 focus:ring-1 focus:ring-ring"
                  {...register("addressCountry")}
                />
                {errors.addressCountry && <p className="text-xs text-red-400">{errors.addressCountry.message}</p>}
              </div>
            </div>
          </Surface>
        </motion.div>

        <Button type="submit" fullWidth disabled={submitting || !hasItems || isPricing}>
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Оформляем…
            </span>
          ) : (
            `Подтвердить заказ ${totalFormatted !== "—" ? `• ${totalFormatted}` : ""}`
          )}
        </Button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.06 }}
      >
        <Surface tone="subtle" className="h-fit space-y-4 rounded-xl px-4 py-4 sm:px-5 md:sticky md:top-24">
          <div className="flex items-center justify-between">
            <span className="ui-kicker">Итого</span>
            <span className="text-sm font-semibold">{totalFormatted}</span>
          </div>

          <div className="space-y-2">
            {cart?.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 rounded-[10px] border border-border/45 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{item.productSnapshot.name}</p>
                  <p className="text-[11px] text-muted-foreground">x{item.quantity}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatMoney(item.lineTotal.amount, item.lineTotal.currency)}
                </p>
              </div>
            ))}

            {!cart && hasItems && (
              <div className="space-y-2">
                {Array.from({ length: Math.min(lines.length, 3) }).map((_, index) => (
                  <div key={index} className="skeleton-shimmer h-11 rounded-lg border border-border/50 bg-muted/20" />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[10px] border border-border/45 bg-card/45 px-3 py-2 text-xs text-muted-foreground">
            Оплата безопасна. Подтверждение и трекинг придут на email.
          </div>
        </Surface>
      </motion.div>
    </div>
  );
}
