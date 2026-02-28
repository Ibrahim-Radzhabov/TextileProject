import transitionsRaw from "./order-status-transitions.json";

export type OrderLifecycleStatus =
  | "pending"
  | "redirect"
  | "confirmed"
  | "paid"
  | "processing"
  | "shipped"
  | "failed"
  | "cancelled";

export type ManualOrderStatus = "processing" | "shipped" | "cancelled";

const orderStatuses: readonly OrderLifecycleStatus[] = [
  "pending",
  "redirect",
  "confirmed",
  "paid",
  "processing",
  "shipped",
  "failed",
  "cancelled"
];

const normalizedTransitions = orderStatuses.reduce<Record<OrderLifecycleStatus, readonly ManualOrderStatus[]>>(
  (accumulator, status) => {
    const allowed = transitionsRaw[status] ?? [];
    const normalizedAllowed: ManualOrderStatus[] = [];
    for (const value of allowed) {
      if (value === "processing" || value === "shipped" || value === "cancelled") {
        normalizedAllowed.push(value);
      }
    }
    accumulator[status] = normalizedAllowed;
    return accumulator;
  },
  {} as Record<OrderLifecycleStatus, readonly ManualOrderStatus[]>
);

export const orderStatusTransitions: Readonly<Record<OrderLifecycleStatus, readonly ManualOrderStatus[]>> =
  normalizedTransitions;

export function getAllowedManualStatuses(status: OrderLifecycleStatus): readonly ManualOrderStatus[] {
  return orderStatusTransitions[status] ?? [];
}
