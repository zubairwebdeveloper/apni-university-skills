// app/actions/admin/settings.js
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { adminAction } from "@/lib/admin/action";
import { changedFields } from "@/lib/audit/auditLog";
import { bustTag } from "@/lib/cache";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import {
  generalSchema,
  notificationsSettingsSchema,
  securitySchema,
} from "@/lib/validations/settings";
import { settingsRepository } from "@/repositories/admin/settingsRepository";

const make = (id, schema) =>
  adminAction({
    permission: P.SETTINGS_UPDATE,
    fresh: true,
    limit: { limit: 20, windowSec: 60 },
    schema: z.object({
      ifUpdatedAt: z.number().int().positive().optional(),
      values: schema,
    }),
    handler: async ({ input, actor }) => {
      const { before } = await settingsRepository.save(
        id,
        input.values,
        actor,
        { ifUpdatedAt: input.ifUpdatedAt },
      );
      bustTag("settings");
      if (id === "general") revalidatePath("/", "layout");
      return {
        audit: {
          action: "setting.updated",
          resource: "setting",
          resourceId: id,
          resourceSlug: id,
          metadata: { fields: changedFields(before, input.values) },
        },
      };
    },
  });
export const updateGeneralSettings = make("general", generalSchema);
export const updateSecuritySettings = make("security", securitySchema);
export const updateNotificationSettings = make(
  "notifications",
  notificationsSettingsSchema,
);

