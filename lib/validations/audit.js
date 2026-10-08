// lib/validations/audit.js
import { z } from "zod";
import { AUDIT_RESOURCES } from "@/lib/constants/audit";
import { RANGE_OPTIONS } from "@/config/adminTable";

const opt = (s) => s.optional().catch(undefined);
export const parseAuditParams = (raw = {}) => {
  const flat = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  return z
    .object({
      resource: opt(z.enum(AUDIT_RESOURCES)),
      actor: opt(z.string().regex(/^[A-Za-z0-9]{10,40}$/)), // deep link from a user's page (Batch 4)
      range: opt(z.enum(RANGE_OPTIONS.map((r) => r.value))),
      after: opt(z.string().regex(/^[A-Za-z0-9_-]{1,64}$/)),
    })
    .parse(flat);
};

