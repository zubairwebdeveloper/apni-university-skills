// constants/roles.js
export const ROLES = Object.freeze({
  ADMIN: "admin",
  EDITOR: "editor",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
});
export const ROLE_LIST = Object.values(ROLES);
export const STAFF_ROLES = [ROLES.ADMIN, ROLES.EDITOR, ROLES.INSTRUCTOR];
export const ROLE_LABELS = {
  admin: "Admin",
  editor: "Editor",
  instructor: "Instructor",
  student: "Student",
};

