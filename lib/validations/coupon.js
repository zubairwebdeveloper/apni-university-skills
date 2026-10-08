// lib/validations/coupon.js
import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "@/config/currencies";
import { endOfDayUTC, startOfDayUTC } from "@/lib/utils/date";
import { num, optNum } from "./shared";

const docId = z.string().regex(/^[A-Za-z0-9]{10,40}$/);
const day = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Use a valid date");
const blank = (v) => (v === "" || v == null ? null : v);

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(
        /^[A-Z0-9_-]{3,24}$/,
        "Use 3–24 letters, numbers, hyphens or underscores.",
      ),
    description: z.string().trim().max(200),
    type: z.enum(["percentage", "fixed"]),
    value: num(0.01, 100000),
    currency: z.enum(SUPPORTED_CURRENCIES),
    minPurchase: num(0, 100000),
    maxDiscount: optNum,
    usageLimit: z.preprocess(
      blank,
      z.coerce
        .number({ message: "Enter a number" })
        .int("Use a whole number")
        .min(1)
        .max(10_000_000)
        .nullable(),
    ),
    perUserLimit: num(1, 100).pipe(z.int("Use a whole number")),
    startsAt: day,
    expiresAt: day,
    courseIds: z.array(docId).max(200),
    categoryIds: z.array(docId).max(50),
  })
  .superRefine((d, ctx) => {
    if (d.type === "percentage" && d.value > 100)
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "A percentage can't exceed 100.",
      });
    if (d.startsAt && d.expiresAt && d.startsAt > d.expiresAt)
      ctx.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "The expiry must be after the start.",
      });
  });

// Form fields -> stored shape. Fixed coupons carry a currency; percentage coupons may carry a cap.
export const toCouponData = ({ startsAt, expiresAt, ...r }) => ({
  ...r,
  currency: r.type === "fixed" ? r.currency : null,
  maxDiscount: r.type === "percentage" ? r.maxDiscount : null,
  startsAt: startsAt ? startOfDayUTC(startsAt) : null,
  expiresAt: expiresAt ? endOfDayUTC(expiresAt) : null,
});

