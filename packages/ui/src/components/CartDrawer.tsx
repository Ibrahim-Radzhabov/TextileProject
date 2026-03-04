"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Cart } from "@store-platform/shared-types";
import { Button } from "./Button";
import { Surface } from "./Surface";

export type CartDrawerProps = {
  open: boolean;
  cart?: Cart;
  onClose: () => void;
  onCheckout: () => void;
  onIncrement?: (productId: string) => void;
  onDecrement?: (productId: string) => void;
  onRemove?: (productId: string) => void;
  isUpdating?: boolean;
  error?: string | null;
};

const itemVariants = {
  hidden: { opacity: 0, x: 8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.2 }
  }),
  exit: { opacity: 0, x: -8, transition: { duration: 0.15 } }
};

const CURRENCY_LOCALE = "ru-RU";

function formatMoney(amount: number, currency: string): string {
  return amount.toLocaleString(CURRENCY_LOCALE, {
    style: "currency",
    currency
  });
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  cart,
  onClose,
  onCheckout,
  onIncrement,
  onDecrement,
  onRemove,
  isUpdating,
  error
}) => {
  const hasItems = !!cart && cart.items.length > 0;
  const itemsCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  const subtotal = cart?.totals.subtotal;
  const grandTotal = cart?.totals.grandTotal;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[24.5rem] flex-col border-l border-border/35 bg-card/95 backdrop-blur-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="relative shrink-0 overflow-hidden border-b border-border/40 px-4 py-4 sm:px-5">
              <div className="relative z-10 flex items-center justify-between gap-3">
                <h2 className="ui-title-display text-[2rem] leading-none text-foreground">Ваш заказ</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-border/45 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-border/70 hover:text-foreground"
                  aria-label="Закрыть корзину"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-400"
                >
                  {error}
                </motion.div>
              )}
              {!hasItems && isUpdating && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="skeleton-shimmer h-[92px] rounded-xl border border-border/55 bg-muted/25"
                    />
                  ))}
                </div>
              )}
              {!hasItems && !isUpdating && (
                <Surface tone="subtle" className="relative overflow-hidden px-5 py-9 text-center">
                  <div className="relative z-10 mx-auto flex max-w-[250px] flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border/45 bg-card/55">
                      <span className="ui-kicker">
                        Cart
                      </span>
                    </div>
                    <p className="text-sm font-medium">Корзина пуста</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Добавьте товары из каталога. Здесь появятся позиции, сумма и оформление.
                    </p>
                  </div>
                </Surface>
              )}
              {hasItems && cart && (
                <div className="space-y-2.5">
                  <AnimatePresence mode="sync">
                    {cart.items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        custom={index}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        <Surface tone="subtle" className="flex items-center gap-3 px-3 py-3 sm:px-3.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.productSnapshot.media[0]?.url}
                            alt={item.productSnapshot.media[0]?.alt ?? item.productSnapshot.name}
                            className="h-16 w-16 shrink-0 rounded-md object-cover"
                          />
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <p className="truncate text-sm font-medium tracking-tight text-foreground">
                              {item.productSnapshot.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} шт.
                            </p>
                            <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                              <button
                                type="button"
                                className="rounded-md border border-border/60 px-1.5 py-0.5 text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground"
                                onClick={() => onDecrement?.(item.productId)}
                                disabled={isUpdating}
                              >
                                -
                              </button>
                              <span className="min-w-4 text-center text-muted-foreground">{item.quantity}</span>
                              <button
                                type="button"
                                className="rounded-md border border-border/60 px-1.5 py-0.5 text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground"
                                onClick={() => onIncrement?.(item.productId)}
                                disabled={isUpdating}
                              >
                                +
                              </button>
                              <button
                                type="button"
                                className="ml-1 text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
                                onClick={() => onRemove?.(item.productId)}
                                disabled={isUpdating}
                              >
                                Удалить
                              </button>
                            </div>
                          </div>
                          <div className="shrink-0 text-base font-semibold tracking-tight text-foreground">
                            {formatMoney(item.lineTotal.amount, item.lineTotal.currency)}
                          </div>
                        </Surface>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
            <div className="shrink-0 border-t border-border/40 px-4 py-4 sm:px-5 sm:py-5">
              {cart && (
                <div className="mb-4 space-y-2.5 rounded-md border border-border/38 bg-card/70 px-3.5 py-3">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Товаров</span>
                    <span>{itemsCount}</span>
                  </div>
                  {subtotal && (
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Подытог</span>
                      <span>{formatMoney(subtotal.amount, subtotal.currency)}</span>
                    </div>
                  )}
                  {grandTotal && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Итого:</span>
                      <motion.span
                        key={grandTotal.amount}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="text-[1.8rem] font-semibold leading-none"
                      >
                        {formatMoney(grandTotal.amount, grandTotal.currency)}
                      </motion.span>
                    </div>
                  )}
                </div>
              )}
              <Button
                fullWidth
                disabled={!hasItems || isUpdating}
                onClick={onCheckout}
                className="h-11 rounded-[6px] bg-accent text-white hover:bg-accent/92"
              >
                {isUpdating ? "Обновление…" : "Оформить заказ"}
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="mt-2.5 h-10 w-full rounded-[6px] border border-border/55 px-3 text-sm text-foreground transition-colors hover:bg-card/86"
              >
                Перейти в корзину
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
