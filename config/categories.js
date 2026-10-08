// config/categories.js
export const CATEGORY_ICONS = [
  "code",
  "ai",
  "data",
  "security",
  "cloud",
  "devops",
  "design",
  "mobile",
  "saas",
  "business",
  "career",
];
export const ACCENTS = [
  { value: "blue", label: "Blue", classes: "bg-accent text-primary" },
  {
    value: "amber",
    label: "Amber",
    classes: "bg-highlight/30 text-highlight-foreground",
  },
  {
    value: "teal",
    label: "Teal",
    classes: "bg-[oklch(0.94_0.04_190)] text-[oklch(0.4_0.08_190)]",
  },
  {
    value: "rose",
    label: "Rose",
    classes: "bg-[oklch(0.94_0.04_10)] text-[oklch(0.45_0.14_10)]",
  },
  { value: "slate", label: "Slate", classes: "bg-secondary text-foreground" },
];
export const accentClasses = (v) =>
  (ACCENTS.find((a) => a.value === v) ?? ACCENTS[0]).classes;

