import type { Money, Product } from "./product";

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
  productSnapshot: Pick<Product, "name" | "slug" | "media">;
};

export type CartTotals = {
  subtotal: Money;
  discountTotal?: Money;
  shippingTotal?: Money;
  taxTotal?: Money;
  grandTotal: Money;
};

export type Cart = {
  id: string;
  items: CartItem[];
  totals: CartTotals;
  currency: string;
};
