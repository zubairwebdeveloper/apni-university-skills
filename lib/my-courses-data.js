export const SORT_OPTIONS = [
  { value: "recent", label: "Recently accessed" },
  { value: "progress-desc", label: "Highest progress" },
  { value: "progress-asc", label: "Lowest progress" },
  { value: "title", label: "Title (A–Z)" },
];

export const EXPLORE_CATEGORIES = [
  {
    icon: "brain",
    title: "Artificial Intelligence",
    description:
      "Machine learning, deep learning and generative AI from scratch.",
    href: "/courses?category=ai",
    count: "12 courses",
  },
  {
    icon: "code",
    title: "Web Development",
    description:
      "Build modern full-stack apps with React, Next.js and Node.js.",
    href: "/courses?category=web",
    count: "9 courses",
  },
  {
    icon: "cloud",
    title: "Cloud & DevOps",
    description: "Docker, Kubernetes, CI/CD and cloud deployment on AWS.",
    href: "/courses?category=cloud",
    count: "7 courses",
  },
  {
    icon: "shield",
    title: "Cybersecurity",
    description:
      "Ethical hacking, network security and secure coding practices.",
    href: "/courses?category=security",
    count: "6 courses",
  },
  {
    icon: "database",
    title: "Data Science",
    description:
      "Python, data analysis, visualization and real-world projects.",
    href: "/courses?category=data",
    count: "15 courses",
  },
  {
    icon: "phone",
    title: "Mobile Development",
    description: "Ship cross-platform apps for Android and iOS with Flutter.",
    href: "/courses?category=mobile",
    count: "8 courses",
  },
];

export const STUDY_TIPS = [
  {
    icon: "target",
    title: "Set a daily goal",
    description:
      "Even 30 focused minutes a day beats a 5-hour weekend cram. Consistency builds real skill.",
  },
  {
    icon: "code",
    title: "Build while you learn",
    description:
      "After every module, create a small project. Applying concepts is the fastest way to remember them.",
  },
  {
    icon: "users",
    title: "Learn with others",
    description:
      "Join the community, ask questions and review other students' work to deepen your understanding.",
  },
];
