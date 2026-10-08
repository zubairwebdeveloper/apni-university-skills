// components/student/StatCard.jsx
import { Card } from "@/components/ui/card";
export function StatCard({ label, value, icon: Icon }) {
  return (
    <Card className="flex-row items-center gap-4 p-5">
      <span className="grid size-11 place-items-center rounded-lg bg-accent text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-serif text-2xl font-semibold">{value}</p>
      </div>
    </Card>
  );
}
