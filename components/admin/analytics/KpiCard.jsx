// components/admin/analytics/KpiCard.jsx
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils/format";

const num = new Intl.NumberFormat("en-US");
export function KpiCard({ label, data, currency }) {
  if (data === null)
    return (
      <Card className="gap-1 p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">Unavailable</p>
      </Card>
    );
  const fmt = (v) => (currency ? formatPrice(v, currency) : num.format(v));
  const delta = data.previous
    ? Math.round(((data.current - data.previous) / data.previous) * 100)
    : null;
  return (
    <Card className="gap-1 p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-serif text-2xl font-semibold">{fmt(data.current)}</p>
      <p className="text-xs text-muted-foreground">
        {delta === null
          ? data.current
            ? "No data for the previous period"
            : "No data available yet."
          : `${delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} ${Math.abs(delta)}% vs previous period (${fmt(data.previous)})`}
      </p>
    </Card>
  );
}

