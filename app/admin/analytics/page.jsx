// app/admin/analytics/page.jsx
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { ChartCard } from "@/components/admin/charts/ChartCard";
import { DonutChart, HBarChart } from "@/components/admin/charts/charts";
import { KpiCard } from "@/components/admin/analytics/KpiCard";
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

export const metadata = { title: "Analytics" };
const NAMES = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  "365d": "12 months",
};
const any = (a) => Array.isArray(a) && a.some((x) => x.value > 0);
const stateOf = (v, ok) => (v === null ? "error" : ok ? "ready" : "empty");

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
    timeStyle: "short",
    timeZoneName: "short",
  }).format(new Date(d.generatedAt));

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Analytics"
        description={`Last ${NAMES[range]}, compared with the ${NAMES[range]} before. Real figures from your data, refreshed every few minutes (updated ${updated}).`}
      />
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <Card className="gap-1 p-5">
          <p className="text-sm text-muted-foreground">
            Completion of new enrollments
          </p>
          <p className="font-serif text-2xl font-semibold">
            {d.completion === null
              ? "Unavailable"
              : done === null
                ? "—"
                : `${done}%`}
          </p>
          <p className="text-xs text-muted-foreground">
            {d.completion?.enrolled
              ? `${d.completion.completed} of ${d.completion.enrolled} finished so far`
              : "No data available yet."}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
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
          <h3 className="font-serif text-lg font-semibold">
            Top courses by revenue
          </h3>
          {d.topRevenue === null ? (
            <p className="text-sm text-muted-foreground">
              Couldn&apos;t load this list.
            </p>
          ) : !d.topRevenue.length ? (
            <p className="text-sm text-muted-foreground">
              No data available yet.
            </p>
          ) : (
            <ol className="space-y-2 text-sm">
              {d.topRevenue.map((c) => (
                <li key={c.slug} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">{c.title}</span>
                  <span className="shrink-0 font-medium">
                    {formatPrice(c.revenue, c.currency)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <Card className="gap-3 p-5">
        <h3 className="font-serif text-lg font-semibold">Categories</h3>
        {d.categories === null ? (
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load this table.
          </p>
        ) : !d.categories.length ? (
          <p className="text-sm text-muted-foreground">
            No data available yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table className="min-w-[420px]">
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
                    <TableCell className="text-right tabular-nums">
                      {c.students}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Card className="gap-3 p-5">
        <h3 className="font-serif text-lg font-semibold">Content</h3>
        {d.content === null ? (
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load this section.
          </p>
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

