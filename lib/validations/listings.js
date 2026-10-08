// lib/validations/listings.js: URL params are untrusted; invalid values fall back silently
import { z } from "zod";
import { BLOG_TOPICS } from "@/config/blog";
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from "@/config/jobs";

const opt = (s) => s.optional().catch(undefined);
const cursor = opt(z.string().regex(/^[A-Za-z0-9_-]{1,64}$/));
const flat = (raw) =>
  Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );

export const parseBlogFilters = (raw = {}) =>
  z
    .object({
      category: opt(z.enum(BLOG_TOPICS.map((t) => t.slug))),
      tag: opt(z.string().regex(/^[a-z0-9-]{1,40}$/)),
      after: cursor,
    })
    .parse(flat(raw));

export const parseJobFilters = (raw = {}) =>
  z
    .object({
      remote: opt(z.literal("true")),
      type: opt(z.enum(EMPLOYMENT_TYPES.map((t) => t.value))),
      level: opt(z.enum(EXPERIENCE_LEVELS.map((l) => l.value))),
      after: cursor,
    })
    .parse(flat(raw));

