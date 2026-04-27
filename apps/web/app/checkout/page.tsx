"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@store-platform/ui";
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

const CURRENCY_LOCALE = "ru-RU";

function createIdempotencyKey(): string {
  return `checkout-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function formatMoney(amount: number, currency: string): string {
  return amount.toLocaleString(CURRENCY_LOCALE, {
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
    cart?.totals.grandTotal.amount.toLocaleString(CURRENCY_LOCALE, {
      style: "currency",
      currency: cart.totals.grandTotal.currency
    }) ?? "—";
  const isSubmitDisabled = submitting || !hasItems || isPricing;

  const inputClass = "h-11 w-full border-b border-border/30 bg-transparent px-0 text-sm outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-foreground/40";

  return (
    <div className="grid gap-10 pb-28 sm:pb-32 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-16 md:pb-10">
      <motion.form
        id="checkout-form"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <header className="space-y-2 pt-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Оформление</p>
          <h1 className="font-serif text-[1.6rem] font-normal tracking-tight sm:text-[2rem]">
            Оформление заказа
          </h1>
          <p className="text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? "позиция" : "позиций"} в корзине
          </p>
        </header>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-red-400/30 pb-3 text-sm text-red-500"
          >
            {error}
          </motion.div>
        )}

        {!hasItems && (
          <div className="space-y-4 border-b border-border/20 pb-6">
            <p className="text-sm text-muted-foreground">
              Добавьте товары в корзину и вернитесь к оформлению.
            </p>
            <Button asChild>
              <Link href="/catalog">Перейти в каталог</Link>
            </Button>
          </div>
        )}

        <fieldset className="space-y-5 border-b border-border/20 pb-8">
          <legend className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Контакт</legend>
          <div className="space-y-1">
            <label htmlFor="checkout-email" className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/70">
              Email
            </label>
            <input
              id="checkout-email"
              type="email"
              autoComplete="email"
              className={inputClass}
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="checkout-name" className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/70">
              Имя
            </label>
            <input
              id="checkout-name"
              type="text"
              autoComplete="name"
              className={inputClass}
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
        </fieldset>

        <fieldset className="space-y-5 border-b border-border/20 pb-8">
          <legend className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Адрес доставки</legend>
          <div className="space-y-1">
            <label htmlFor="checkout-address-line1" className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/70">
              Улица и дом
            </label>
            <input
              id="checkout-address-line1"
              type="text"
              autoComplete="address-line1"
              className={inputClass}
              {...register("addressLine1")}
            />
            {errors.addressLine1 && <p className="text-xs text-red-500">{errors.addressLine1.message}</p>}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="checkout-city" className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/70">
                Город
              </label>
              <input
                id="checkout-city"
                type="text"
                autoComplete="address-level2"
                className={inputClass}
                {...register("addressCity")}
              />
              {errors.addressCity && <p className="text-xs text-red-500">{errors.addressCity.message}</p>}
            </div>
            <div className="space-y-1">
              <label htmlFor="checkout-postal-code" className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/70">
                Индекс
              </label>
              <input
                id="checkout-postal-code"
                type="text"
                autoComplete="postal-code"
                className={inputClass}
                {...register("postalCode")}
              />
              {errors.postalCode && <p className="text-xs text-red-500">{errors.postalCode.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="checkout-country" className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/70">
              Страна
            </label>
            <input
              id="checkout-country"
              type="text"
              autoComplete="country-name"
              className={inputClass}
              {...register("addressCountry")}
            />
            {errors.addressCountry && <p className="text-xs text-red-500">{errors.addressCountry.message}</p>}
          </div>
        </fieldset>

        <Button type="submit" fullWidth ripple className="hidden md:inline-flex" disabled={isSubmitDisabled}>
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

      <motion.aside
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.06 }}
      >
        <div className="h-fit space-y-6 pt-4 md:sticky md:top-24">
          <div className="space-y-1 border-b border-border/20 pb-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Ваш заказ</p>
            <div className="flex items-end justify-between gap-3 pt-2">
              <span className="text-sm text-muted-foreground">Итого</span>
              <span className="font-serif text-[1.4rem] font-normal tracking-tight">{totalFormatted}</span>
            </div>
          </div>

          <div className="max-h-56 space-y-3 overflow-auto md:max-h-none md:overflow-visible">
            {cart?.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 border-b border-border/10 pb-3">
                <div className="min-w-0">
                  <p className="truncate text-sm tracking-tight">{item.productSnapshot.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/60">×{item.quantity}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatMoney(item.lineTotal.amount, item.lineTotal.currency)}
                </p>
              </div>
            ))}

            {!cart && hasItems && (
              <div className="space-y-3">
                {Array.from({ length: Math.min(lines.length, 3) }).map((_, index) => (
                  <div key={index} className="h-10 animate-pulse border-b border-border/10" />
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground/60">
            Безопасная оплата · Подтверждение на email · {itemCount} поз.
          </p>
        </div>
      </motion.aside>

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/20 bg-background/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm md:hidden">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Итого</span>
          <span className="text-sm font-medium">{totalFormatted}</span>
        </div>
        <Button type="submit" form="checkout-form" fullWidth ripple disabled={isSubmitDisabled}>
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Оформляем…
            </span>
          ) : (
            `Подтвердить заказ ${totalFormatted !== "—" ? `• ${totalFormatted}` : ""}`
          )}
        </Button>
      </div>
    </div>
  );
}
