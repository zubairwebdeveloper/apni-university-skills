// services/admin/userAdminService.js: account-level operations. Sensitive ones are transactional.
import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth } from "@/lib/firebase/admin/auth";
import { db } from "@/lib/firebase/admin/firestore";
import { writeAudit, writeAuditTx } from "@/lib/audit/auditLog";
import { buildSearchKeywords } from "@/lib/utils/search";
import { AppError } from "@/lib/errors";
import { STAFF_ROLES } from "@/lib/constants/roles";
import { userAdminRepository as repo } from "@/repositories/admin/userAdminRepository";

const users = () => db.collection("users");
const activeAdmins = () =>
  users().where("role", "==", "admin").where("isActive", "==", true);
const now = () => FieldValue.serverTimestamp();

async function load(slug, allowedRoles) {
  const target = await repo.findBySlug(slug);
  if (!target || (allowedRoles && !allowedRoles.includes(target.role)))
    throw new AppError("Account not found.", 404);
  return target;
}

export const userAdminService = {
  async updateProfile({ slug, data, actor, allowedRoles }) {
    const target = await load(slug, allowedRoles);
    await adminAuth.updateUser(target.id, { displayName: data.displayName });
    await repo.update(
      target.id,
      {
        ...data,
        searchKeywords: buildSearchKeywords(data.displayName, target.email),
      },
      actor,
    );
    return target;
  },

  async markEmailVerified({ slug, actor, allowedRoles }) {
    const target = await load(slug, allowedRoles);
    await adminAuth.updateUser(target.id, { emailVerified: true });
    await repo.update(target.id, { emailVerified: true }, actor);
    return target;
  },

  /** Mirror + last-admin check + audit commit together; the sign-in account follows and the mirror is reverted if it fails. */
  async setActive({ slug, active, actor, allowedRoles }) {
    const target = await load(slug, allowedRoles);
    if (target.id === actor.uid)
      throw new AppError(
        "You can't change the status of your own account.",
        409,
      );
    const ref = users().doc(target.id);
    const resource = target.role === "student" ? "student" : "user";
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if ((snap.get("isActive") !== false) === active)
        throw new AppError(
          active
            ? "This account is already active."
            : "This account is already inactive.",
          409,
        );
      if (!active && snap.get("role") === "admin") {
        const admins = await tx.get(activeAdmins().limit(3));
        if (!admins.docs.some((d) => d.id !== target.id))
          throw new AppError(
            "This is the last active admin. Promote another admin first.",
            409,
          );
      }
      tx.update(ref, {
        isActive: active,
        updatedAt: now(),
        updatedBy: actor.uid,
      });
      writeAuditTx(tx, actor, {
        action: `${resource}.${active ? "activated" : "deactivated"}`,
        resource,
        resourceId: target.id,
        resourceSlug: target.slug,
      });
    });
    try {
      await adminAuth.updateUser(target.id, { disabled: !active });
      if (!active) await adminAuth.revokeRefreshTokens(target.id);
    } catch (e) {
      console.error(
        "[setActive] auth update failed, reverting:",
        e?.message ?? e,
      );
      await ref.update({ isActive: !active }).catch(() => {});
      throw new AppError(
        "Couldn't update the sign-in account, so nothing was changed.",
        500,
      );
    }
    return target;
  },

  /** Students only. Best-effort per account; returns what changed. */
  async bulkSetStudentsActive({ ids, active, actor }) {
    const snaps = await db.getAll(
      ...[...new Set(ids)].slice(0, 100).map((id) => users().doc(id)),
    );
    const eligible = snaps.filter(
      (s) =>
        s.exists &&
        s.get("role") === "student" &&
        s.id !== actor.uid &&
        (s.get("isActive") !== false) !== active,
    );
    const done = [];
    for (let i = 0; i < eligible.length; i += 10) {
      const results = await Promise.allSettled(
        eligible.slice(i, i + 10).map(async (s) => {
          await adminAuth.updateUser(s.id, { disabled: !active });
          if (!active) await adminAuth.revokeRefreshTokens(s.id);
          await s.ref.update({
            isActive: active,
            updatedAt: now(),
            updatedBy: actor.uid,
          });
          return s.get("slug");
        }),
      );
      results.forEach((r) =>
        r.status === "fulfilled"
          ? done.push(r.value)
          : console.error(
              "[bulkSetStudentsActive]",
              r.reason?.message ?? r.reason,
            ),
      );
    }
    return {
      updated: done.length,
      skipped: ids.length - done.length,
      slugs: done,
    };
  },

  async changeRole({ slug, role: to, actor }) {
    const target = await load(slug);
    if (target.id === actor.uid)
      throw new AppError("You can't change your own role.", 409);
    const rec = await adminAuth.getUser(target.id).catch(() => null);
    if (!rec)
      throw new AppError(
        "This account no longer exists in Firebase Authentication.",
        404,
      );
    if (STAFF_ROLES.includes(to) && (!rec.emailVerified || rec.disabled))
      throw new AppError(
        "Staff accounts must have a verified email and be active.",
        409,
      );

    const ref = users().doc(target.id);
    const { from } = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref); // all reads first
      const from = snap.get("role");
      if (from === to) throw new AppError("That's already their role.", 409);
      const admins =
        from === "admin" ? await tx.get(activeAdmins().limit(3)) : null;
      const linked =
        from === "instructor" && snap.get("instructorId")
          ? db.collection("instructors").doc(snap.get("instructorId"))
          : null;
      if (admins && !admins.docs.some((d) => d.id !== target.id))
        throw new AppError(
          "This is the last active admin. Promote another admin first.",
          409,
        );
      tx.update(ref, {
        role: to,
        ...(linked ? { instructorId: null } : {}),
        updatedAt: now(),
        updatedBy: actor.uid,
      });
      if (linked) tx.update(linked, { userId: null });
      writeAuditTx(tx, actor, {
        action: "user.role_changed",
        resource: "user",
        resourceId: target.id,
        resourceSlug: target.slug,
        metadata: { from, to },
      });
      return { from };
    });

    try {
      await adminAuth.setCustomUserClaims(target.id, {
        ...(rec.customClaims ?? {}),
        role: to,
      });
      await adminAuth.revokeRefreshTokens(target.id); // old session cookies stop verifying immediately
    } catch (e) {
      console.error(
        "[changeRole] claim update failed, reverting:",
        e?.message ?? e,
      );
      await ref.update({ role: from }).catch(() => {});
      await writeAudit(actor, {
        action: "user.role_change_reverted",
        resource: "user",
        resourceId: target.id,
        resourceSlug: target.slug,
        metadata: { from, to },
      }).catch(() => {});
      throw new AppError(
        "Couldn't update the account's permissions, so the role was not changed.",
        500,
      );
    }
    return { target, from };
  },

  /** Links an instructor-role account to an instructor profile (or unlinks with null). */
  async linkInstructor({ slug, instructorSlug, actor }) {
    const target = await load(slug, ["instructor"]);
    const instrSnap = instructorSlug
      ? await db
          .collection("instructors")
          .where("slug", "==", instructorSlug)
          .limit(1)
          .get()
      : null;
    if (instructorSlug && instrSnap.empty)
      throw new AppError("Instructor not found.", 404);
    const ref = users().doc(target.id);
    const next = instrSnap ? instrSnap.docs[0].ref : null;
    await db.runTransaction(async (tx) => {
      const [u, n] = await Promise.all([
        tx.get(ref),
        next ? tx.get(next) : null,
      ]);
      const prevId = u.get("instructorId");
      const prev =
        prevId && prevId !== next?.id
          ? await tx.get(db.collection("instructors").doc(prevId))
          : null;
      if (n && n.get("userId") && n.get("userId") !== target.id)
        throw new AppError(
          "That instructor profile is already linked to another account.",
          409,
        );
      if (prev?.exists && prev.get("userId") === target.id)
        tx.update(prev.ref, { userId: null });
      if (n) tx.update(n.ref, { userId: target.id });
      tx.update(ref, {
        instructorId: n ? n.id : null,
        updatedAt: now(),
        updatedBy: actor.uid,
      });
      writeAuditTx(tx, actor, {
        action: n ? "user.instructor_linked" : "user.instructor_unlinked",
        resource: "user",
        resourceId: target.id,
        resourceSlug: target.slug,
        metadata: { instructor: instructorSlug ?? prevId ?? null },
      });
    });
    return target;
  },
};

