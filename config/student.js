// config/student.js
import {
  FiAward,
  FiBookOpen,
  FiCreditCard,
  FiHeart,
  FiHome,
  FiSettings,
  FiStar,
  FiTrendingUp,
  FiUser,
  FiBell,
} from "react-icons/fi";

export const studentNav = [
  { label: "Dashboard", href: "/student", icon: FiHome, exact: true },
  { label: "My courses", href: "/student/courses", icon: FiBookOpen },
  { label: "Progress", href: "/student/progress", icon: FiTrendingUp },
  { label: "Certificates", href: "/student/certificates", icon: FiAward },
  { label: "Notifications", href: "/student/notifications", icon: FiBell },
  { label: "Wishlist", href: "/student/wishlist", icon: FiHeart },
  { label: "Reviews", href: "/student/reviews", icon: FiStar },
  { label: "Payments", href: "/student/payments", icon: FiCreditCard },
  { label: "Profile", href: "/student/profile", icon: FiUser },
  { label: "Settings", href: "/student/settings", icon: FiSettings },
];

