// app/actions/admin/contacts.js
"use server";
import { makeLifecycleActions } from "@/lib/admin/lifecycleActions";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { contactAdminRepository as repo } from "@/repositories/admin/contactAdminRepository";

const lifecycle = makeLifecycleActions({
  repo,
  resource: "contact",
  permissionPrefix: "contacts",
  verbs: Object.fromEntries(
    ["read", "replied", "archive", "spam", "restore", "delete"].map((v) => [
      v,
      P.CONTACTS_UPDATE,
    ]),
  ),
  past: { read: "marked_read", replied: "marked_replied", spam: "marked_spam" },
});
export const runContactAction = lifecycle.run; // single actions only; the bulk variant isn't exposed

