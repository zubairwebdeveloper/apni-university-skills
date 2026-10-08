// config/courses.js
export const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];
export const LANGUAGES = ["English", "Urdu"];
export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Highest rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];
export const PAGE_SIZE = 12;
export const levelLabel = (v) => LEVELS.find((l) => l.value === v)?.label ?? v;
export const publishRules = { minLessons: 1, minPrice: 0, minDuration: 1 };


