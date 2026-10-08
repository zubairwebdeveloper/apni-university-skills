// repositories/admin/contactAdminRepository.js
import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { createAdminRepository, DEFAULT_SORTS } from "./createAdminRepository";

const now = () => FieldValue.serverTimestamp();
export const CONTACT_SORTS = ["newest", "oldest"];
export const CONTACT_STATUS_OPTIONS = [
  ["new", "New"],
  ["read", "Read"],
  ["replied", "Replied"],
  ["archived", "Archived"],
  ["spam", "Spam"],
  ["deleted", "Trash"],
].map(([value, label]) => ({ value, label }));
const OPEN = ["new", "read", "replied"];
const CONTACT_LIFECYCLE = {
  read: { from: ["new"], patch: () => ({ status: "read" }) },
  replied: {
    from: ["new", "read"],
    patch: (uid) => ({ status: "replied", repliedAt: now(), repliedBy: uid }),
  },
  archive: {
    from: OPEN,
    patch: (uid) => ({
      status: "archived",
      archivedAt: now(),
      archivedBy: uid,
    }),
  },
  spam: { from: OPEN, patch: () => ({ status: "spam" }) },
  restore: {
    from: ["archived", "spam", "deleted"],
    patch: () => ({
      status: "read",
      archivedAt: null,
      deletedAt: null,
      deletedBy: null,
    }),
  },
  delete: {
    from: [...OPEN, "archived", "spam"],
    patch: (uid) => ({ status: "deleted", deletedAt: now(), deletedBy: uid }),
  },
};
export const contactAdminRepository = createAdminRepository({
  collection: "contacts",
  resourceName: "contact",
  activeStatuses: ["new", "read", "replied", "archived", "spam"],
  lifecycle: CONTACT_LIFECYCLE,
  searchFields: ["name", "email", "subject"],
  omit: ["searchKeywords"],
  sorts: { ...DEFAULT_SORTS },
  listFields: [
    "slug",
    "name",
    "email",
    "subject",
    "message",
    "status",
    "createdAt",
    "updatedAt",
  ],
});

