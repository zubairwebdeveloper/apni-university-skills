// components/student/CourseProgress.jsx
import { Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function CourseProgress({ value = 0, label = "Progress" }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const complete = v === 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="min-w-0 truncate text-muted-foreground" title={label}>
          {label}
        </span>
        <span
          className={`inline-flex shrink-0 items-center gap-1 font-semibold tabular-nums ${
            complete ? "text-primary" : "text-foreground"
          }`}
        >
          {complete && <Check className="size-3.5" aria-hidden="true" />}
          {complete ? "Completed" : `${v}%`}
        </span>
      </div>
      <Progress value={v} aria-label={`${label}: ${v}%`} className="h-2" />
    </div>
  );
}
