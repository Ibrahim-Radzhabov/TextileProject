import type { CartTotals, CartItem } from "./cart";

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";

export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  items: CartItem[];
  totals: CartTotals;
  createdAt: string;
  currency: string;
  customerEmail: string;
  metadata?: Record<string, string | number | boolean>;
};

