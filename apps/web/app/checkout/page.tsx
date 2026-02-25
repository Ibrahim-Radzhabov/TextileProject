"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Surface } from "@store-platform/ui";
import { useCartStore } from "@/store/cart-store";
import { checkout } from "@/lib/api-client";

const checkoutSchema = z.object({
  email: z.string().email("Введите корректный email"),
  name: z.string().min(2, "Введите имя"),
  address_line1: z.string().min(4, "Укажите улицу и дом"),
  address_city: z.string().min(2, "Укажите город"),
  address_country: z.string().min(2, "Укажите страну"),
  postal_code: z.string().min(2, "Укажите индекс")
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, lines } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      name: "",
      address_line1: "",
      address_city: "",
      address_country: "",
      postal_code: ""
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
      await checkout({
        cart: {
          items: lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity
          }))
        },
        customer: values
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1600);
    } catch (e) {
      console.error(e);
      setError("Не удалось оформить заказ. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalFormatted =
    cart?.totals.grandTotal.amount.toLocaleString(undefined, {
      style: "currency",
      currency: cart.totals.grandTotal.currency
    }) ?? "—";

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Surface className="max-w-md px-6 py-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-3xl bg-emerald-400/20" />
          <h1 className="mb-2 text-lg font-semibold tracking-tight">
            Заказ оформлен
          </h1>
          <p className="text-sm text-muted-foreground">
            Мы отправили детали заказа на вашу почту. Можно спокойно закрыть вкладку —
            все сохранено.
          </p>
        </Surface>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <h1 className="text-2xl font-semibold tracking-tight">Оформление заказа</h1>
        <p className="text-sm text-muted-foreground">
          Пара аккуратных деталей — и заказ поедет к вам.
        </p>

        <Surface tone="subtle" className="space-y-4 px-4 py-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none ring-0 focus:border-accent focus:ring-1 focus:ring-ring"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Имя
            </label>
            <input
              type="text"
              autoComplete="name"
              className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none ring-0 focus:border-accent focus:ring-1 focus:ring-ring"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Улица и дом
            </label>
            <input
              type="text"
              autoComplete="address-line1"
              className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none ring-0 focus:border-accent focus:ring-1 focus:ring-ring"
              {...register("address_line1")}
            />
            {errors.address_line1 && (
              <p className="text-xs text-red-400">
                {errors.address_line1.message}
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Город
              </label>
              <input
                type="text"
                autoComplete="address-level2"
                className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none ring-0 focus:border-accent focus:ring-1 focus:ring-ring"
                {...register("address_city")}
              />
              {errors.address_city && (
                <p className="text-xs text-red-400">
                  {errors.address_city.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Индекс
              </label>
              <input
                type="text"
                autoComplete="postal-code"
                className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none ring-0 focus:border-accent focus:ring-1 focus:ring-ring"
                {...register("postal_code")}
              />
              {errors.postal_code && (
                <p className="text-xs text-red-400">
                  {errors.postal_code.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Страна
            </label>
            <input
              type="text"
              autoComplete="country-name"
              className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none ring-0 focus:border-accent focus:ring-1 focus:ring-ring"
              {...register("address_country")}
            />
            {errors.address_country && (
              <p className="text-xs text-red-400">
                {errors.address_country.message}
              </p>
            )}
          </div>
        </Surface>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <Button
          type="submit"
          fullWidth
          disabled={submitting}
        >
          {submitting ? "Оформляем..." : "Подтвердить заказ"}
        </Button>
      </form>

      <Surface tone="subtle" className="space-y-4 px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Заказ
          </span>
          <span className="text-sm font-medium">{totalFormatted}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Оплата произойдёт безопасным способом. Никаких лишних писем и пушей — только
          подтверждение и трекинг доставки.
        </p>
      </Surface>
    </div>
  );
}

