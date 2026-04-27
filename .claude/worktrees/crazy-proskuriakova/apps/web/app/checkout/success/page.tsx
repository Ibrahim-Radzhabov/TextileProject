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
      className="flex min-h-[66vh] items-center justify-center px-4 py-6 sm:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Surface className="w-full max-w-lg rounded-[1.1rem] border border-border/45 bg-card/82 px-5 py-6 text-center sm:px-7 sm:py-8">
        <motion.div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/45 bg-emerald-500/18 text-emerald-200"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M6 12.5L10 16.5L18 8.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
        <p className="ui-kicker mb-2">Order confirmed</p>
        <h1 className="ui-title mb-2 text-[1.6rem] leading-tight sm:text-[1.9rem]">Заказ оформлен</h1>
        <p className="mx-auto mb-4 max-w-[34ch] text-sm text-muted-foreground sm:text-[15px]">
          Мы отправили подтверждение на email. Дальше можно вернуться к подбору тканей и продолжить комплектование.
        </p>
        {orderId && (
          <div className="mx-auto mb-5 inline-flex max-w-full items-center gap-2 rounded-[10px] border border-border/50 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground sm:text-sm">
            <span className="ui-kicker text-[10px] sm:text-[11px]">Order</span>
            <span className="truncate font-medium text-foreground">{orderId}</span>
          </div>
        )}
        <div className="flex flex-col justify-center gap-2.5 sm:flex-row">
          <Link
            href="/catalog"
            className="inline-flex h-11 items-center justify-center rounded-[10px] border border-accent/70 bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Продолжить в каталог
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-[10px] border border-border/55 bg-card/70 px-5 text-sm font-medium text-foreground transition-colors hover:border-border/78 hover:bg-card/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            На главную
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
