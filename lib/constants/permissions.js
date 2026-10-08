// constants/permissions.js
import { ROLES } from "./roles";

const P = {};
const add = (resource, actions) =>
  actions.forEach((a) => {
    P[`${resource}_${a}`.toUpperCase().replace(".", "_")] = `${resource}.${a}`;
  });

add("admin", ["access"]);
add("courses", ["read", "create", "update", "delete", "publish"]);
add("categories", ["read", "create", "update", "delete", "publish"]);
add("lessons", ["read", "create", "update", "delete", "publish"]);
add("instructors", ["read", "create", "update", "delete", "publish"]);
add("students", ["read", "update"]);
add("users", ["read", "update", "roles"]);
add("coupons", ["read", "create", "update", "delete", "publish"]);
add("enrollments", ["read", "update"]);
add("reviews", ["read", "moderate", "delete"]);
add("blog", ["read", "create", "update", "delete", "publish"]);
add("careers", ["read", "create", "update", "delete", "publish"]);
add("jobs", ["read", "create", "update", "delete", "publish"]);
add("payments", ["read", "refund"]);
add("coupons", ["read", "create", "update", "delete"]);
add("certificates", ["read", "revoke"]);
add("notifications", ["read", "create"]);
add("contacts", ["read", "update"]);
add("analytics", ["read"]);
add("audit", ["read"]);
add("settings", ["read", "update"]);

export const PERMISSIONS = Object.freeze(P); // e.g. PERMISSIONS.COURSES_PUBLISH === "courses.publish"

const crud = (r) => [
  `${r}.read`,
  `${r}.create`,
  `${r}.update`,
  `${r}.delete`,
  `${r}.publish`,
];

export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: Object.values(P),
  [ROLES.EDITOR]: [
    P.ADMIN_ACCESS,
    ...crud("courses"),
    ...crud("categories"),
    ...crud("lessons"),
    ...crud("instructors"),
    ...crud("blog"),
    ...crud("careers"),
    ...crud("jobs"),
    P.REVIEWS_READ,
    P.REVIEWS_MODERATE,
    P.CONTACTS_READ,
  ].filter((p) => p !== "courses.delete" && p !== "instructors.delete"),
  // Read-only until the course batch adds "own courses only" scoping
  [ROLES.INSTRUCTOR]: [P.ADMIN_ACCESS, P.COURSES_READ, P.LESSONS_READ],
  [ROLES.STUDENT]: [],
});

export const can = (role, permission) =>
  !!ROLE_PERMISSIONS[role]?.includes(permission);
export const permissionsFor = (role) => ROLE_PERMISSIONS[role] ?? [];

