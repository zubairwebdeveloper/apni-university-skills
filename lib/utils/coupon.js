// lib/utils/coupon.js
import { formatPrice } from "./format";
export const describeCoupon = (c) =>
  c.type === "fixed"
    ? `${formatPrice(c.value, c.currency)} off`
    : `${c.value}% off${c.maxDiscount ? ` (max ${formatPrice(c.maxDiscount, "USD")})` : ""}`;

