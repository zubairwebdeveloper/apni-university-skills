// repositories/admin/reviewAdminRepository.js
import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { createAdminRepository } from "./createAdminRepository";

export const REVIEW_SORTS = ["newest", "oldest", "rating", "rating-asc"];
const now = () => FieldValue.serverTimestamp();
const away = {
  archivedAt: null,
  archivedBy: null,
  deletedAt: null,
  deletedBy: null,
};

// Review states are their own lifecycle: pending -> approved | rejected, plus archive and soft delete.
export const REVIEW_LIFECYCLE = {
  approve: {
    from: ["pending", "rejected", "archived"],
    patch: (uid) => ({
      status: "approved",
      moderatedAt: now(),
      moderatedBy: uid,
      ...away,
    }),
  },
  reject: {
    from: ["pending", "approved"],
    patch: (uid) => ({
      status: "rejected",
      moderatedAt: now(),
      moderatedBy: uid,
    }),
  },
  archive: {
    from: ["pending", "approved", "rejected"],
    patch: (uid) => ({
      status: "archived",
      archivedAt: now(),
      archivedBy: uid,
    }),
  },
  delete: {
    from: ["pending", "approved", "rejected", "archived"],
    patch: (uid) => ({ status: "deleted", deletedAt: now(), deletedBy: uid }),
  },
  restore: {
    from: ["archived", "deleted"],
    patch: () => ({ status: "pending", ...away }),
  }, // back to the queue, never straight to public
};

export const reviewAdminRepository = createAdminRepository({
  collection: "reviews",
  resourceName: "review",
  activeStatuses: ["pending", "approved", "rejected", "archived"],
  lifecycle: REVIEW_LIFECYCLE,
  sorts: {
    newest: ["createdAt", "desc"],
    oldest: ["createdAt", "asc"],
    rating: ["rating", "desc"],
    "rating-asc": ["rating", "asc"],
  },
  listFields: [
    "slug",
    "status",
    "studentName",
    "studentPhotoURL",
    "courseTitle",
    "courseSlug",
    "rating",
    "title",
    "comment",
    "createdAt",
    "updatedAt",
  ],
});

