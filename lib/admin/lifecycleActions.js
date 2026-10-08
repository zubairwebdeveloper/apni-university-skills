import "server-only";

import { z } from "zod";

import { adminAction } from "./action";
import { adminSlug, docIds } from "@/lib/validations/common";

const VERBS = ["publish", "unpublish", "archive", "delete", "restore"];

const PAST = {
  publish: "published",
  unpublish: "unpublished",
  archive: "archived",
  delete: "deleted",
  restore: "restored",
};

const permissionFor = (prefix, verb) =>
  `${prefix}.${
    verb === "publish" || verb === "unpublish"
      ? "publish"
      : verb === "delete"
        ? "delete"
        : "update"
  }`;

// Own-property lookup prevents values such as
// "constructor" from reaching Object.prototype.
const dispatch = (map) =>
  async function lifecycleAction(input) {
    const run = Object.hasOwn(map, input?.action) ? map[input.action] : null;

    return run
      ? run(input)
      : {
          ok: false,
          code: "ERROR",
          error: "Unknown action.",
        };
  };

/**
 * repo:
 *   A createAdminRepository instance.
 *
 * resource:
 *   Resource name, e.g. "course".
 *
 * permissionPrefix:
 *   Permission prefix, e.g. "courses".
 *
 * revalidate:
 *   Receives affected slugs and returns public paths
 *   that should be refreshed.
 *
 * afterChange:
 *   Optional hook called after a successful lifecycle change.
 */
export function makeLifecycleActions({
  repo,
  resource,
  permissionPrefix,
  revalidate = () => [],
  afterChange,
  verbs,
  past = {},
}) {
  const after = async (updated) => {
    try {
      await afterChange?.(updated);
    } catch (error) {
      // afterChange must never break an already successful lifecycle operation.
      console.error("[afterChange]", resource, error?.message ?? error);
    }
  };

  const PASTX = {
    ...PAST,
    ...past,
  };

  const map =
    verbs ??
    Object.fromEntries(
      VERBS.map((verb) => [verb, permissionFor(permissionPrefix, verb)]),
    );

  const single = {};
  const bulk = {};

  for (const [verb, permission] of Object.entries(map)) {
    /* ---------------------------------------------------------------------- */
    /* Single-record lifecycle action                                         */
    /* ---------------------------------------------------------------------- */

    single[verb] = adminAction({
      permission,
      schema: z.object({
        slug: adminSlug,
      }),
      handler: async ({ input, actor }) => {
        const result = await repo.runAction(input.slug, verb, actor);

        await after([
          {
            id: result.id,
            slug: result.slug,
          },
        ]);

        return {
          data: {
            slug: result.slug,
          },

          audit: {
            action: `${resource}.${PASTX[verb]}`,
            resource,
            resourceId: result.id,
            resourceSlug: result.slug,
            metadata: {
              from: result.from,
            },
          },

          revalidate: revalidate([result.slug]),
        };
      },
    });

    /* ---------------------------------------------------------------------- */
    /* Bulk lifecycle action                                                  */
    /* ---------------------------------------------------------------------- */

    bulk[verb] = adminAction({
      permission,
      schema: z.object({
        ids: docIds,
      }),

      limit: {
        limit: 20,
        windowSec: 60,
      },

      handler: async ({ input, actor }) => {
        const result = await repo.bulkAction(input.ids, verb, actor);

        const count = result.updated.length;

        const message = count
          ? `${count} ${PASTX[verb]}${
              result.skipped
                ? `, ${result.skipped} skipped (wrong state, or still in use)`
                : ""
            }.`
          : `Nothing was ${PASTX[verb]}: the selected records aren't in a state that allows it.`;

        await after(result.updated);

        return {
          data: {
            updated: count,
            skipped: result.skipped,
            message,
          },

          audit: count
            ? {
                action: `${resource}.bulk_${PASTX[verb]}`,
                resource,
                metadata: {
                  count,
                  skipped: result.skipped,
                  slugs: result.updated.map((item) => item.slug),
                },
              }
            : undefined,

          revalidate: revalidate(result.updated.map((item) => item.slug)),
        };
      },
    });
  }

  return {
    run: dispatch(single),
    bulk: dispatch(bulk),
  };
}

