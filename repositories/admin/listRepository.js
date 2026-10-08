// repositories/admin/listRepository.js: shared by payments, certificates and notifications
import "server-only";
import { db } from "@/lib/firebase/admin/firestore";
import { serializeDoc } from "@/repositories/baseRepository";

export function createReadRepository({ collection, sorts }) {
  const col = () => db.collection(collection);
  return {
    col,
    async list({ filters = [], sort = "newest", after, limit = 20 } = {}) {
      let base = col();
      for (const [f, op, v] of filters) base = base.where(f, op, v);
      const [field, dir] = sorts[sort] ?? Object.values(sorts)[0];
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
        items: page.map((d) => serializeDoc(d)),
        nextCursor: snap.docs.length > limit ? page.at(-1).id : null,
        total: total.data().count,
      };
    },
    async findBySlug(slug) {
      const s = await col().where("slug", "==", slug).limit(1).get();
      return s.empty ? null : serializeDoc(s.docs[0]);
    },
  };
}

