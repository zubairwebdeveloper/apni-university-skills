// services/blogService.js (replaces Batch 2's version)
import "server-only";
import { blogRepository } from "@/repositories/blogRepository";

// Lists never download article bodies
const LIST_FIELDS = [
  "title",
  "slug",
  "excerpt",
  "coverImage",
  "category",
  "authorName",
  "tags",
  "publishedAt",
  "status",
];

export const blogService = {
  getLatestPosts: (limit = 3, { tag } = {}) =>
    blogRepository.findMany({
      limit,
      orderBy: "publishedAt",
      select: LIST_FIELDS,
      where: tag ? [["tags", "array-contains", tag]] : [],
    }),

  getPostsPage: ({ category, tag, after, limit = 9 } = {}) =>
    blogRepository.findPage({
      limit,
      after,
      orderBy: "publishedAt",
      select: LIST_FIELDS,
      where: [
        ...(category ? [["category", "==", category]] : []),
        ...(tag ? [["tags", "array-contains", tag]] : []),
      ],
    }),

  getPostBySlug: (slug) => blogRepository.findBySlug(slug),

  async getRelatedPosts(post, limit = 3) {
    const items = await blogRepository.findMany({
      limit: limit + 1,
      orderBy: "publishedAt",
      select: LIST_FIELDS,
      where: post.category ? [["category", "==", post.category]] : [],
    });
    return items.filter((p) => p.id !== post.id).slice(0, limit);
  },
};

