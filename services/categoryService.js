import { categoryRepository } from "@/repositories/categoryRepository";

export const categoryService = {
  getFeaturedCategories: (limit = 8) =>
    categoryRepository.findMany({
      limit,
      orderBy: "order",
      direction: "asc",
    }),

  getAllCategories: () =>
    categoryRepository.findMany({
      limit: 100,
      orderBy: "order",
      direction: "asc",
    }),

  getCategoryBySlug: (slug) => categoryRepository.findBySlug(slug),
};

