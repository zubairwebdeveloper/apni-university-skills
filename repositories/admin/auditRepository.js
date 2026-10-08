// repositories/admin/auditRepository.js: read-only. There is no update or delete anywhere in the codebase.
import "server-only";
import { db } from "@/lib/firebase/admin/firestore";
import { serializeDoc } from "@/repositories/baseRepository";
import { rangeFilter } from "@/lib/admin/listParams";

export const auditRepository = {
  async list({ resource, actor, range, after, limit = 25 } = {}) {
    let base = db.collection("auditLogs");
    if (resource) base = base.where("resource", "==", resource);
    if (actor) base = base.where("actorId", "==", actor);
    for (const [f, op, v] of rangeFilter(range)) base = base.where(f, op, v);

    let q = base.orderBy("createdAt", "desc");
    if (after) {
      const c = await db.collection("auditLogs").doc(after).get();
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
};

