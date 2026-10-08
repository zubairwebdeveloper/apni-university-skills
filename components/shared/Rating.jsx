// components/shared/Rating.jsx (updated)
import { FaStar } from "react-icons/fa";
import { formatCompact } from "@/lib/utils/format";

export function Rating({ value = 0, count = 0, showCount = true }) {
  if (!count) return <span className="text-xs text-muted-foreground">New</span>;
  const label =
    `Rated ${value.toFixed(1)} out of 5` +
    (showCount ? ` from ${count} reviews` : "");
  return (
    <div
      className="flex items-center gap-1 text-sm"
      role="img"
      aria-label={label}
    >
      <FaStar className="size-3.5 text-highlight" aria-hidden="true" />
      <span className="font-medium">{value.toFixed(1)}</span>
      {showCount && (
        <span className="text-muted-foreground">({formatCompact(count)})</span>
      )}
    </div>
  );
}

