// lib/admin/contactSubjects.js
// Shared by server pages and client components, so no "use client" here.
import { CONTACT_SUBJECTS } from "@/lib/validations/contact";

export const subjectLabel = (v) =>
  CONTACT_SUBJECTS.find((s) => s.value === v)?.label ?? v;
