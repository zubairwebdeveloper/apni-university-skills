import "server-only";

import { db } from "@/lib/firebase/admin/firestore";

import { createAdminRepository, DEFAULT_SORTS } from "./createAdminRepository";

import { instructorGuard } from "@/lib/admin/guards";

export const INSTRUCTOR_SORTS = [
  "newest",
  "oldest",
  "name-asc",
  "name-desc",
  "students",
];

export const instructorAdminRepository = Object.assign(
  createAdminRepository({
    collection: "instructors",

    resourceName: "instructor",

    searchFields: ["name", "designation", "skills"],

    omit: ["searchKeywords"],

    protect: [
      "coursesCount",
      "studentsCount",
      "rating",
      "reviewCount",
      "userId",
    ],

    guard: instructorGuard,

    sorts: {
      ...DEFAULT_SORTS,

      "name-asc": ["name", "asc"],
      "name-desc": ["name", "desc"],

      students: ["studentsCount", "desc"],
    },

    listFields: [
      "name",
      "slug",
      "designation",
      "email",
      "avatar",

      "coursesCount",
      "studentsCount",
      "rating",
      "reviewCount",

      "status",
      "featured",

      "updatedAt",
      "createdAt",
    ],
  }),

  {
    /**
     * Lightweight instructor options for selectors/pickers.
     */
    async options() {
      const snap = await db
        .collection("instructors")
        .where("status", "in", ["draft", "pending", "published", "archived"])
        .select("name", "slug", "status")
        .limit(200)
        .get();

      return snap.docs
        .map((doc) => ({
          id: doc.id,
          name: doc.get("name"),
          slug: doc.get("slug"),
          status: doc.get("status"),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
  },
);

/**
 * Every instructor should have these counters.
 *
 * Firestore ordering can exclude documents that don't
 * contain the sorted field, so initialize these on creation.
 */
export const INSTRUCTOR_COUNTERS = {
  coursesCount: 0,
  studentsCount: 0,
  rating: 0,
  reviewCount: 0,
};

