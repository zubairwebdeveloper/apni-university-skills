// app/actions/admin/search.js
"use server";
import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { searchAdmin } from "@/services/admin/searchService";

export const adminSearch = adminAction({
  permission: P.ADMIN_ACCESS,
  limit: { limit: 60, windowSec: 60 },
  schema: z.object({ q: z.string().trim().min(2).max(60) }),
  handler: async ({ input, actor }) => ({
    data: await searchAdmin(input.q, actor.role),
  }), // each group is permission-filtered inside
});

