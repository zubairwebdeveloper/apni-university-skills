// lib/admin/action.js
import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { assertPermission } from "@/lib/auth/authorize";
import { writeAudit } from "@/lib/audit/auditLog";
import { rateLimit } from "@/lib/security/rateLimit";
import { AppError, toActionError } from "@/lib/errors";

export function adminAction({
  permission,
  schema,
  fresh = false,
  limit = { limit: 120, windowSec: 60 },
  handler,
}) {
  return async function action(rawInput) {
    try {
      const actor = await assertPermission(permission, { fresh });

      if (
        limit &&
        !(await rateLimit(`admin:${permission}`, { key: actor.uid, ...limit }))
          .ok
      )
        throw new AppError(
          "You're doing that too quickly. Please wait a moment.",
          429,
        );

      let input = rawInput;
      if (schema) {
        const parsed = schema.safeParse(rawInput);
        if (!parsed.success)
          return {
            ok: false,
            code: "VALIDATION",
            error: parsed.error.issues[0]?.message ?? "Please check the form.",
            fieldErrors: z.flattenError(parsed.error).fieldErrors,
          };
        input = parsed.data;
      }

      const result = (await handler({ input, actor })) ?? {};

      if (result.audit)
        await writeAudit(actor, result.audit).catch((e) =>
          console.error(
            "[audit] WRITE FAILED",
            result.audit.action,
            e?.message ?? e,
          ),
        );
      for (const path of result.revalidate ?? []) revalidatePath(path);

      return { ok: true, data: result.data ?? null };
    } catch (e) {
      return {
        ok: false,
        code: e instanceof AppError ? String(e.status) : "ERROR",
        error: toActionError(e),
      };
    }
  };
}
