// repositories/admin/jobAdminRepository.js
import "server-only";
import { createAdminRepository, DEFAULT_SORTS } from "./createAdminRepository";
import { jobGuard } from "@/lib/admin/guards";

export const JOB_SORTS = [
  "newest",
  "oldest",
  "updated",
  "name-asc",
  "name-desc",
];
export const jobAdminRepository = createAdminRepository({
  collection: "jobs",
  resourceName: "job",
  searchFields: ["title", "company", "location", "skills"],
  omit: ["searchKeywords"],
  guard: jobGuard,
  sorts: { ...DEFAULT_SORTS },
  listFields: [
    "title",
    "slug",
    "status",
    "company",
    "companyLogo",
    "location",
    "remote",
    "employmentType",
    "experienceLevel",
    "salaryMin",
    "salaryMax",
    "currency",
    "featured",
    "expiresAt",
    "publishedAt",
    "updatedAt",
    "createdAt",
  ],
});
export const JOB_INITIAL = { publishedAt: null };

