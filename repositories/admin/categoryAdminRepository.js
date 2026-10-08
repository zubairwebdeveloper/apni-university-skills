// repositories/admin/categoryAdminRepository.js
import "server-only";
import { db } from "@/lib/firebase/admin/firestore";
import { createAdminRepository, DEFAULT_SORTS } from "./createAdminRepository";
import { categoryGuard } from "@/lib/admin/guards";

export const CATEGORY_SORTS = [
  "newest",
  "oldest",
  "name-asc",
  "name-desc",
  "order",
];

export const categoryAdminRepository = Object.assign(
  createAdminRepository({
    collection: "categories",
    resourceName: "category",
    searchFields: ["name"],
    omit: ["searchKeywords"],
    protect: ["coursesCount"],
    guard: categoryGuard,
    sorts: {
      ...DEFAULT_SORTS,
      "name-asc": ["name", "asc"],
      "name-desc": ["name", "desc"],
      order: ["order", "asc"],
    },
    listFields: [
      "name",
      "slug",
      "icon",
      "order",
      "coursesCount",
      "status",
      "featured",
      "updatedAt",
      "createdAt",
    ],
  }),
  {
    // lightweight id/name pairs for dropdowns
    async options() {
      const snap = await db
        .collection("categories")
        .where("status", "in", ["draft", "pending", "published", "archived"])
        .select("name", "slug", "status")
        .limit(200)
        .get();
      return snap.docs
        .map((d) => ({
          id: d.id,
          name: d.get("name"),
          slug: d.get("slug"),
          status: d.get("status"),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
  },
);

