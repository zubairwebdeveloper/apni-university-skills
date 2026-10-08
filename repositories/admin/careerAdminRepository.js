// repositories/admin/careerAdminRepository.js
import "server-only";
import { createAdminRepository, DEFAULT_SORTS } from "./createAdminRepository";
import { careerGuard } from "@/lib/admin/guards";

export const CAREER_SORTS = [
  "order",
  "newest",
  "oldest",
  "name-asc",
  "name-desc",
];
export const careerAdminRepository = createAdminRepository({
  collection: "careers",
  resourceName: "career",
  searchFields: ["title", "summary", "skills"],
  omit: ["searchKeywords"],
  guard: careerGuard,
  sorts: { ...DEFAULT_SORTS, order: ["order", "asc"] },
  listFields: [
    "title",
    "slug",
    "status",
    "order",
    "summary",
    "categorySlug",
    "skills",
    "updatedAt",
    "createdAt",
  ],
});

