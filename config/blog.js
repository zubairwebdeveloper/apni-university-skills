// config/blog.js
export const BLOG_TOPICS = [
  { slug: "ai", label: "AI" },
  { slug: "nextjs", label: "Next.js" },
  { slug: "react", label: "React" },
  { slug: "javascript", label: "JavaScript" },
  { slug: "firebase", label: "Firebase" },
  { slug: "saas", label: "SaaS" },
  { slug: "cloud", label: "Cloud" },
  { slug: "cybersecurity", label: "Cybersecurity" },
  { slug: "career", label: "Career" },
  { slug: "freelancing", label: "Freelancing" },
  { slug: "programming", label: "Programming" },
  { slug: "developer-tools", label: "Developer tools" },
];
export const topicLabel = (slug) =>
  BLOG_TOPICS.find((t) => t.slug === slug)?.label;

