export const siteConfig = {
  name: "Apni University",
  tagline: "Learn Skills. Build Your Future.",
  announcement: {
    text: "New: explore our AI learning paths.",
    cta: "See AI courses",
    href: "/ai",
  },

  // Only socials with a real URL are rendered in the footer
  social: { linkedin: "", x: "", youtube: "", github: "" },
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
};

export const primaryNav = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Categories", href: "/categories" },
  { label: "AI", href: "/ai" },
  { label: "Technology", href: "/technology" },
  { label: "Pricing", href: "/pricing" },
];

export const moreNav = [
  { label: "Careers", href: "/careers" },
  { label: "Jobs", href: "/jobs" },
  { label: "Blog", href: "/blog" },
  { label: "Instructors", href: "/instructors" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const footerNav = {
  Learn: [
    { label: "All courses", href: "/courses" },
    { label: "Categories", href: "/categories" },
    { label: "Free courses", href: "/courses?price=free" },
    { label: "Instructors", href: "/instructors" },
    { label: "Pricing", href: "/pricing" },
  ],
  Explore: [
    { label: "AI", href: "/ai" },
    { label: "Technology", href: "/technology" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Jobs", href: "/jobs" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

