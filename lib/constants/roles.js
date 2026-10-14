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

// Student area (profile, my courses, notifications, settings) me jin roles ko
// access mil sakta hai. Staff bhi seekh sakte hain, is liye wo bhi shamil hain.
export const STUDENT_AREA_ROLES = Object.freeze([
  ROLES.STUDENT,
  ...STAFF_ROLES,
]);

export const isRole = (value) => Object.values(ROLES).includes(value);

export const isStaffRole = (role) => STAFF_ROLES.includes(role);

// True for students AND for admin, editor, instructor.
export const canUseStudentArea = (role) => STUDENT_AREA_ROLES.includes(role);

// Backward-compatible exports
export const ROLE_LIST = Object.values(ROLES);
