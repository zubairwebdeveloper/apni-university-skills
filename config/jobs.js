// config/jobs.js
export const EMPLOYMENT_TYPES = [
  { value: "full-time", label: "Full-time", schema: "FULL_TIME" },
  { value: "part-time", label: "Part-time", schema: "PART_TIME" },
  { value: "contract", label: "Contract", schema: "CONTRACTOR" },
  { value: "freelance", label: "Freelance", schema: "CONTRACTOR" },
  { value: "internship", label: "Internship", schema: "INTERN" },
];
export const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry level" },
  { value: "mid", label: "Mid level" },
  { value: "senior", label: "Senior" },
];
export const employmentLabel = (v) =>
  EMPLOYMENT_TYPES.find((t) => t.value === v)?.label ?? v;
export const experienceLabel = (v) =>
  EXPERIENCE_LEVELS.find((l) => l.value === v)?.label ?? v;

