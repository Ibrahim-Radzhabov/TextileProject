"use client";

import { create } from "zustand";
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
  setOpen: (open: boolean) => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],
  cart: undefined,
  open: false,
  isPricing: false,
  error: undefined,

  setOpen(open) {
    set({ open });
  },

  async addProduct(productId) {
    const { lines } = get();
    const existing = lines.find((l) => l.productId === productId);
    const updatedLines =
      existing != null
        ? lines.map((l) =>
            l.productId === productId ? { ...l, quantity: l.quantity + 1 } : l
          )
        : [...lines, { productId, quantity: 1 }];

    set({ lines: updatedLines, isPricing: true, error: undefined });

    try {
      const cart = await priceCart({ items: updatedLines });
      set({ cart, isPricing: false, open: true });
    } catch (error) {
      console.error(error);
      set({ isPricing: false, error: "Не удалось обновить корзину" });
    }
  }
}));

