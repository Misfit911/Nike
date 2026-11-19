export const DEMO_DELIVERY_RETURNS =
  "This demonstration does not promise a delivery day or a pickup time. The fee, or free delivery, is the amount shown at checkout. Pickup shows no delivery fee. An unworn item may be brought back to the store within 30 days with the order number. The shop decides whether to accept the return.";

export function bagDeliveryNote(input: { feeLabel: string; thresholdLabel: string; free: boolean }) {
  const timing = "This demonstration does not promise a delivery day or a pickup time.";
  if (input.free) {
    return `Checkout shows free delivery for this bag. Pickup also shows no delivery fee. ${timing}`;
  }
  return `Checkout shows a delivery fee of ${input.feeLabel}. Orders of ${input.thresholdLabel} or more show free delivery. Pickup shows no delivery fee. ${timing}`;
}
