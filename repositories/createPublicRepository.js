import "server-only";

import { db } from "@/lib/firebase/admin/firestore";

function serializeDoc(doc, omit = []) {
  const data = doc.data();

  const serialized = {
    id: doc.id,
    ...data,
  };

  for (const field of omit) {
    delete serialized[field];
  }

  for (const [key, value] of Object.entries(serialized)) {
    if (value?.toMillis) {
      serialized[key] = value.toMillis();
    }
  }

  return serialized;
}

export function createPublicRepository(
  collection,
  { statusValue = "published", omit = [] } = {},
) {
  const col = () => db.collection(collection);
  const base = (where = []) => {
    let q = col().where("status", "==", statusValue);
    for (const [f, op, v] of where) q = q.where(f, op, v);
    return q;
  };
  const out = (d) => serializeDoc(d, omit);

  return {
    async findMany({
      limit = 12,
      orderBy = "createdAt",
      direction = "desc",
      where = [],
      select,
    } = {}) {
      let q = base(where).orderBy(orderBy, direction).limit(limit);
      if (select) q = q.select(...select);
      return (await q.get()).docs.map(out);
    },
    // Cursor pagination: fetch limit+1 to learn whether another page exists. The cursor is a doc id.
    async findPage({
      limit = 12,
      orderBy = "createdAt",
      direction = "desc",
      where = [],
      select,
      after,
    } = {}) {
      let q = base(where).orderBy(orderBy, direction);
      if (after) {
        const cursor = await col().doc(after).get();
        if (cursor.exists) q = q.startAfter(cursor);
      }
      if (select) q = q.select(...select);
      const docs = (await q.limit(limit + 1).get()).docs;
      const page = docs.slice(0, limit);
      return {
        items: page.map(out),
        nextCursor: docs.length > limit ? page.at(-1).id : null,
      };
    },
    async findBySlug(slug) {
      const snap = await base([["slug", "==", slug]])
        .limit(1)
        .get();
      return snap.empty ? null : out(snap.docs[0]);
    },
    // Order is preserved from the input list. "in" allows up to 30 values.
    async findBySlugs(slugs = []) {
      const list = [...new Set(slugs)].slice(0, 30);
      if (!list.length) return [];
      const docs = (await base([["slug", "in", list]]).get()).docs.map(out);
      return list.map((s) => docs.find((d) => d.slug === s)).filter(Boolean);
    },
    async findById(id) {
      const snap = await col().doc(id).get();
      return snap.exists && snap.get("status") === statusValue
        ? out(snap)
        : null;
    },
    // Across ALL statuses, so a draft can't collide with a published slug
    async slugExists(slug) {
      return !(await col().where("slug", "==", slug).limit(1).get()).empty;
    },
  };
}

export async function listSlugs(
  collection,
  statusValue = "published",
  limit = 1000,
) {
  const snap = await db
    .collection(collection)
    .where("status", "==", statusValue)
    .select("slug", "updatedAt")
    .limit(limit)
    .get();

  return snap.docs
    .map((doc) => ({
      slug: doc.get("slug"),
      updatedAt: doc.get("updatedAt")?.toMillis?.() ?? null,
    }))
    .filter((item) => item.slug);
}

