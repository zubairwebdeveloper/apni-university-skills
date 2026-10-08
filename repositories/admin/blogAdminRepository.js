import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";
import {
  createAdminRepository,
  DEFAULT_SORTS,
  LIFECYCLE,
} from "./createAdminRepository";
import { blogGuard } from "@/lib/admin/guards";
import { AppError } from "@/lib/errors";

export const BLOG_SORTS = [
  "newest",
  "oldest",
  "updated",
  "name-asc",
  "name-desc",
];

// Same lifecycle as everything else, plus "scheduled". Leaving the scheduled state always clears scheduledFor.
const clear = (fn) => (uid, doc) => ({ ...fn(uid, doc), scheduledFor: null });
const lifecycle = {
  ...LIFECYCLE,
  publish: {
    from: [...LIFECYCLE.publish.from, "scheduled"],
    patch: clear(LIFECYCLE.publish.patch),
  },
  archive: {
    from: [...LIFECYCLE.archive.from, "scheduled"],
    patch: clear(LIFECYCLE.archive.patch),
  },
  delete: {
    from: [...LIFECYCLE.delete.from, "scheduled"],
    patch: clear(LIFECYCLE.delete.patch),
  },
  unschedule: {
    from: ["scheduled"],
    patch: () => ({ status: "draft", scheduledFor: null }),
  },
};

export const blogAdminRepository = Object.assign(
  createAdminRepository({
    collection: "blogPosts",
    resourceName: "blog",
    activeStatuses: ["draft", "pending", "published", "scheduled", "archived"],
    searchFields: ["title", "category", "authorName", "tags"],
    omit: ["searchKeywords"],
    protect: ["authorId", "scheduledFor"],
    guard: blogGuard,
    lifecycle,
    sorts: { ...DEFAULT_SORTS },
    listFields: [
      "title",
      "slug",
      "status",
      "category",
      "authorName",
      "featured",
      "publishedAt",
      "scheduledFor",
      "updatedAt",
      "createdAt",
    ],
  }),
  {
    /** draft | pending | scheduled -> scheduled at `when` (Date). Rescheduling is allowed. */
    async schedule(slug, when, actor) {
      const found = await db
        .collection("blogPosts")
        .where("slug", "==", slug)
        .limit(1)
        .get();
      if (found.empty) throw new AppError("Post not found.", 404);
      const ref = found.docs[0].ref;
      return db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const from = snap.get("status");
        if (!["draft", "pending", "scheduled"].includes(from))
          throw new AppError(`A ${from} post can't be scheduled.`, 409);
        tx.update(ref, {
          status: "scheduled",
          scheduledFor: Timestamp.fromDate(when),
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: actor.uid,
        });
        return { id: ref.id, slug: snap.get("slug"), from };
      });
    },
  },
);
export const BLOG_INITIAL = (actor) => ({
  authorId: actor.uid,
  publishedAt: null,
  scheduledFor: null,
});

