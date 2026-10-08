// config/adminDashboard.js
import {
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiEdit3,
  FiFileText,
  FiFolder,
  FiPlayCircle,
  FiPlus,
  FiStar,
  FiUserCheck,
  FiUsers,
  FiBell,
} from "react-icons/fi";
import { PERMISSIONS as P } from "@/lib/constants/permissions";

export const dashboardTiles = [
  {
    key: "students",
    label: "Total students",
    icon: FiUsers,
    href: "/admin/students",
  },
  {
    key: "courses",
    label: "Total courses",
    icon: FiBookOpen,
    href: "/admin/courses",
  },
  {
    key: "publishedCourses",
    label: "Published courses",
    icon: FiCheckCircle,
    href: "/admin/courses?status=published",
  },
  {
    key: "draftCourses",
    label: "Draft courses",
    icon: FiEdit3,
    href: "/admin/courses?status=draft",
  },
  {
    key: "enrollments",
    label: "Total enrollments",
    icon: FiFolder,
    href: "/admin/enrollments",
  },
  {
    key: "activeEnrollments",
    label: "Active enrollments",
    icon: FiPlayCircle,
    href: "/admin/enrollments?status=active",
  },
  {
    key: "completedEnrollments",
    label: "Completed courses",
    icon: FiCheckCircle,
    href: "/admin/enrollments?status=completed",
  },
  {
    key: "revenue",
    label: "Total revenue",
    icon: FiDollarSign,
    kind: "money",
    hint: "Paid orders, net of full refunds",
    href: "/admin/payments?status=paid",
  },
  {
    key: "pendingPayments",
    label: "Pending payments",
    icon: FiClock,
    hint: "Started in the last 24 hours",
    href: "/admin/payments?status=pending",
  },
  {
    key: "pendingReviews",
    label: "Pending reviews",
    icon: FiStar,
    href: "/admin/reviews?status=pending",
  },
  {
    key: "certificates",
    label: "Certificates issued",
    icon: FiAward,
    href: "/admin/certificates",
  },
  {
    key: "instructors",
    label: "Active instructors",
    icon: FiUserCheck,
    href: "/admin/instructors",
  },
  {
    key: "jobs",
    label: "Published jobs",
    icon: FiBriefcase,
    href: "/admin/jobs",
  },
  {
    key: "posts",
    label: "Published blog posts",
    icon: FiFileText,
    href: "/admin/blog",
  },
];

export const quickActions = [
  {
    label: "New course",
    href: "/admin/courses/create",
    icon: FiPlus,
    permission: P.COURSES_CREATE,
  },
  {
    label: "New blog post",
    href: "/admin/blog/create",
    icon: FiPlus,
    permission: P.BLOG_CREATE,
  },
  {
    label: "Post a job",
    href: "/admin/jobs/create",
    icon: FiPlus,
    permission: P.JOBS_CREATE,
  },
  {
    label: "Add instructor",
    href: "/admin/instructors/create",
    icon: FiPlus,
    permission: P.INSTRUCTORS_CREATE,
  },
  {
    label: "Review queue",
    href: "/admin/reviews?status=pending",
    icon: FiStar,
    permission: P.REVIEWS_MODERATE,
  },
  {
    label: "Send notification",
    href: "/admin/notifications/create",
    icon: FiBell,
    permission: P.NOTIFICATIONS_CREATE,
  },
];

