// repositories/categoryRepository.js
import { createPublicRepository } from "./baseRepository";
export const categoryRepository = createPublicRepository("categories");

// repositories/instructorRepository.js
export const instructorRepository = createPublicRepository("instructors", {
  statusValue: "active",
});

// repositories/blogRepository.js
export const blogRepository = createPublicRepository("blogPosts");

// repositories/jobRepository.js
export const jobRepository = createPublicRepository("jobs");

// repositories/reviewRepository.js: studentId never leaves the server
export const reviewRepository = createPublicRepository("reviews", {
  statusValue: "approved",
  omit: ["studentId"],
});

