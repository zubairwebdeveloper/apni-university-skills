// lib/admin/refSearch.js: exact reference or exact student email, shared by payments / certificates
import "server-only";
import { userAdminRepository } from "@/repositories/admin/userAdminRepository";

export async function refOrEmailFilter(
  q,
  { refPattern, normalize = (s) => s.toLowerCase(), hint },
) {
  if (!q) return { filters: [], problem: null };
  if (refPattern.test(q))
    return { filters: [["slug", "==", normalize(q)]], problem: null };
  if (q.includes("@")) {
    const s = await userAdminRepository.findByEmail(q.toLowerCase());
    return s
      ? { filters: [["studentId", "==", s.id]], problem: null }
      : { filters: [], problem: "No account uses that email." };
  }
  return { filters: [], problem: hint };
}

