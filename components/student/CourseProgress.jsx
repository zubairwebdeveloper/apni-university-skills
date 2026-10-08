// components/student/CourseProgress.jsx
import { Progress } from "@/components/ui/progress";
export function CourseProgress({ value = 0, label = "Progress" }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{v}%</span>
      </div>
      <Progress value={v} aria-label={`${label}: ${v}%`} />
    </div>
  );
}

