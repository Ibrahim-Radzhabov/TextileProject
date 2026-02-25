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
  isUpdating?: boolean;
};

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  cart,
  onClose,
  onCheckout,
  isUpdating
}) => {
  const hasItems = !!cart && cart.items.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background/95 shadow-soft-subtle backdrop-blur-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <h2 className="text-sm font-medium tracking-tight">Корзина</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Закрыть
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {!hasItems && (
                <Surface tone="subtle" className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                  <div className="h-10 w-10 rounded-2xl bg-accent-soft/40" />
                  <p className="text-sm font-medium">Корзина пуста</p>
                  <p className="text-xs text-muted-foreground">
                    Добавьте несколько вещей — мы аккуратно посчитаем всё остальное.
                  </p>
                </Surface>
              )}
              {hasItems && cart && (
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <Surface
                      key={item.id}
                      tone="subtle"
                      className="flex items-center gap-3 px-3 py-3"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.productSnapshot.media[0]?.url}
                        alt={item.productSnapshot.media[0]?.alt ?? item.productSnapshot.name}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="truncate text-xs font-medium">
                          {item.productSnapshot.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Кол-во: {item.quantity}
                        </p>
                      </div>
                      <div className="text-xs font-medium">
                        {item.lineTotal.amount.toLocaleString(undefined, {
                          style: "currency",
                          currency: item.lineTotal.currency
                        })}
                      </div>
                    </Surface>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-border/60 px-5 py-4">
              {cart && (
                <div className="mb-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Итого</span>
                  <motion.span
                    key={cart.totals.grandTotal.amount}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="font-medium"
                  >
                    {cart.totals.grandTotal.amount.toLocaleString(undefined, {
                      style: "currency",
                      currency: cart.totals.grandTotal.currency
                    })}
                  </motion.span>
                </div>
              )}
              <Button
                fullWidth
                disabled={!hasItems || isUpdating}
                onClick={onCheckout}
              >
                {isUpdating ? "Обновление..." : "Перейти к оформлению"}
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

