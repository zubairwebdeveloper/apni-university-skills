import { createPublicRepository } from "@/repositories/createPublicRepository";

// studentId never leaves the server
export const reviewRepository = createPublicRepository("reviews", {
  statusValue: "approved",
  omit: ["studentId"],
});

