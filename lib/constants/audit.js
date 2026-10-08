// constants/audit.js
export const AUDIT_RESOURCES = [
  "course",
  "category",
  "lesson",
  "instructor",
  "student",
  "user",
  "enrollment",
  "review",
  "blog",
  "career",
  "job",
  "payment",
  "coupon",
  "certificate",
  "notification",
  "setting",
];

// "course.bulk_published" -> "Course bulk published"
export const formatAuditAction = (a = "") => {
  const s = a.replace(/[._]/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

