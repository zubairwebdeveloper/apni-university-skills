// repositories/courseRepository.js
import "server-only";
import { db } from "@/lib/firebase/admin/firestore";
import { serializeDoc } from "./baseRepository";

const col = () => db.collection("courses");
const PRIVATE = ["createdBy", "updatedBy", "searchKeywords"];

const SORTS = {
  newest: ["publishedAt", "desc"],
  popular: ["studentsCount", "desc"],
  rating: ["rating", "desc"],
  "price-asc": ["price", "asc"],
  "price-desc": ["price", "desc"],
};

export const courseRepository = {
  // Cursor pagination: fetch limit+1 to know if another page exists. The cursor is a doc id.
  async findById(id) {
    const snap = await col().doc(id).get();
    return snap.exists ? serializeDoc(snap, PRIVATE) : null;
  },
  async findManyByIds(ids = []) {
    const unique = [...new Set(ids)].slice(0, 200);
    if (!unique.length) return [];
    return (await db.getAll(...unique.map((id) => col().doc(id))))
      .filter((s) => s.exists)
      .map((s) => serializeDoc(s, PRIVATE));
  },
  async findPage({
    categoryId,
    instructorId,
    level,
    language,
    isFree,
    featured,
    keyword,
    sort = "newest",
    limit = 12,
    after,
  } = {}) {
    let q = col().where("status", "==", "published");
    if (categoryId) q = q.where("categoryId", "==", categoryId);
    if (instructorId) q = q.where("instructorId", "==", instructorId);
    if (level) q = q.where("level", "==", level);
    if (language) q = q.where("language", "==", language);
    if (typeof isFree === "boolean") q = q.where("isFree", "==", isFree);
    if (featured) q = q.where("featured", "==", true);
    if (keyword) q = q.where("searchKeywords", "array-contains", keyword);

    const [field, dir] = SORTS[sort] ?? SORTS.newest;
    q = q.orderBy(field, dir);
    if (after) {
      const cursor = await col().doc(after).get();
      if (cursor.exists) q = q.startAfter(cursor);
    }
    const docs = (await q.limit(limit + 1).get()).docs;
    const page = docs.slice(0, limit);
    return {
      items: page.map((d) => serializeDoc(d, PRIVATE)),
      nextCursor: docs.length > limit ? page.at(-1).id : null,
    };
  },

  async findPublished(opts = {}) {
    return (await this.findPage(opts)).items;
  },

  async findBySlug(slug) {
    const snap = await col()
      .where("slug", "==", slug)
      .where("status", "==", "published")
      .limit(1)
      .get();
    return snap.empty ? null : serializeDoc(snap.docs[0], PRIVATE);
  },

  async slugExists(slug) {
    return !(await col().where("slug", "==", slug).limit(1).get()).empty;
  },
};

