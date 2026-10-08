// services/careerService.js
import "server-only";
import { careerRepository } from "@/repositories/careerRepository";

export const careerService = {
  getAllCareers: () =>
    careerRepository.findMany({
      limit: 60,
      orderBy: "order",
      direction: "asc",
    }),
  getCareerBySlug: (slug) => careerRepository.findBySlug(slug),
  getCareersBySlugs: (slugs) => careerRepository.findBySlugs(slugs),
};

