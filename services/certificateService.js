// services/certificateService.js
import "server-only";
import { certificateRepository } from "@/repositories/certificateRepository";
export const certificateService = {
  listForStudent: (uid) => certificateRepository.listByStudent(uid),
};

