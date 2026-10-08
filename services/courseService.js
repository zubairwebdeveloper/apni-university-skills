// services/courseService.js
import "server-only";
import { courseRepository } from "@/repositories/courseRepository";
import { categoryRepository } from "@/repositories/categoryRepository";
import { toKeyword } from "@/lib/utils/search";
import { PAGE_SIZE } from "@/config/courses";

export const courseService = {
  getPublishedCourses: (filters) => courseRepository.findPublished(filters),
  getCourseBySlug: (slug) => courseRepository.findBySlug(slug),

  async getFeaturedCourses(limit = 6) {
    const featured = await courseRepository.findPublished({
      featured: true,
      limit,
    });
    return featured.length
      ? featured
      : courseRepository.findPublished({ limit });
  },
  async getCoursesByCategorySlug(categorySlug, limit = 4) {
    if (!categorySlug) return [];
    const category = await categoryRepository.findBySlug(categorySlug);
    return category
      ? courseRepository.findPublished({
          categoryId: category.id,
          sort: "popular",
          limit,
        })
      : [];
  },
  // One entry point for /courses and /categories/[slug]. Everything is a Firestore query.
  async searchCourses(filters, { categoryId: forced } = {}) {
    let categoryId = forced;
    if (!categoryId && filters.category) {
      const category = await categoryRepository.findBySlug(filters.category);
      if (!category) return { items: [], nextCursor: null }; // unknown category => no results
      categoryId = category.id;
    }
    return courseRepository.findPage({
      categoryId,
      level: filters.level,
      language: filters.language,
      isFree: filters.price ? filters.price === "free" : undefined,
      keyword: toKeyword(filters.q),
      sort: filters.sort,
      after: filters.after,
      limit: PAGE_SIZE,
    });
  },

  getCoursesByInstructor: (instructorId, limit = 12) =>
    courseRepository.findPublished({ instructorId, limit }),

  async getRelatedCourses(course, limit = 4) {
    if (!course.categoryId) return [];
    const items = await courseRepository.findPublished({
      categoryId: course.categoryId,
      sort: "popular",
      limit: limit + 1,
    });
    return items.filter((c) => c.id !== course.id).slice(0, limit);
  },
};

