// app/admin/analytics/page.jsx
import { AlertCircle, Inbox } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { ChartCard } from "@/components/admin/charts/ChartCard";
import { DonutChart, HBarChart } from "@/components/admin/charts/charts";
import { KpiCard } from "@/components/admin/analytics/KpiCard";
import { ExportCsvButton } from "@/components/admin/analytics/ExportCsvButton";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { parseListParams } from "@/lib/admin/listParams";
import { getAnalytics } from "@/services/admin/analyticsService";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Analytics" };
const NAMES = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  "365d": "12 months",
};
const any = (a) => Array.isArray(a) && a.some((x) => x.value > 0);
const stateOf = (v, ok) => (v === null ? "error" : ok ? "ready" : "empty");

// Shared entrance-animation classes/delays — same pattern used on the other
// admin pages (fade + slide-up, respects prefers-reduced-motion).
const ENTRANCE =
  "animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none";
const delay = (ms) => ({
  animationDelay: `${ms}ms`,
  animationFillMode: "backwards",
});

/* ------------------------------------------------------------------ */
/* Small presentational helpers (server-safe, no hooks)               */
/* ------------------------------------------------------------------ */

function StateMessage({ icon: Icon, children }) {
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      {children}
    </p>
  );
}

function CompletionRing({ percent }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - ((percent ?? 0) / 100) * c;
  const tone =
    percent === null
      ? { ring: "stroke-muted-foreground/30", text: "text-muted-foreground" }
      : percent >= 70
        ? {
            ring: "stroke-emerald-500",
            text: "text-emerald-600 dark:text-emerald-400",
          }
        : percent >= 40
          ? {
              ring: "stroke-amber-500",
              text: "text-amber-600 dark:text-amber-400",
            }
          : {
              ring: "stroke-rose-500",
              text: "text-rose-600 dark:text-rose-400",
            };

  return (
    <div className="relative size-16 shrink-0">
      <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="6"
          className="stroke-muted"
        />
        {percent !== null && (
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className={cn(
              "transition-[stroke-dashoffset] duration-700 ease-out",
              tone.ring,
            )}
          />
        )}
      </svg>
      <span
        className={cn(
          "absolute inset-0 grid place-items-center text-sm font-semibold tabular-nums",
          tone.text,
        )}
      >
        {percent === null ? "—" : `${percent}%`}
      </span>
    </div>
  );
}

export default async function AdminAnalyticsPage({ searchParams }) {
  await requirePermission(P.ANALYTICS_READ);
  const range =
    parseListParams(await searchParams, { sorts: ["newest"] }).range ?? "30d";
  const d = await getAnalytics(range);
  const done =
    d.completion && d.completion.enrolled
      ? Math.round((d.completion.completed / d.completion.enrolled) * 100)
      : null;
  const updated = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(d.generatedAt));

  const topMax = d.topRevenue?.length
    ? Math.max(...d.topRevenue.map((c) => c.revenue))
    : 0;
  const topSingleCurrency = d.topRevenue?.length
    ? new Set(d.topRevenue.map((c) => c.currency)).size <= 1
    : false;
  const catMax = d.categories?.length
    ? Math.max(...d.categories.map((c) => c.students))
    : 0;

  return (
    <div className="space-y-8">
      <div className={ENTRANCE} style={delay(0)}>
        <AdminPageHeader
          title="Analytics"
          description={`Last ${NAMES[range]}, compared with the ${NAMES[range]} before. Real figures from your data, refreshed every few minutes (updated ${updated}).`}
        />
      </div>

      <div className={ENTRANCE} style={delay(60)}>
        <DataTableToolbar
          searchable={false}
          filters={[
            {
              key: "range",
              label: "Period",
              allLabel: "Last 30 days",
              options: [
                ["7d", "Last 7 days"],
                ["90d", "Last 90 days"],
                ["365d", "Last 12 months"],
              ].map(([value, label]) => ({ value, label })),
            },
          ]}
        />
      </div>

      <div
        className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", ENTRANCE)}
        style={delay(120)}
      >
        <KpiCard label="New students" data={d.students} />
        <KpiCard label="New enrollments" data={d.enrollments} />
        <KpiCard label="Approved reviews" data={d.reviews} />
        <KpiCard label="Certificates issued" data={d.certificates} />
        <KpiCard label="Blog posts published" data={d.posts} />
        {d.revenue === null ? (
          <KpiCard label="Revenue" data={null} />
        ) : d.revenue.length ? (
          d.revenue.map((r) => (
            <KpiCard
              key={r.currency}
              label={`Revenue (${r.currency})`}
              data={r}
              currency={r.currency}
            />
          ))
        ) : (
          <KpiCard label="Revenue" data={{ current: 0, previous: 0 }} />
        )}
        <Card className="flex items-center gap-4 p-5">
          <CompletionRing percent={d.completion === null ? null : done} />
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm text-muted-foreground">
              Completion of new enrollments
            </p>
            <p className="text-xs text-muted-foreground">
              {d.completion === null
                ? "Unavailable"
                : d.completion?.enrolled
                  ? `${d.completion.completed} of ${d.completion.enrolled} finished so far`
                  : "No data available yet."}
            </p>
          </div>
        </Card>
      </div>

      <div
        className={cn("grid gap-4 lg:grid-cols-3", ENTRANCE)}
        style={delay(180)}
      >
        <ChartCard
          title="Payment status"
          description="Payments created in this period"
          state={stateOf(d.paymentStatus, any(d.paymentStatus))}
          srHeaders={["Status", "Payments"]}
          srRows={(d.paymentStatus ?? []).map((x) => [x.name, x.value])}
        >
          <DonutChart data={d.paymentStatus ?? []} />
        </ChartCard>
        <ChartCard
          title="Review ratings"
          description="All approved reviews"
          state={stateOf(d.ratings, any(d.ratings))}
          srHeaders={["Rating", "Reviews"]}
          srRows={(d.ratings ?? []).map((x) => [x.label, x.value])}
        >
          <HBarChart
            data={d.ratings ?? []}
            name="Reviews"
            color="var(--chart-2)"
          />
        </ChartCard>
        <Card className="gap-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Top courses by revenue</h3>
            <ExportCsvButton
              filename={`top-courses-${range}`}
              headers={["Course", "Revenue", "Currency"]}
              rows={(d.topRevenue ?? []).map((c) => [
                c.title,
                c.revenue,
                c.currency,
              ])}
            />
          </div>
          {d.topRevenue === null ? (
            <StateMessage icon={AlertCircle}>
              Couldn&apos;t load this list.
            </StateMessage>
          ) : !d.topRevenue.length ? (
            <StateMessage icon={Inbox}>No data available yet.</StateMessage>
          ) : (
            <ol className="space-y-3 text-sm">
              {d.topRevenue.map((c) => (
                <li key={c.slug} className="space-y-1.5">
                  <div className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">{c.title}</span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {formatPrice(c.revenue, c.currency)}
                    </span>
                  </div>
                  {topSingleCurrency && topMax > 0 && (
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{
                          width: `${Math.max(4, (c.revenue / topMax) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <Card className={cn("gap-3 p-5", ENTRANCE)} style={delay(240)}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Categories</h3>
          <ExportCsvButton
            filename={`categories-${range}`}
            headers={["Category", "Courses", "Students"]}
            rows={(d.categories ?? []).map((c) => [
              c.name,
              c.courses,
              c.students,
            ])}
          />
        </div>
        {d.categories === null ? (
          <StateMessage icon={AlertCircle}>
            Couldn&apos;t load this table.
          </StateMessage>
        ) : !d.categories.length ? (
          <StateMessage icon={Inbox}>No data available yet.</StateMessage>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table className="min-w-[480px]">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Category</TableHead>
                  <TableHead scope="col" className="text-right">
                    Courses
                  </TableHead>
                  <TableHead scope="col" className="text-right">
                    Students
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.categories.map((c) => (
                  <TableRow key={c.name}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.courses}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {catMax > 0 && (
                          <span className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                            <span
                              className="block h-full rounded-full bg-primary/70"
                              style={{
                                width: `${Math.max(4, (c.students / catMax) * 100)}%`,
                              }}
                            />
                          </span>
                        )}
                        <span className="tabular-nums">{c.students}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Card className={cn("gap-3 p-5", ENTRANCE)} style={delay(300)}>
        <h3 className="text-lg font-semibold">Content</h3>
        {d.content === null ? (
          <StateMessage icon={AlertCircle}>
            Couldn&apos;t load this section.
          </StateMessage>
        ) : (
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            {[
              ["Jobs", d.content.jobs],
              ["Blog posts", d.content.posts],
            ].map(([t, rows]) => (
              <div key={t}>
                <dt className="font-medium">{t}</dt>
                <dd className="text-muted-foreground">
                  {rows.map((r) => `${r.value} ${r.name}`).join(" · ")}
                </dd>
              </div>
            ))}
            <div>
              <dt className="font-medium">Certificates</dt>
              <dd className="text-muted-foreground">
                {d.content.certificates.valid} valid ·{" "}
                {d.content.certificates.revoked} revoked
              </dd>
            </div>
          </dl>
        )}
      </Card>
    </div>
  );
}
