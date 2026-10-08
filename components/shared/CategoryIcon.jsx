// components/shared/CategoryIcon.jsx: Firestore stores an icon key string
import {
  FiCode,
  FiCpu,
  FiBarChart2,
  FiShield,
  FiCloud,
  FiServer,
  FiPenTool,
  FiSmartphone,
  FiLayers,
  FiBriefcase,
  FiTrendingUp,
  FiFolder,
} from "react-icons/fi";

const icons = {
  code: FiCode,
  ai: FiCpu,
  data: FiBarChart2,
  security: FiShield,
  cloud: FiCloud,
  devops: FiServer,
  design: FiPenTool,
  mobile: FiSmartphone,
  saas: FiLayers,
  business: FiBriefcase,
  career: FiTrendingUp,
};

export function CategoryIcon({ name, ...props }) {
  const Icon = icons[name] ?? FiFolder;
  return <Icon aria-hidden="true" {...props} />;
}

