// components/public/instructorUtils.js
// Pure helpers (no "use client") — usable from server and client files.

export function getInstructorName(instructor) {
  return instructor?.name || instructor?.fullName || "Instructor";
}

export function getInstructorRole(instructor) {
  return (
    instructor?.title ||
    instructor?.headline ||
    instructor?.role ||
    instructor?.position ||
    ""
  );
}

export function getInstructorSkills(instructor) {
  const raw =
    (Array.isArray(instructor?.expertise) && instructor.expertise) ||
    (Array.isArray(instructor?.skills) && instructor.skills) ||
    (Array.isArray(instructor?.tags) && instructor.tags) ||
    [];

  return raw
    .map((s) => (typeof s === "string" ? s : s?.name || s?.title || ""))
    .filter(Boolean);
}

export function getInstructorBio(instructor) {
  return instructor?.bio || instructor?.about || instructor?.description || "";
}

export function getInstructorStudents(instructor) {
  const n = Number(instructor?.studentsCount ?? instructor?.students ?? 0);
  return Number.isFinite(n) ? n : 0;
}
