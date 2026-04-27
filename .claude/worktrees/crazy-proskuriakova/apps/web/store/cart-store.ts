"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Cart } from "@store-platform/shared-types";
import { priceCart } from "@/lib/api-client";

type CartLine = {
  productId: string;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  cart?: Cart;
  open: boolean;
  isPricing: boolean;
  error?: string;
  addProduct: (productId: string) => Promise<void>;
  incrementProduct: (productId: string) => Promise<void>;
  decrementProduct: (productId: string) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  hydrateCartFromLines: () => Promise<void>;
  setOpen: (open: boolean) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => {
      const priceLines = async (nextLines: CartLine[], openOnSuccess: boolean) => {
        set({
          lines: nextLines,
          isPricing: nextLines.length > 0,
          error: undefined
        });

        if (nextLines.length === 0) {
          set({ cart: undefined, isPricing: false });
          return;
        }

        try {
          const cart = await priceCart({ items: nextLines });
          set((state) => ({
            cart,
            isPricing: false,
            open: openOnSuccess ? true : state.open
          }));
        } catch (error) {
          console.error(error);
          set({ isPricing: false, error: "Не удалось обновить корзину" });
        }
      };

      return {
        lines: [],
        cart: undefined,
        open: false,
        isPricing: false,
        error: undefined,

        setOpen(open) {
          set({ open });
        },

        clearCart() {
          set({ lines: [], cart: undefined, error: undefined, isPricing: false });
        },

        async hydrateCartFromLines() {
          const { lines } = get();
          await priceLines(lines, false);
        },

        async addProduct(productId) {
          const { lines } = get();
          const existing = lines.find((line) => line.productId === productId);
          const nextLines =
            existing != null
              ? lines.map((line) =>
                  line.productId === productId
                    ? { ...line, quantity: line.quantity + 1 }
                    : line
                )
              : [...lines, { productId, quantity: 1 }];

          await priceLines(nextLines, true);
        },

        async incrementProduct(productId) {
          const { lines } = get();
          const nextLines = lines.map((line) =>
            line.productId === productId
              ? { ...line, quantity: line.quantity + 1 }
              : line
          );
          await priceLines(nextLines, false);
        },

        async decrementProduct(productId) {
          const { lines } = get();
          const nextLines = lines
            .map((line) =>
              line.productId === productId
                ? { ...line, quantity: Math.max(0, line.quantity - 1) }
                : line
            )
            .filter((line) => line.quantity > 0);
          await priceLines(nextLines, false);
        },

        async removeProduct(productId) {
          const { lines } = get();
          const nextLines = lines.filter((line) => line.productId !== productId);
          await priceLines(nextLines, false);
        }
      };
    },
    {
      name: "store-platform-cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lines: state.lines
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error(error);
        }
        if (state) {
          void state.hydrateCartFromLines();
        }
      }
    }
  )
);
