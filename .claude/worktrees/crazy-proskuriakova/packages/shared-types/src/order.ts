import type { CartTotals, CartItem } from "./cart";
import type { OrderLifecycleStatus } from "./order-status-transitions";

export type OrderStatus = OrderLifecycleStatus;

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
