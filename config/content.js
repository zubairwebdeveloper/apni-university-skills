import {
  FiCpu,
  FiCloud,
  FiShield,
  FiCode,
  FiLayers,
  FiTool,
  FiServer,
} from "react-icons/fi";
import {
  FiTarget,
  FiAward,
  FiBriefcase,
  FiZap,
  FiUsers,
  FiUnlock,
} from "react-icons/fi";

export const whyApni = [
  {
    icon: FiTarget,
    title: "Project-based",
    text: "Every course is built around things you can ship and show to employers or clients.",
  },
  {
    icon: FiZap,
    title: "AI-ready curriculum",
    text: "Learn modern tools, from generative AI to automation, alongside fundamentals.",
  },
  {
    icon: FiBriefcase,
    title: "Career-focused",
    text: "Roadmaps, interview preparation, and portfolio guidance sit next to the lessons.",
  },
  {
    icon: FiUnlock,
    title: "Free and paid options",
    text: "Start with free courses and previews, then go deeper when you're ready.",
  },
  {
    icon: FiAward,
    title: "Certificates",
    text: "Complete a course and get a certificate you can share.",
  },
  {
    icon: FiUsers,
    title: "Built by practitioners",
    text: "Courses are taught by people who build and ship software for a living.",
  },
];

// slugs are seeded by scripts/seed.mjs (Batch 4)
export const learningPaths = [
  {
    slug: "full-stack-developer",
    title: "Full Stack Developer",
    steps: [
      "HTML, CSS & JavaScript",
      "React & Next.js",
      "Node.js & databases",
      "Deploy and ship",
    ],
  },
  {
    slug: "ai-engineer",
    title: "AI Engineer",
    steps: [
      "Python foundations",
      "Machine learning basics",
      "Generative AI & agents",
      "Deploy AI apps",
    ],
  },
  {
    slug: "devops-engineer",
    title: "DevOps Engineer",
    steps: [
      "Linux & networking",
      "Docker & CI/CD",
      "Cloud platforms",
      "Monitoring & security",
    ],
  },
  {
    slug: "ui-ux-designer",
    title: "UI/UX Designer",
    steps: [
      "Design fundamentals",
      "Figma workflows",
      "Research & prototyping",
      "Portfolio case studies",
    ],
  },
];

export const technologyTopics = [
  { title: "Artificial Intelligence", href: "/ai", icon: FiCpu },
  {
    title: "Web Development",
    href: "/technology/web-development",
    icon: FiCode,
  },
  { title: "Cloud", href: "/technology/cloud", icon: FiCloud },
  { title: "DevOps", href: "/technology/devops", icon: FiServer },
  { title: "Cybersecurity", href: "/technology/cybersecurity", icon: FiShield },
  { title: "SaaS", href: "/technology/saas", icon: FiLayers },
  {
    title: "Developer Tools",
    href: "/technology/developer-tools",
    icon: FiTool,
  },
];

export const careerTopics = [
  "Career roadmaps",
  "Skills you actually need",
  "Interview preparation",
  "Portfolio building",
  "Freelancing",
  "Remote work",
];

export const freeResources = [
  {
    title: "Free courses",
    text: "Full courses you can start today.",
    href: "/courses?price=free",
  },
  {
    title: "Career roadmaps",
    text: "Step-by-step paths for popular tech roles.",
    href: "/careers",
  },
  {
    title: "Technology guides",
    text: "What a technology is, why it matters, and how to start.",
    href: "/technology",
  },
  {
    title: "Blog tutorials",
    text: "Practical articles on AI, web, cloud, and careers.",
    href: "/blog",
  },
];

export const techStrip = [
  "Next.js",
  "React",
  "Node.js",
  "Firebase",
  "Python",
  "Docker",
  "TensorFlow",
  "Tailwind CSS",
];

