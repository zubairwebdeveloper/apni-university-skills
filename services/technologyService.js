// services/technologyService.js
import "server-only";
import { technologyRepository } from "@/repositories/technologyRepository";

export const technologyService = {
  getAllTechnologies: () =>
    technologyRepository.findMany({
      limit: 60,
      orderBy: "order",
      direction: "asc",
    }),
  getTechnologyBySlug: (slug) => technologyRepository.findBySlug(slug),
};

