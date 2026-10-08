// services/jobService.js

import "server-only";

import { jobRepository } from "@/repositories/jobRepository";

const live = (job) => !job.expiresAt || job.expiresAt > Date.now();

export const jobService = {
  getLatestJobs: async (limit = 4) =>
    (
      await jobRepository.findMany({
        limit: limit + 4,
        orderBy: "publishedAt",
      })
    )
      .filter(live)
      .slice(0, limit),

  getJobBySlug: (slug) => jobRepository.findBySlug(slug),

  getJobsPage: async ({ remote, type, level, after, limit = 10 } = {}) => {
    const page = await jobRepository.findPage({
      limit,
      after,
      orderBy: "publishedAt",
      where: [
        ...(remote ? [["remote", "==", true]] : []),
        ...(type ? [["employmentType", "==", type]] : []),
        ...(level ? [["experienceLevel", "==", level]] : []),
      ],
    });

    return {
      ...page,
      items: page.items.filter(live),
    };
  },

  getJobsBySkill: async (skill, limit = 4) =>
    skill
      ? (
          await jobRepository.findMany({
            limit: limit + 4,
            orderBy: "publishedAt",
            where: [["skills", "array-contains", skill]],
          })
        )
          .filter(live)
          .slice(0, limit)
      : [],
};

