export const NAV_LINKS = [
  { label: "Dashboard", href: "/student", icon: "dashboard" },
  { label: "My Courses", href: "/student/courses", icon: "book" },
  { label: "Live Classes", href: "/student/live", icon: "video" },
  { label: "Community", href: "/student/community", icon: "users" },
  { label: "Resources", href: "/student/resources", icon: "library" },
];

export const TECH_TICKER = [
  {
    label: "AI & Machine Learning Bootcamp",
    tag: "Trending",
    href: "/courses?category=ai",
  },
  {
    label: "Full-Stack Web Development",
    tag: "Popular",
    href: "/courses?category=web",
  },
  {
    label: "Cloud Computing & DevOps",
    tag: "New",
    href: "/courses?category=cloud",
  },
  {
    label: "Cybersecurity Essentials",
    tag: "Hot",
    href: "/courses?category=security",
  },
  {
    label: "Data Science with Python",
    tag: "Trending",
    href: "/courses?category=data",
  },
  {
    label: "Flutter Mobile App Development",
    tag: "Popular",
    href: "/courses?category=mobile",
  },
];

export const SEARCH_SUGGESTIONS = [
  { label: "Artificial Intelligence", hint: "12 courses" },
  { label: "React & Next.js", hint: "9 courses" },
  { label: "Python Programming", hint: "15 courses" },
  { label: "Cloud & DevOps", hint: "7 courses" },
  { label: "Cybersecurity", hint: "6 courses" },
  { label: "Mobile App Development", hint: "8 courses" },
];

// type: "course" | "assignment" | "live"
export const NOTIFICATIONS = [
  {
    id: 1,
    type: "course",
    title: "New course: Generative AI Bootcamp",
    time: "2 hours ago",
    href: "/courses?category=ai",
  },
  {
    id: 2,
    type: "assignment",
    title: "Assignment due: React Hooks Quiz",
    time: "Due tomorrow",
    href: "/student/assignments",
  },
  {
    id: 3,
    type: "live",
    title: "Live session: Cloud Fundamentals at 8 PM",
    time: "Tonight",
    href: "/student/live",
  },
];

export const USER_MENU = [
  {
    label: "My Profile",
    description: "Edit your info & avatar",
    href: "/student/profile",
    icon: "user",
  },
  {
    label: "My Courses",
    description: "Continue where you left off",
    href: "/student/courses",
    icon: "book",
  },
  {
    label: "Achievements",
    description: "Badges, certificates & rewards",
    href: "/student/achievements",
    icon: "trophy",
    badge: "New",
  },
  {
    label: "Settings",
    description: "Preferences & security",
    href: "/student/settings",
    icon: "settings",
  },
  {
    label: "Help & Support",
    description: "FAQs and contact us",
    href: "/student/support",
    icon: "help",
  },
];
