// app/actions/admin/reviews.js
"use server";
import { revalidatePath } from "next/cache";
import { makeLifecycleActions } from "@/lib/admin/lifecycleActions";
import { recalcRatings, refsOfReviews } from "@/lib/admin/ratings";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { reviewAdminRepository as repo } from "@/repositories/admin/reviewAdminRepository";

const lifecycle = makeLifecycleActions({
  repo,
  resource: "review",
  permissionPrefix: "reviews",
  verbs: {
    approve: P.REVIEWS_MODERATE,
    reject: P.REVIEWS_MODERATE,
    archive: P.REVIEWS_MODERATE,
    restore: P.REVIEWS_MODERATE,
    delete: P.REVIEWS_DELETE,
  },
  past: { approve: "approved", reject: "rejected" },
  // Any status change can move a review in or out of the "approved" set, so always recompute from the source of truth
  afterChange: async (updated) => {
    await recalcRatings(await refsOfReviews(updated.map((u) => u.id)));
    for (const p of ["/", "/courses", "/instructors"]) revalidatePath(p);
    revalidatePath("/courses/[slug]", "page");
    revalidatePath("/instructors/[slug]", "page");
  },
});
export const runReviewAction = lifecycle.run; // { action, slug }
export const bulkReviewAction = lifecycle.bulk; // { action, ids }

