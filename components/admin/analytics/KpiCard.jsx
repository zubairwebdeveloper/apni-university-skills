// components/admin/analytics/KpiCard.jsx
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils/format";

const num = new Intl.NumberFormat("en-US");

// Direction is shown by icon and text as well as colour, so it never
// depends on colour alone.
const TREND = {
  up: {
    icon: TrendingUp,
    word: "up",
    cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  down: {
    icon: TrendingDown,
    word: "down",
    cls: "bg-destructive/10 text-destructive",
  },
  flat: {
    icon: Minus,
    word: "unchanged",
    cls: "bg-muted text-muted-foreground",
  },
};

export function KpiCard({ label, data, currency }) {
  if (data === null)
    return (
      <Card className="gap-2 border-border p-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p
          className="text-3xl font-semibold leading-none tracking-tight text-muted-foreground/60"
          aria-hidden="true"
        >
          &mdash;
        </p>
        <p className="text-xs text-muted-foreground">Unavailable</p>
      </Card>
    );

  const fmt = (v) => (currency ? formatPrice(v, currency) : num.format(v));
  const delta = data.previous
    ? Math.round(((data.current - data.previous) / data.previous) * 100)
    : null;

  const trend =
    delta === null
      ? null
      : TREND[delta > 0 ? "up" : delta < 0 ? "down" : "flat"];
  const TrendIcon = trend?.icon;

  return (
    <Card className="gap-2 border-border p-5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-3xl font-semibold leading-none tracking-tight tabular-nums text-card-foreground">
        {fmt(data.current)}
      </p>

      {trend ? (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-xs text-muted-foreground">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold tabular-nums ${trend.cls}`}
          >
            <TrendIcon aria-hidden="true" className="size-3.5" />
            {Math.abs(delta)}%<span className="sr-only"> {trend.word}</span>
          </span>
          <span>
            vs previous period (
            <span className="tabular-nums">{fmt(data.previous)}</span>)
          </span>
        </p>
      ) : (
        <p className="pt-1 text-xs text-muted-foreground">
          {data.current
            ? "No data for the previous period"
            : "No data available yet."}
        </p>
      )}
    </Card>
  );
}
