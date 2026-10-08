// repositories/admin/couponAdminRepository.js
import "server-only";
import { createAdminRepository, DEFAULT_SORTS } from "./createAdminRepository";
import { couponGuard } from "@/lib/admin/guards";
export const COUPON_SORTS = [
  "newest",
  "oldest",
  "name-asc",
  "name-desc",
  "usage",
];
export const couponAdminRepository = createAdminRepository({
  collection: "coupons",
  resourceName: "coupon",
  searchFields: ["code", "description"],
  omit: ["searchKeywords"],
  protect: ["reserved", "redeemed"],
  guard: couponGuard,
  sorts: {
    ...DEFAULT_SORTS,
    "name-asc": ["code", "asc"],
    "name-desc": ["code", "desc"],
    usage: ["redeemed", "desc"],
  },
  listFields: [
    "code",
    "slug",
    "description",
    "type",
    "value",
    "currency",
    "maxDiscount",
    "usageLimit",
    "reserved",
    "redeemed",
    "startsAt",
    "expiresAt",
    "status",
    "updatedAt",
    "createdAt",
  ],
});

