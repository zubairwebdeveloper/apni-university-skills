// config/adminNav.js

import {
  FiAward,
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiBriefcase,
  FiChartNoAxesCombined,
  FiClipboard,
  FiCompass,
  FiCreditCard,
  FiFileText,
  FiFolder,
  FiGrid,
  FiHome,
  FiLayers,
  FiMail,
  FiSettings,
  FiShield,
  FiStar,
  FiTag,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { ShieldCheck } from "lucide-react";

// ready: false items render as disabled "Soon" entries
// until their batch ships, so there are no broken links.

export const adminNav = [
  {
    group: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: FiHome,
        permission: P.ADMIN_ACCESS,
        exact: true,
        ready: true,
      },
    ],
  },

  {
    group: "Learning",
    items: [
      {
        label: "Courses",
        href: "/admin/courses",
        icon: FiBookOpen,
        permission: P.COURSES_READ,
        ready: true,
      },
      {
        label: "Categories",
        href: "/admin/categories/create",
        icon: FiGrid,
        permission: P.CATEGORIES_READ,
        ready: true,
      },
      {
        label: "Lessons",
        href: "/admin/lessons",
        icon: FiLayers,
        permission: P.LESSONS_READ,
        ready: true,
      },

      {
        label: "Instructors",
        href: "/admin/instructors/create",
        icon: FiUserCheck,
        permission: P.INSTRUCTORS_READ,
        ready: true,
      },
    ],
  },

  {
    group: "People",
    items: [
      {
        label: "Students",
        href: "/admin/students",
        icon: FiUsers,
        permission: P.STUDENTS_READ,
        ready: true,
      },
      {
        label: "Enrollments",
        href: "/admin/enrollments",
        icon: FiFolder,
        permission: P.ENROLLMENTS_READ,
        ready: true,
      },
      {
        label: "Users & Roles",
        href: "/admin/users",
        icon: FiShield,
        permission: P.USERS_READ,
        ready: true,
      },
      {
        label: "Admin users",
        href: "/admin/admin-users",
        icon: ShieldCheck,
        permission: P.ADMIN_ACCESS,
        ready: true,
      },
    ],
  },

  {
    group: "Content",
    items: [
      {
        label: "Blog",
        href: "/admin/blog/create",
        icon: FiFileText,
        permission: P.BLOG_READ,
        key: "blog",
        ready: true,
      },
      {
        label: "Careers",
        href: "/admin/careers/create",
        icon: FiCompass,
        permission: P.CAREERS_READ,
        key: "careers",
        ready: true,
      },
      {
        label: "Jobs",
        href: "/admin/jobs",
        icon: FiBriefcase,
        permission: P.JOBS_READ,
        key: "jobs",
        ready: true,
      },
      {
        label: "Reviews",
        href: "/admin/reviews",
        icon: FiStar,
        permission: P.REVIEWS_READ,
        key: "reviews",
        ready: true,
      },
    ],
  },

  {
    group: "Business",
    items: [
      {
        label: "Payments",
        href: "/admin/payments",
        icon: FiCreditCard,
        permission: P.PAYMENTS_READ,
        ready: true,
      },
      {
        label: "Coupons",
        href: "/admin/coupons",
        icon: FiTag,
        permission: P.COUPONS_READ,
        ready: true,
      },
      {
        label: "Certificates",
        href: "/admin/certificates",
        icon: FiAward,
        permission: P.CERTIFICATES_READ,
        ready: true,
      },
      {
        label: "Messages",
        href: "/admin/contacts",
        icon: FiMail,
        permission: P.CONTACTS_READ,
        ready: true,
      },
    ],
  },

  {
    group: "Insights",
    items: [
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: FiBarChart2,
        permission: P.ANALYTICS_READ,
        ready: true,
      },
    ],
  },

  {
    group: "System",
    items: [
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: FiBell,
        permission: P.NOTIFICATIONS_READ,
        ready: true,
      },
      {
        label: "Audit Log",
        href: "/admin/audit",
        icon: FiClipboard,
        permission: P.AUDIT_READ,
        ready: true,
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: FiSettings,
        permission: P.SETTINGS_READ,
        ready: true,
      },
    ],
  },
];

const flat = adminNav.flatMap((group) => group.items);

// True when the screen behind a link exists.
// Dashboard tiles and quick actions use this so nothing 404s.
export const isNavReady = (href) => {
  const path = href.split("?")[0];

  if (path === "/admin") {
    return true;
  }

  const hit = flat
    .filter(
      (item) =>
        item.href !== "/admin" &&
        (path === item.href || path.startsWith(`${item.href}/`)),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  return Boolean(hit?.ready);
};
