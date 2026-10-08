import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { db } from "@/lib/firebase/admin/firestore";
import { serializeDoc } from "@/repositories/baseRepository";
import { slugify } from "@/lib/utils/slugify";
import { buildSearchKeywords } from "@/lib/utils/search";
import { AppError } from "@/lib/errors";

const registryRef = (collection, slug) =>
  db.collection("slugRegistry").doc(`${collection}__${slug}`);

/*
 * Fields that may never be written from form input.
 * Status changes must go through runAction().
 */
const PROTECTED = [
  "id",
  "status",
  "createdAt",
  "createdBy",
  "updatedAt",
  "updatedBy",
  "deletedAt",
  "deletedBy",
  "archivedAt",
  "archivedBy",
  "publishedAt",
  "searchKeywords",
];

export const DEFAULT_SORTS = {
  newest: ["createdAt", "desc"],
  oldest: ["createdAt", "asc"],
  updated: ["updatedAt", "desc"],
  "name-asc": ["title", "asc"],
  "name-desc": ["title", "desc"],
};

/*
 * action -> {
 *   from: allowed current statuses,
 *   patch(uid, doc): update fields
 * }
 */
export const LIFECYCLE = {
  publish: {
    from: ["draft", "pending", "archived"],

    patch: (uid, doc) => ({
      status: "published",
      archivedAt: null,
      archivedBy: null,
      ...(doc.publishedAt
        ? {}
        : {
            publishedAt: FieldValue.serverTimestamp(),
          }),
    }),
  },

  unpublish: {
    from: ["published"],
    patch: () => ({
      status: "draft",
    }),
  },

  archive: {
    from: ["draft", "pending", "published"],

    patch: (uid) => ({
      status: "archived",
      archivedAt: FieldValue.serverTimestamp(),
      archivedBy: uid,
    }),
  },

  delete: {
    from: ["draft", "pending", "published", "archived"],

    patch: (uid) => ({
      status: "deleted",
      deletedAt: FieldValue.serverTimestamp(),
      deletedBy: uid,
    }),
  },

  restore: {
    from: ["archived", "deleted"],

    patch: () => ({
      status: "draft",
      deletedAt: null,
      deletedBy: null,
      archivedAt: null,
      archivedBy: null,
    }),
  },
};

async function slugTaken(tx, collection, slug, docId) {
  const [registry, query] = await Promise.all([
    tx.get(registryRef(collection, slug)),
    tx.get(db.collection(collection).where("slug", "==", slug).limit(2)),
  ]);

  return (
    (registry.exists && registry.get("docId") !== docId) ||
    query.docs.some((doc) => doc.id !== docId)
  );
}

export function createAdminRepository(cfg) {
  const {
    collection,
    resourceName = collection,

    activeStatuses = ["draft", "pending", "published", "archived"],

    sorts = DEFAULT_SORTS,
    searchFields = ["title"],
    omit = [],
    lifecycle = LIFECYCLE,
    defaultStatus = "draft",

    // Optional custom protection for resource-specific fields.
    protect = [],

    // Optional hook for resource-specific lifecycle restrictions.
    // Return a string to block the action, or null/undefined to allow it.
    guard = null,

    // Optional Firestore field projection for list queries.
    listFields = null,
  } = cfg;

  if (!collection) {
    throw new Error("createAdminRepository requires a collection name.");
  }

  const col = () => db.collection(collection);

  const out = (doc) => serializeDoc(doc, omit);

  const protectedFields = [...PROTECTED, ...protect];

  const strip = (object) =>
    Object.fromEntries(
      Object.entries(object ?? {}).filter(
        ([key]) => !protectedFields.includes(key),
      ),
    );

  const keywords = (data) =>
    buildSearchKeywords(searchFields.map((field) => data[field] ?? ""));

  const repo = {
    /*
     * filters: [[field, operator, value]]
     *
     * status:
     *   specific status -> only that status
     *   "all"           -> all active statuses
     *   omitted         -> all active statuses
     *
     * keyword:
     *   exact search keyword from searchKeywords
     */
    async list({
      filters = [],
      sort = "newest",
      status,
      keyword,
      after,
      limit = 20,
    } = {}) {
      let base = col();

      base =
        status && status !== "all"
          ? base.where("status", "==", status)
          : base.where("status", "in", activeStatuses);

      for (const [field, operator, value] of filters) {
        base = base.where(field, operator, value);
      }

      if (keyword) {
        base = base.where("searchKeywords", "array-contains", keyword);
      }

      const [field, direction] =
        sorts[sort] ?? sorts.newest ?? DEFAULT_SORTS.newest;

      const size = Math.min(Math.max(Number(limit) || 20, 1), 100);

      let query = base.orderBy(field, direction);

      if (after) {
        const cursor = await col().doc(after).get();

        if (cursor.exists) {
          query = query.startAfter(cursor);
        }
      }

      /*
       * Optional projection.
       * Keep this before limit().
       */
      if (listFields?.length) {
        query = query.select(...listFields);
      }

      /*
       * Read one extra record to determine whether
       * another page exists.
       */
      const [snapshot, countSnapshot] = await Promise.all([
        query.limit(size + 1).get(),
        base.count().get(),
      ]);

      const page = snapshot.docs.slice(0, size);

      return {
        items: page.map(out),

        nextCursor:
          snapshot.docs.length > size ? (page.at(-1)?.id ?? null) : null,

        total: countSnapshot.data().count,
      };
    },

    async findBySlug(slug) {
      const snapshot = await col().where("slug", "==", slug).limit(1).get();

      return snapshot.empty ? null : out(snapshot.docs[0]);
    },

    async findById(id) {
      const snapshot = await col().doc(id).get();

      return snapshot.exists ? out(snapshot) : null;
    },

    /*
     * Explicit slug:
     *   fail if already taken.
     *
     * No explicit slug:
     *   derive from slugSource and add suffix on collision.
     */
    async create({ data, slugSource, actor, initial = {} }) {
      const explicit = Boolean(data?.slug);

      const base = slugify(data?.slug || slugSource);

      if (!base) {
        throw new AppError("A title or slug is required.", 400);
      }

      const ref = col().doc();

      const clean = strip(data);

      delete clean.slug;

      for (let i = 0; i < 10; i += 1) {
        const slug = i === 0 ? base : `${base}-${i + 1}`;

        const created = await db.runTransaction(async (transaction) => {
          const taken = await slugTaken(transaction, collection, slug, ref.id);

          if (taken) {
            return false;
          }

          const now = FieldValue.serverTimestamp();

          const documentData = {
            ...clean,
            ...initial,
            slug,
            status: defaultStatus,
            searchKeywords: keywords({
              ...clean,
              ...initial,
            }),
            createdAt: now,
            updatedAt: now,
            createdBy: actor.uid,
            updatedBy: actor.uid,
          };

          transaction.create(ref, documentData);

          transaction.set(registryRef(collection, slug), {
            collection,
            docId: ref.id,
            current: true,
            createdAt: now,
          });

          return true;
        });

        if (created) {
          return {
            id: ref.id,
            slug,
          };
        }

        if (explicit) {
          throw new AppError("That slug is already in use.", 409);
        }
      }

      throw new AppError(
        "Could not generate a unique slug. Try a different title.",
        409,
      );
    },

    /*
     * ifUpdatedAt (milliseconds):
     * reject the update if somebody else saved
     * the record first.
     */
    async update(slug, patch, actor, { ifUpdatedAt } = {}) {
      const found = await col().where("slug", "==", slug).limit(1).get();

      if (found.empty) {
        throw new AppError("Record not found.", 404);
      }

      const ref = found.docs[0].ref;

      const clean = strip(patch);

      const wantSlug = clean.slug ? slugify(clean.slug) : null;

      delete clean.slug;

      return db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(ref);

        if (!snapshot.exists) {
          throw new AppError("Record not found.", 404);
        }

        if (
          ifUpdatedAt &&
          snapshot.get("updatedAt")?.toMillis?.() !== ifUpdatedAt
        ) {
          throw new AppError(
            "This record was changed by someone else. Reload the page and try again.",
            409,
          );
        }

        const oldSlug = snapshot.get("slug");

        const renaming = Boolean(wantSlug) && wantSlug !== oldSlug;

        if (
          renaming &&
          (await slugTaken(transaction, collection, wantSlug, ref.id))
        ) {
          throw new AppError("That slug is already in use.", 409);
        }

        const merged = {
          ...snapshot.data(),
          ...clean,
        };

        const now = FieldValue.serverTimestamp();

        transaction.update(ref, {
          ...clean,
          ...(renaming ? { slug: wantSlug } : {}),
          searchKeywords: keywords(merged),
          updatedAt: now,
          updatedBy: actor.uid,
        });

        if (renaming) {
          transaction.set(registryRef(collection, wantSlug), {
            collection,
            docId: ref.id,
            current: true,
            createdAt: now,
          });

          transaction.set(
            registryRef(collection, oldSlug),
            {
              collection,
              docId: ref.id,
              current: false,
              redirectTo: wantSlug,
              retiredAt: now,
            },
            { merge: true },
          );
        }

        return {
          id: ref.id,
          slug: renaming ? wantSlug : oldSlug,
          previousSlug: renaming ? oldSlug : null,
          changed: Object.keys(clean),
        };
      });
    },

    /*
     * Single lifecycle action:
     * publish | unpublish | archive | delete | restore
     */
    async runAction(slug, action, actor) {
      const rule = lifecycle[action];

      if (!rule) {
        throw new AppError("Unknown action.", 400);
      }

      const found = await col().where("slug", "==", slug).limit(1).get();

      if (found.empty) {
        throw new AppError("Record not found.", 404);
      }

      const ref = found.docs[0].ref;

      /*
       * Resource-specific lifecycle guard.
       * Example:
       * - course cannot be published without lessons
       * - instructor cannot be deleted while courses exist
       */
      if (guard) {
        const blocked = await guard(action, out(found.docs[0]));

        if (blocked) {
          throw new AppError(blocked, 409);
        }
      }

      return db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(ref);

        if (!snapshot.exists) {
          throw new AppError("Record not found.", 404);
        }

        const status = snapshot.get("status");

        if (!rule.from.includes(status)) {
          throw new AppError(`A ${status} record can't be ${action}d.`, 409);
        }

        transaction.update(ref, {
          ...rule.patch(actor.uid, snapshot.data()),
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: actor.uid,
        });

        return {
          id: ref.id,
          slug: snapshot.get("slug"),
          from: status,
        };
      });
    },

    /*
     * Bulk lifecycle action by internal IDs.
     *
     * Wrong-state records are skipped.
     * Guard-blocked records are also skipped.
     */
    async bulkAction(ids, action, actor) {
      const rule = lifecycle[action];

      if (!rule) {
        throw new AppError("Unknown action.", 400);
      }

      const unique = [...new Set(ids)].slice(0, 100);

      if (!unique.length) {
        return {
          updated: [],
          skipped: 0,
        };
      }

      const snapshots = await db.getAll(...unique.map((id) => col().doc(id)));

      const eligible = [];

      await Promise.all(
        snapshots.map(async (snapshot) => {
          if (!snapshot.exists || !rule.from.includes(snapshot.get("status"))) {
            return;
          }

          if (guard) {
            const blocked = await guard(action, {
              id: snapshot.id,
              ...snapshot.data(),
            });

            if (blocked) {
              return;
            }
          }

          eligible.push(snapshot);
        }),
      );

      const batch = db.batch();
      const updated = [];

      for (const snapshot of eligible) {
        batch.update(snapshot.ref, {
          ...rule.patch(actor.uid, snapshot.data()),
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: actor.uid,
        });

        updated.push({
          id: snapshot.id,
          slug: snapshot.get("slug"),
        });
      }

      if (updated.length) {
        await batch.commit();
      }

      return {
        updated,
        skipped: unique.length - updated.length,
      };
    },
  };

  return repo;
}

