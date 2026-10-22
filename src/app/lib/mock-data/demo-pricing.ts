import { mockCartItems } from "./cart-items";

export const DEMO_COUPONS: Readonly<Record<string, number>> = {
  BEMVINDO10: 10,
  FRETEGRATIS: 0,
};

export function calculateDemoTotals(
  couponCode: string | null = null
) {
  if (
    couponCode !== null &&
    !Object.hasOwn(DEMO_COUPONS, couponCode)
  ) {
    return null;
  }

  const discountPercent =
    couponCode === null ? 0 : DEMO_COUPONS[couponCode];

  const subtotalCents = mockCartItems.reduce(
    (sum, item) =>
      sum + Math.round(item.price * 100) * item.quantity,
    0
  );

  const totalCents = Math.round(
    subtotalCents * (1 - discountPercent / 100)
  );

  return {
    subtotalCents,
    discountPercent,
    totalCents,
  };
}