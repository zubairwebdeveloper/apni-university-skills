// components/admin/charts/ChartCard.jsx (server component)
import { AlertTriangle, BarChart3 } from "lucide-react";
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
    <Card
      className={cn(
        "gap-5 p-5 shadow-sm sm:p-6",
        "motion-safe:transition-[border-color,box-shadow] motion-safe:duration-200",
        "hover:border-foreground/20 hover:shadow-md",
        className,
      )}
    >
      <header className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-1.5 h-5 w-1 shrink-0 rounded-full bg-[#FACC15]"
        />
        <div className="min-w-0 space-y-1">
          <h3 className="font-serif text-lg font-semibold leading-snug tracking-tight text-balance">
            {title}
          </h3>
          {description && (
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </header>

      {state === "ready" ? (
        <figure className="min-w-0 overflow-hidden">
          <div aria-hidden="true" className="min-w-0">
            {children}
          </div>
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
      ) : state === "empty" ? (
        <div
          role="status"
          className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center"
        >
          <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
            <BarChart3 className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium">No data available yet</p>
            <p className="text-xs text-muted-foreground">
              This chart will appear once there is activity to show.
            </p>
          </div>
        </div>
      ) : (
        <div
          role="alert"
          className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-destructive/40 bg-destructive/5 px-4 py-8 text-center"
        >
          <span className="grid size-10 place-items-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium">Couldn&apos;t load this chart</p>
            <p className="text-xs text-muted-foreground">
              Check the server log for the failing query.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
