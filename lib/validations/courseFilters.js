// lib/validations/courseFilters.js: URL params are untrusted; invalid values fall back silently
import { z } from "zod";
import { LANGUAGES, LEVELS, SORT_OPTIONS } from "@/config/courses";

const opt = (s) => s.optional().catch(undefined);

const schema = z.object({
  q: opt(z.string().trim().min(2).max(60)),
  category: opt(z.string().regex(/^[a-z0-9-]{1,80}$/)),
  level: opt(z.enum(LEVELS.map((l) => l.value))),
  price: opt(z.enum(["free", "paid"])),
  language: opt(z.enum(LANGUAGES)),
  sort: z.enum(SORT_OPTIONS.map((s) => s.value)).catch("newest"),
  after: opt(z.string().regex(/^[A-Za-z0-9_-]{1,64}$/)),
});

export function parseCourseFilters(raw = {}) {
  const flat = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  return schema.parse(flat);
}

