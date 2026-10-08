import "server-only";

import { createAdminRepository, DEFAULT_SORTS } from "./createAdminRepository";

import { courseGuard } from "@/lib/admin/guards";

export const COURSE_SORTS = [
  "newest",
  "oldest",
  "updated",
  "name-asc",
  "name-desc",
  "price-asc",
  "price-desc",
  "rating",
  "students",
  "revenue",
];

export const courseAdminRepository = createAdminRepository({
  collection: "courses",

  resourceName: "course",

  searchFields: ["title", "category", "instructor", "tags"],

  omit: ["searchKeywords"],

  protect: [
    "studentsCount",
    "rating",
    "reviewCount",
    "lessonsCount",
    "revenue",
  ],

  guard: courseGuard,

  sorts: {
    ...DEFAULT_SORTS,

    "name-asc": ["title", "asc"],
    "name-desc": ["title", "desc"],

    "price-asc": ["price", "asc"],
    "price-desc": ["price", "desc"],

    rating: ["rating", "desc"],
    students: ["studentsCount", "desc"],
    revenue: ["revenue", "desc"],
  },

  listFields: [
    "title",
    "slug",
    "status",
    "thumbnail",

    "category",
    "categorySlug",

    "instructor",
    "instructorSlug",

    "price",
    "salePrice",
    "currency",
    "isFree",

    "studentsCount",
    "lessonsCount",
    "rating",
    "reviewCount",

    "featured",

    "updatedAt",
    "createdAt",
  ],
});

/**
 * Default counters/metrics assigned when a course is created.
 */
export const COURSE_COUNTERS = {
  studentsCount: 0,
  rating: 0,
  reviewCount: 0,
  lessonsCount: 0,
  revenue: 0,
  publishedAt: null,
};

