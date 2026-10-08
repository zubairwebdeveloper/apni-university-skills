// app/sitemap.js

import { listSlugs } from "@/repositories/baseRepository";
import { safe } from "@/lib/utils/safe";

export const revalidate = 3600;

const staticRoutes = [
  "",
  "/about",
  "/courses",
  "/categories",
  "/instructors",
  "/blog",
  "/careers",
  "/jobs",
  "/ai",
  "/technology",
  "/pricing",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
];

const sources = [
  ["courses", "/courses", "published"],
  ["categories", "/categories", "published"],
  ["instructors", "/instructors", "active"],
  ["instructors", "/instructors", "published"],
  ["blogPosts", "/blog", "published"],
  ["careers", "/careers", "published"],
  ["jobs", "/jobs", "published"],
];

export default async function sitemap() {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");

  const dynamic = await Promise.all(
    sources.map(async ([collection, prefix, status]) => {
      const result = await safe(listSlugs(collection, status), []);

      return result.map(({ slug, updatedAt }) => ({
        url: `${base}${prefix}/${slug}`,
        ...(updatedAt
          ? {
              lastModified:
                updatedAt instanceof Date ? updatedAt : new Date(updatedAt),
            }
          : {}),
      }));
    }),
  );

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
    })),
    ...dynamic.flat(),
  ];
}
