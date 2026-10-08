import { createPublicRepository } from "@/repositories/createPublicRepository";

export const instructorRepository = createPublicRepository("instructors", {
  omit: ["email"],
});

