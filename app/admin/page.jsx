// app/admin/page.jsx

import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, LayoutDashboard } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardStats } from "@/components/admin/dashboard/DashboardStats";
import { DashboardCharts } from "@/components/admin/dashboard/DashboardCharts";
import { RecentActivity } from "@/components/admin/dashboard/RecentActivity";

import { requirePermission } from "@/lib/auth/authorize";
import { can, PERMISSIONS as P } from "@/lib/constants/permissions";

import { isNavReady } from "@/config/adminNav";
import { quickActions } from "@/config/adminDashboard";

import { getDashboardData } from "@/services/admin/dashboardService";
import { getRecentActivity } from "@/services/admin/activityService";

export const metadata = {
  title: "Dashboard",
};

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

const enter =
  "animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none";

function SectionHeading({ id, title, description }) {
  return (
    <div className="mb-4 space-y-1">
      <h2 id={id} className="text-base font-semibold tracking-tight sm:text-lg">
        {title}
      </h2>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

function formatUpdated(value) {
  const date = new Date(value);
  const valid = !Number.isNaN(date.getTime());

  return {
    valid,
    iso: valid ? date.toISOString() : undefined,
    label: valid
      ? new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        }).format(date)
      : "Unavailable",
  };
}

/* ------------------------------------------------------------------ */
/* Skeleton fallbacks                                                  */
/* ------------------------------------------------------------------ */

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

function ActivitySkeleton() {
  return <Skeleton className="h-80 rounded-xl" />;
}

function ChipSkeleton() {
  return <Skeleton className="h-7 w-48 rounded-full" />;
}

/* ------------------------------------------------------------------ */
/* Async sections (each one streams in on its own)                     */
/* ------------------------------------------------------------------ */

async function UpdatedChip({ dataPromise }) {
  const data = await dataPromise;
  const updated = formatUpdated(data.generatedAt);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/60 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      <span>
        Updated{" "}
        <time dateTime={updated.iso} className="font-medium text-foreground">
          {updated.label}
        </time>
      </span>
    </div>
  );
}

async function StatsSection({ dataPromise }) {
  const data = await dataPromise;

  if (!data.metrics || Object.keys(data.metrics).length === 0) return null;

  return (
    <section aria-labelledby="stats-title" className={`${enter} delay-75`}>
      <SectionHeading
        id="stats-title"
        title="Overview"
        description="Key numbers across your platform at a glance."
      />
      <DashboardStats metrics={data.metrics} />
    </section>
  );
}

async function ChartsSection({ dataPromise }) {
  const data = await dataPromise;

  if (!data.charts) return null;

  return (
    <section aria-labelledby="charts-title" className={`${enter} delay-150`}>
      <SectionHeading
        id="charts-title"
        title="Analytics"
        description="Trends and breakdowns over time."
      />
      <DashboardCharts charts={data.charts} />
    </section>
  );
}

async function ActivitySection({ activityPromise }) {
  const activity = await activityPromise;

  return (
    <section aria-labelledby="activity-title" className={`${enter} delay-200`}>
      <SectionHeading
        id="activity-title"
        title="Recent activity"
        description="The latest actions happening across the admin panel."
      />
      <RecentActivity data={activity} />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function AdminDashboardPage() {
  const user = await requirePermission(P.ADMIN_ACCESS);

  // Start fetching right away, but don't block the page shell.
  const dataPromise = getDashboardData(user.role);
  const activityPromise = getRecentActivity(user.role);

  const actions = quickActions.filter(
    (action) => can(user.role, action.permission) && isNavReady(action.href),
  );

  const first =
    (user.name || user.email || "").split(/[ @]/)[0].trim() || "there";

  const roleLabel = user.role ? String(user.role).replace(/[_-]/g, " ") : null;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 sm:space-y-10 sm:px-6 lg:px-8">
      {/* =========================================================
          Hero
      ========================================================= */}
      <section
        aria-labelledby="admin-dashboard-title"
        className={`${enter} relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-5 sm:p-8`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-1/3 size-56 rounded-full bg-primary/5 blur-3xl"
        />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1.5 bg-background/60">
                <LayoutDashboard aria-hidden="true" className="size-3.5" />
                Admin Dashboard
              </Badge>

              {roleLabel ? (
                <Badge variant="secondary" className="capitalize">
                  {roleLabel}
                </Badge>
              ) : null}
            </div>

            <h1
              id="admin-dashboard-title"
              className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
            >
              Welcome back, <span className="text-primary">{first}</span> 👋
            </h1>

            <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Here&apos;s what&apos;s happening today. Figures refresh every
              couple of minutes.
            </p>
          </div>

          <div className="shrink-0">
            <Suspense fallback={<ChipSkeleton />}>
              <UpdatedChip dataPromise={dataPromise} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* =========================================================
          Quick actions
      ========================================================= */}
      {actions.length > 0 && (
        <section
          aria-labelledby="quick-actions-title"
          className={`${enter} delay-75`}
        >
          <SectionHeading
            id="quick-actions-title"
            title="Quick actions"
            description="Jump straight to the things you do most."
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {actions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Card className="h-full gap-0 py-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        {Icon ? (
                          <Icon aria-hidden="true" className="size-5" />
                        ) : null}
                      </div>

                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {action.label}
                      </span>

                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted-foreground opacity-60 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* =========================================================
          Statistics
      ========================================================= */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection dataPromise={dataPromise} />
      </Suspense>

      {/* =========================================================
          Analytics
      ========================================================= */}
      <Suspense fallback={<ChartsSkeleton />}>
        <ChartsSection dataPromise={dataPromise} />
      </Suspense>

      {/* =========================================================
          Recent Activity
      ========================================================= */}
      <Suspense fallback={<ActivitySkeleton />}>
        <ActivitySection activityPromise={activityPromise} />
      </Suspense>
    </div>
  );
}
