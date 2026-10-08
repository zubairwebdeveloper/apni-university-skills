// lib/admin/featureAction.js
import "server-only";
import { z } from "zod";
import { adminAction } from "./action";
import { adminSlug } from "@/lib/validations/common";

export function makeFeatureAction({
  repo,
  resource,
  permission,
  revalidate = () => [],
}) {
  return adminAction({
    permission,
    schema: z.object({ slug: adminSlug, featured: z.boolean() }),
    handler: async ({ input, actor }) => {
      const r = await repo.update(
        input.slug,
        { featured: input.featured },
        actor,
      );
      return {
        data: { featured: input.featured },
        audit: {
          action: `${resource}.${input.featured ? "featured" : "unfeatured"}`,
          resource,
          resourceId: r.id,
          resourceSlug: r.slug,
        },
        revalidate: revalidate([r.slug]),
      };
    },
  });
}

