// lib/constants/roles.js
export const ROLES = Object.freeze({
  ADMIN: "admin",
  EDITOR: "editor",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
});

export const ROLE_LABELS = Object.freeze({
  [ROLES.ADMIN]: "Admin",
  [ROLES.EDITOR]: "Editor",
  [ROLES.INSTRUCTOR]: "Instructor",
  [ROLES.STUDENT]: "Student",
});

// Admin panel me jin roles ko access mil sakta hai
export const STAFF_ROLES = Object.freeze([
  ROLES.ADMIN,
  ROLES.EDITOR,
  ROLES.INSTRUCTOR,
]);

export const isRole = (value) => Object.values(ROLES).includes(value);
// Backward-compatible exports
export const ROLE_LIST = Object.values(ROLES);