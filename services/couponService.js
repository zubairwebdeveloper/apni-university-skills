// services/couponService.js
import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";
import { AppError } from "@/lib/errors";

export const MIN_CHARGE = 0.5; // Stripe can't charge less
const INVALID = "This coupon isn't valid for this course.";
const ms = (v) => v?.toMillis?.() ?? v ?? null;
const round2 = (n) => Math.round(n * 100) / 100;
const red = () => db.collection("couponRedemptions");

export function normalizeCode(raw) {
  const c = String(raw ?? "")
    .trim()
    .toUpperCase();
  return /^[A-Z0-9_-]{3,24}$/.test(c) ? c : null;
}

// Returns the discount, or null when this coupon can't apply. Pure: no I/O.
function discountFor(c, course, price) {
  const now = Date.now();
  if (c.status !== "published") return null;
  if (ms(c.startsAt) && ms(c.startsAt) > now) return null;
  if (ms(c.expiresAt) && ms(c.expiresAt) < now) return null;
  if (
    (c.courseIds?.length || c.categoryIds?.length) &&
    !c.courseIds?.includes(course.id) &&
    !c.categoryIds?.includes(course.categoryId)
  )
    return null;
  if (price < (c.minPurchase ?? 0)) return null;
  let d;
  if (c.type === "fixed") {
    if (c.currency !== course.currency) return null;
    d = c.value;
  } else {
    d = (price * c.value) / 100;
    if (c.maxDiscount) d = Math.min(d, c.maxDiscount);
  }
  d = round2(Math.min(d, price));
  return d > 0 && price - d >= MIN_CHARGE ? d : null;
}

const usedByStudent = (couponId, studentId, limit) =>
  red()
    .where("couponId", "==", couponId)
    .where("studentId", "==", studentId)
    .where("status", "in", ["reserved", "redeemed"])
    .select()
    .limit(limit);

export const couponService = {
  /** Validates without reserving. Every failure for an unknown or unusable code gets the same message. */
  async quote({ code, course, price, studentId }) {
    const normal = normalizeCode(code);
    if (!normal) throw new AppError(INVALID, 400);
    const snap = await db
      .collection("coupons")
      .where("slug", "==", normal.toLowerCase())
      .limit(1)
      .get();
    const coupon = snap.empty
      ? null
      : { id: snap.docs[0].id, ...snap.docs[0].data() };
    const discount = coupon && discountFor(coupon, course, price);
    if (!discount) throw new AppError(INVALID, 400);
    if (
      coupon.usageLimit != null &&
      (coupon.reserved ?? 0) + (coupon.redeemed ?? 0) >= coupon.usageLimit
    )
      throw new AppError("This coupon has reached its usage limit.", 409);
    if (
      (
        await usedByStudent(
          coupon.id,
          studentId,
          coupon.perUserLimit ?? 1,
        ).get()
      ).size >= (coupon.perUserLimit ?? 1)
    )
      throw new AppError("You've already used this coupon.", 409);
    return { coupon, discount, final: round2(price - discount) };
  },

  /** Counts against the limits immediately, in one transaction, so concurrent checkouts can't overshoot. */
  async reserve({ coupon, studentId, courseId, discount }) {
    const cref = db.collection("coupons").doc(coupon.id);
    const rref = red().doc();
    await db.runTransaction(async (tx) => {
      const [c, used] = await Promise.all([
        tx.get(cref),
        tx.get(usedByStudent(coupon.id, studentId, coupon.perUserLimit ?? 1)),
      ]);
      if (!c.exists || c.get("status") !== "published")
        throw new AppError(INVALID, 400);
      const limit = c.get("usageLimit");
      if (
        limit != null &&
        (c.get("reserved") ?? 0) + (c.get("redeemed") ?? 0) >= limit
      )
        throw new AppError("This coupon has reached its usage limit.", 409);
      if (used.size >= (c.get("perUserLimit") ?? 1))
        throw new AppError("You've already used this coupon.", 409);
      tx.update(cref, { reserved: FieldValue.increment(1) });
      tx.create(rref, {
        couponId: coupon.id,
        couponCode: coupon.code,
        studentId,
        courseId,
        discount,
        status: "reserved",
        sessionId: null,
        createdAt: FieldValue.serverTimestamp(),
      });
    });
    return rref.id;
  },

  attach: (id, sessionId) => red().doc(id).update({ sessionId }),

  /** Both transitions are idempotent, so webhook retries are safe. */
  async release(id) {
    if (!id) return;
    await db.runTransaction(async (tx) => {
      const r = await tx.get(red().doc(id));
      if (!r.exists || r.get("status") !== "reserved") return;
      tx.update(r.ref, {
        status: "released",
        releasedAt: FieldValue.serverTimestamp(),
      });
      tx.update(db.collection("coupons").doc(r.get("couponId")), {
        reserved: FieldValue.increment(-1),
      });
    });
  },
  async redeem(id) {
    if (!id) return;
    await db.runTransaction(async (tx) => {
      const r = await tx.get(red().doc(id));
      if (!r.exists || r.get("status") === "redeemed") return;
      const was = r.get("status"); // a late payment after an expiry release is still honored
      tx.update(r.ref, {
        status: "redeemed",
        redeemedAt: FieldValue.serverTimestamp(),
      });
      tx.update(db.collection("coupons").doc(r.get("couponId")), {
        redeemed: FieldValue.increment(1),
        ...(was === "reserved" ? { reserved: FieldValue.increment(-1) } : {}),
      });
    });
  },
};
export async function previewCoupon({ code, courseId }) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return UNAUTH;
    }

    if (!user.emailVerified) {
      return UNVERIFIED;
    }

    const normalizedCode = String(code ?? "").trim();

    if (!normalizedCode) {
      return {
        ok: false,
        error: "Please enter a coupon code.",
      };
    }

    if (!courseId) {
      return {
        ok: false,
        error: "Course is required.",
      };
    }

    const course = await courseService.getCourseById(courseId);

    if (!course) {
      return {
        ok: false,
        error: "Course not found.",
      };
    }

    const price = Number(course.salePrice ?? course.price ?? 0);

    if (!Number.isFinite(price) || price <= 0) {
      return {
        ok: false,
        error: "This course is not eligible for coupons.",
      };
    }

    const result = await couponService.quote({
      code: normalizedCode,
      course,
      price,
      studentId: user.uid,
    });

    return {
      ok: true,
      data: {
        couponId: result.coupon.id,
        code: result.coupon.code ?? normalizedCode,
        discount: result.discount,
        final: result.final,
        originalPrice: price,
        currency: course.currency,
      },
    };
  } catch (error) {
    console.error("[previewCoupon]", error);

    return {
      ok: false,
      error: toActionError(error),
    };
  }
}
