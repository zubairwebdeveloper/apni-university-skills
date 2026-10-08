// app/actions/admin/users.js
"use server";
import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { ROLE_LIST } from "@/lib/constants/roles";
import { adminSlug } from "@/lib/validations/common";
import { userAdminService as svc } from "@/services/admin/userAdminService";

// fresh: true re-reads the ACTOR's claim from Firebase, so a just-demoted admin can't act on a stale cookie
export const updateUserRole = adminAction({
  permission: P.USERS_ROLES,
  fresh: true,
  limit: { limit: 20, windowSec: 60 },
  schema: z.object({
    slug: adminSlug,
    role: z.enum(ROLE_LIST, { message: "Choose a role" }),
  }),
  handler: async ({ input, actor }) => {
    const r = await svc.changeRole({ ...input, actor });
    return { data: { from: r.from, to: input.role } };
  }, // audited in the transaction
});

export const setUserActive = adminAction({
  permission: P.USERS_UPDATE,
  fresh: true,
  schema: z.object({ slug: adminSlug, active: z.boolean() }),
  handler: async ({ input, actor }) => {
    await svc.setActive({ ...input, actor });
    return {};
  },
});

export const linkInstructor = adminAction({
  permission: P.USERS_ROLES,
  fresh: true,
  schema: z.object({ slug: adminSlug, instructorSlug: adminSlug.nullable() }),
  handler: async ({ input, actor }) => {
    await svc.linkInstructor({ ...input, actor });
    return {};
  },
});

