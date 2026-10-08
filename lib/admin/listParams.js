// lib/admin/listParams.js: URL params are untrusted; invalid values silently fall back
import { z } from "zod";
import { CONTENT_STATUSES, RANGE_OPTIONS } from "@/config/adminTable";
import { toKeyword } from "@/lib/utils/search";

const opt = (s) => s.optional().catch(undefined);
const cursor = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
const DAYS = Object.fromEntries(RANGE_OPTIONS.map((r) => [r.value, r.days]));

/** sorts: allowed sort keys, the first is the default. filters: { urlKey: zodSchema } */
export function parseListParams(
  raw = {},
  { sorts = ["newest"], statuses = CONTENT_STATUSES, filters = {} } = {},
) {
  const flat = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  const p = z
    .object({
      q: opt(z.string().trim().min(2).max(60)),
      status: opt(z.enum(["all", ...statuses])),
      sort: z.enum(sorts).catch(sorts[0]),
      range: opt(z.enum(Object.keys(DAYS))),
      after: opt(cursor),
      ...Object.fromEntries(
        Object.entries(filters).map(([k, s]) => [k, opt(s)]),
      ),
    })
    .parse(flat);
  // Firestore needs the range field (createdAt) to be the first orderBy, so ranges only combine with date sorts
  if (p.range && !["newest", "oldest"].includes(p.sort)) p.sort = "newest";
  return { ...p, keyword: toKeyword(p.q) };
}

export const rangeFilter = (range, field = "createdAt") =>
  range ? [[field, ">=", new Date(Date.now() - DAYS[range] * 864e5)]] : [];


