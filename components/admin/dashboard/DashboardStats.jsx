// components/admin/dashboard/DashboardStats.jsx
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { AdminStatCard } from "./AdminStatCard";
import { dashboardTiles } from "@/config/adminDashboard";

export function DashboardStats({ metrics }) {
  const tiles = dashboardTiles.filter((t) => metrics[t.key] !== undefined); // undefined = this role may not see it
  return (
    <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((t) => (
        <StaggerItem key={t.key}>
          <AdminStatCard tile={t} value={metrics[t.key]} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

