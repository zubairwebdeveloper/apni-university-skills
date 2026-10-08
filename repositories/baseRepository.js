import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { db } from "@/lib/firebase/admin/firestore";

const COMMON_HIDDEN = [
  "createdBy",
  "updatedBy",
  "deletedBy",
  "archivedBy",
  "searchKeywords",
];

/**
 * Convert Firestore document into a plain serializable object.
 *
 * Server/client boundary ke liye Firestore Timestamp
 * milliseconds mein convert hota hai.
 */
export function serializeDoc(snap, omit = []) {
  const hidden = new Set(omit);
  const data = snap.data() ?? {};

  const out = {
    id: snap.id,
  };

  for (const [key, value] of Object.entries(data)) {
    if (hidden.has(key)) continue;

    out[key] = value instanceof Timestamp ? value.toMillis() : value;
  }

  return out;
}

/**
 * Public read-only repository factory.
 *
 * Default behavior:
 * - Sirf requested status ke documents return karta hai.
 * - Private/admin fields automatically hide karta hai.
 * - Slug lookup sirf public status mein karta hai.
 * - slugExists() ALL statuses check karta hai taake duplicate slug
 *   draft/published/archive records ke darmiyan bhi na bane.
 */
export function createPublicRepository(
  collection,
  { statusValue = "published", omit = [] } = {},
) {
  const hidden = [...COMMON_HIDDEN, ...omit];

  const col = () => db.collection(collection);

  const serialize = (doc) => serializeDoc(doc, hidden);

  return {
    async findMany({
      limit = 12,
      orderBy = "createdAt",
      direction = "desc",
      where = [],
    } = {}) {
      let query = col().where("status", "==", statusValue);

      for (const [field, operator, value] of where) {
        query = query.where(field, operator, value);
      }

      const snapshot = await query
        .orderBy(orderBy, direction)
        .limit(limit)
        .get();

      return snapshot.docs.map(serialize);
    },

    async findById(id) {
      const snapshot = await col().doc(id).get();

      if (!snapshot.exists) {
        return null;
      }

      if (snapshot.get("status") !== statusValue) {
        return null;
      }

      return serialize(snapshot);
    },

    async findBySlug(slug) {
      const snapshot = await col()
        .where("slug", "==", slug)
        .where("status", "==", statusValue)
        .limit(1)
        .get();

      return snapshot.empty ? null : serialize(snapshot.docs[0]);
    },

    /**
     * Checks slug across ALL statuses.
     *
     * This prevents:
     * draft -> "react-course"
     * published -> "react-course"
     *
     * from existing simultaneously.
     */
    async slugExists(slug) {
      const snapshot = await col().where("slug", "==", slug).limit(1).get();

      return !snapshot.empty;
    },
  };
}

export async function listSlugs(collectionName, status = null) {
  const repository = createPublicRepository(collectionName);

  const constraints = [];

  if (status) {
    constraints.push(["status", "==", status]);
  }

  const items = await repository.list({
    where: constraints,
    select: ["slug", "updatedAt"],
  });

  return items
    .filter((item) => item?.slug)
    .map((item) => ({
      slug: item.slug,
      updatedAt: item.updatedAt ?? null,
    }));
}