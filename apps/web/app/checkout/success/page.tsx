"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Surface } from "@store-platform/ui";
import { useCartStore } from "@/store/cart-store";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <motion.div
      className="flex min-h-[60vh] items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Surface className="w-full max-w-md px-6 py-8 text-center">
        <motion.div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
        />
        <h1 className="mb-2 text-lg font-semibold tracking-tight">
          Заказ оформлен
        </h1>
        {orderId && (
          <p className="mb-1 text-xs text-muted-foreground">
            Номер заказа: {orderId}
          </p>
        )}
        <p className="mb-6 text-sm text-muted-foreground">
          Детали отправлены на почту. Можно закрыть вкладку или вернуться в магазин.
        </p>
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href={orderId ? `/order-status?order_id=${encodeURIComponent(orderId)}` : "/order-status"}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border/60 px-5 text-sm font-medium text-foreground shadow-soft-subtle transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Проверить статус
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-accent/60 bg-accent px-5 text-sm font-medium text-white shadow-soft-subtle transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Вернуться на главную
          </Link>
        </div>
      </Surface>
    </motion.div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted/40" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
