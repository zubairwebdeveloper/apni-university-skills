// config/skills.js: canonical casing keeps array-contains queries consistent
export const SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "SQL",
  "Git",
  "Docker",
  "AWS",
  "Cloud",
  "DevOps",
  "Security",
  "Figma",
  "AI",
  "Machine Learning",
  "SaaS",
  "Data Analysis",
  "Prompt Engineering",
  "Java",
  "Go",
  "Flutter",
];
const index = new Map(SKILLS.map((s) => [s.toLowerCase(), s]));
export const canonicalSkill = (s) =>
  index.get(s.trim().toLowerCase()) ?? s.trim();

