// repositories/admin/userAdminRepository.js
import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";
import { serializeDoc } from "@/repositories/baseRepository";

const col = () => db.collection("users");
const out = (d) => serializeDoc(d, ["searchKeywords"]);
export const USER_SORTS = ["newest", "oldest", "name-asc", "name-desc"];
const SORTS = {
  newest: ["createdAt", "desc"],
  oldest: ["createdAt", "asc"],
  "name-asc": ["displayName", "asc"],
  "name-desc": ["displayName", "desc"],
};

export const userAdminRepository = {
  /** active: true|false|undefined. verified: same for emailVerified. */
  async list({
    role,
    active,
    verified,
    keyword,
    sort = "newest",
    after,
    range = [],
    limit = 20,
  } = {}) {
    let base = col();
    if (role) base = base.where("role", "==", role);
    if (typeof active === "boolean")
      base = base.where("isActive", "==", active);
    if (typeof verified === "boolean")
      base = base.where("emailVerified", "==", verified);
    if (keyword) base = base.where("searchKeywords", "array-contains", keyword);
    for (const [f, op, v] of range) base = base.where(f, op, v);
    const [field, dir] = SORTS[sort] ?? SORTS.newest;
    let q = base.orderBy(field, dir);
    if (after) {
      const c = await col().doc(after).get();
      if (c.exists) q = q.startAfter(c);
    }
    const [snap, total] = await Promise.all([
      q.limit(limit + 1).get(),
      base.count().get(),
    ]);
    const page = snap.docs.slice(0, limit);
    return {
      items: page.map(out),
      nextCursor: snap.docs.length > limit ? page.at(-1).id : null,
      total: total.data().count,
    };
  },
  async findBySlug(slug) {
    const s = await col().where("slug", "==", slug).limit(1).get();
    return s.empty ? null : out(s.docs[0]);
  },
  async findById(id) {
    const s = await col().doc(id).get();
    return s.exists ? out(s) : null;
  },
  async findByEmail(email) {
    const s = await col().where("email", "==", email).limit(1).get();
    return s.empty ? null : out(s.docs[0]);
  },
  update: (uid, patch, actor) =>
    col()
      .doc(uid)
      .update({
        ...patch,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: actor.uid,
      }),
  async namesByIds(ids) {
    const unique = [...new Set(ids)];
    if (!unique.length) return {};
    const snaps = await db.getAll(...unique.map((id) => col().doc(id)), {
      fieldMask: ["displayName", "email", "slug"],
    });
    return Object.fromEntries(
      snaps
        .filter((s) => s.exists)
        .map((s) => [
          s.id,
          {
            name: s.get("displayName") || "Student",
            email: s.get("email"),
            slug: s.get("slug"),
          },
        ]),
    );
  },
};

