// components/admin/charts/ChartCard.jsx (server component)
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** state: "ready" | "empty" | "error". srHeaders/srRows feed the hidden data table. */
export function ChartCard({
  title,
  description,
  state = "ready",
  srHeaders = [],
  srRows = [],
  className,
  children,
}) {
  return (
    <Card className={cn("gap-4 p-5", className)}>
      <div>
        <h3 className="font-serif text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {state === "ready" ? (
        <figure>
          <div aria-hidden="true">{children}</div>
          {srRows.length > 0 && (
            <table className="sr-only">
              <caption>{title}</caption>
              <thead>
                <tr>
                  {srHeaders.map((h) => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {srRows.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </figure>
      ) : (
        <p className="grid min-h-40 place-items-center rounded-lg border border-dashed px-4 text-center text-sm text-muted-foreground">
          {state === "empty"
            ? "No data available yet."
            : "Couldn't load this chart. Check the server log for the failing query."}
        </p>
      )}
    </Card>
  );
}

