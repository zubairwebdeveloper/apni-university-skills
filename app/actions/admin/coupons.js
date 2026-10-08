// app/actions/admin/coupons.js
"use server";
import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { makeLifecycleActions } from "@/lib/admin/lifecycleActions";
import { changedFields } from "@/lib/audit/auditLog";
import { AppError } from "@/lib/errors";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { couponSchema, toCouponData } from "@/lib/validations/coupon";
import { adminSlug } from "@/lib/validations/common";
import { couponAdminRepository as repo } from "@/repositories/admin/couponAdminRepository";

export const createCoupon = adminAction({
  permission: P.COUPONS_CREATE,
  schema: couponSchema,
  handler: async ({ input, actor }) => {
    const data = { ...toCouponData(input), slug: input.code.toLowerCase() }; // explicit slug: a duplicate code fails instead of getting a suffix
    const { id, slug } = await repo.create({
      data,
      slugSource: input.code,
      actor,
      initial: { reserved: 0, redeemed: 0 },
    });
    return {
      data: { slug },
      audit: {
        action: "coupon.created",
        resource: "coupon",
        resourceId: id,
        resourceSlug: slug,
        metadata: { code: input.code, type: input.type, value: input.value },
      },
    };
  },
});

export const updateCoupon = adminAction({
  permission: P.COUPONS_UPDATE,
  schema: z.object({
    currentSlug: adminSlug,
    ifUpdatedAt: z.number().int().positive().optional(),
    values: couponSchema,
  }),
  handler: async ({ input, actor }) => {
    const before = await repo.findBySlug(input.currentSlug);
    if (!before) throw new AppError("Coupon not found.", 404);
    if (before.status === "deleted")
      throw new AppError("Restore this coupon before editing it.", 409);
    if (input.values.code.toLowerCase() !== before.slug)
      throw new AppError(
        "A coupon's code can't be changed. Create a new coupon instead.",
        409,
      );
    const { code, ...rest } = toCouponData(input.values);
    const r = await repo.update(input.currentSlug, rest, actor, {
      ifUpdatedAt: input.ifUpdatedAt,
    });
    return {
      data: { slug: r.slug },
      audit: {
        action: "coupon.updated",
        resource: "coupon",
        resourceId: r.id,
        resourceSlug: r.slug,
        metadata: { fields: changedFields(before, rest) },
      },
    };
  },
});

const lifecycle = makeLifecycleActions({
  repo,
  resource: "coupon",
  permissionPrefix: "coupons",
  verbs: {
    publish: P.COUPONS_PUBLISH,
    unpublish: P.COUPONS_PUBLISH,
    archive: P.COUPONS_UPDATE,
    restore: P.COUPONS_UPDATE,
    delete: P.COUPONS_DELETE,
  },
});
export const runCouponAction = lifecycle.run;
export const bulkCouponAction = lifecycle.bulk;

