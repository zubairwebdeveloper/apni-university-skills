import { instructorRepository } from "@/repositories/instructorRepository";

export const instructorService = {
  getFeaturedInstructors: (limit = 4) =>
    instructorRepository.findMany({
      limit,
      orderBy: "studentsCount",
    }),

  getAllInstructors: () =>
    instructorRepository.findMany({
      limit: 60,
      orderBy: "studentsCount",
    }),

  getInstructorBySlug: (slug) => instructorRepository.findBySlug(slug),

  getInstructorById: (id) => instructorRepository.findById(id),
};

