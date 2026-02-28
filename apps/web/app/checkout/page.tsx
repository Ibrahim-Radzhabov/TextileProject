"use client";

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

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, lines } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef(createIdempotencyKey());

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
      router.push("/checkout/success?order_id=" + encodeURIComponent(res.orderId));
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
    <div className="grid gap-6 pb-8 sm:gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Оформление заказа</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Контакты и адрес — дальше всё сделаем мы.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        <Surface tone="subtle" className="space-y-4 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Контакт
          </p>
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="checkout-email" className="text-xs font-medium text-muted-foreground">
                Email
              </label>
              <input
                id="checkout-email"
                type="email"
                autoComplete="email"
                className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label htmlFor="checkout-name" className="text-xs font-medium text-muted-foreground">
                Имя
              </label>
              <input
                id="checkout-name"
                type="text"
                autoComplete="name"
                className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>
          </div>
        </Surface>

        <Surface tone="subtle" className="space-y-4 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Адрес доставки
          </p>
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="checkout-address-line1" className="text-xs font-medium text-muted-foreground">
                Улица и дом
              </label>
              <input
                id="checkout-address-line1"
                type="text"
                autoComplete="address-line1"
                className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
                {...register("addressLine1")}
              />
              {errors.addressLine1 && (
                <p className="text-xs text-red-400">
                  {errors.addressLine1.message}
                </p>
              )}
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
                  className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
                  {...register("addressCity")}
                />
                {errors.addressCity && (
                  <p className="text-xs text-red-400">
                    {errors.addressCity.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label htmlFor="checkout-postal-code" className="text-xs font-medium text-muted-foreground">
                  Индекс
                </label>
                <input
                  id="checkout-postal-code"
                  type="text"
                  autoComplete="postal-code"
                  className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
                  {...register("postalCode")}
                />
                {errors.postalCode && (
                  <p className="text-xs text-red-400">
                    {errors.postalCode.message}
                  </p>
                )}
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
                className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
                {...register("addressCountry")}
              />
              {errors.addressCountry && (
                <p className="text-xs text-red-400">
                  {errors.addressCountry.message}
                </p>
              )}
            </div>
          </div>
        </Surface>

        <Button
          type="submit"
          fullWidth
          disabled={submitting}
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Оформляем…
            </span>
          ) : (
            "Подтвердить заказ"
          )}
        </Button>
      </form>

      <Surface tone="subtle" className="h-fit space-y-4 px-4 py-4 md:sticky md:top-24">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Итого
          </span>
          <span className="text-sm font-medium">{totalFormatted}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Оплата — безопасно. Подтверждение и трекинг придут на почту.
        </p>
      </Surface>
    </div>
  );
}
