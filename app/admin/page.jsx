import Link from "next/link";
import { Suspense } from "react";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

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

const enter =
  "animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none";

function SectionHeading({ id, title, description, icon: Icon }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      {Icon ? (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-card text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </div>
      ) : null}

      <div className="min-w-0 space-y-1">
        <h2
          id={id}
          className="text-base font-bold tracking-tight text-foreground sm:text-lg"
        >
          {title}
        </h2>

        {description ? (
          <p className="text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function formatUpdated(value) {
  let raw = value;

  if (value && typeof value === "object" && "seconds" in value) {
    raw = value.seconds * 1000;
  }

  const date = raw ? new Date(raw) : new Date(NaN);
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

/* Loading fallbacks */

function StatsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Loading dashboard statistics"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="gap-0 rounded-2xl py-0">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-10 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-36" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 xl:grid-cols-2"
      aria-label="Loading dashboard analytics"
    >
      <Card className="gap-4 rounded-2xl py-0">
        <CardContent className="space-y-5 p-5">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-64 max-w-full" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </CardContent>
      </Card>

      <Card className="gap-4 rounded-2xl py-0">
        <CardContent className="space-y-5 p-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56 max-w-full" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </CardContent>
      </Card>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <Card className="rounded-2xl py-0">
      <CardContent className="space-y-5 p-5">
        <Skeleton className="h-5 w-48" />

        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ChipSkeleton() {
  return <Skeleton className="h-10 w-48 rounded-xl" />;
}

/* Independently streamed dashboard sections */

async function UpdatedChip({ dataPromise }) {
  const data = await dataPromise;
  const updated = formatUpdated(data.generatedAt);

  return (
    <div className="inline-flex max-w-full items-center gap-3 rounded-xl border border-border/70 bg-background/80 px-3.5 py-2.5 shadow-sm">
      <span className="relative flex size-2.5 shrink-0">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/50 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
      </span>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground">Dashboard data</p>

        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {updated.valid ? (
            <time dateTime={updated.iso}>{updated.label}</time>
          ) : (
            "Update time unavailable"
          )}
        </p>
      </div>
    </div>
  );
}

async function StatsSection({ dataPromise }) {
  const data = await dataPromise;

  if (!data.metrics || Object.keys(data.metrics).length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="stats-title"
      className={`${enter} delay-75 space-y-4`}
    >
      <SectionHeading
        id="stats-title"
        title="Platform overview"
        description="A snapshot of the key numbers returned by your dashboard service."
        icon={LayoutDashboard}
      />

      <DashboardStats metrics={data.metrics} />
    </section>
  );
}

async function ChartsSection({ dataPromise }) {
  const data = await dataPromise;

  if (!data.charts) return null;

  return (
    <section
      aria-labelledby="charts-title"
      className={`${enter} delay-150 space-y-4`}
    >
      <SectionHeading
        id="charts-title"
        title="Analytics & insights"
        description="Explore platform trends and breakdowns using your existing analytics."
        icon={Activity}
      />

      <DashboardCharts charts={data.charts} />
    </section>
  );
}

async function ActivitySection({ activityPromise }) {
  const activity = await activityPromise;

  return (
    <section
      aria-labelledby="activity-title"
      className={`${enter} delay-200 space-y-4`}
    >
      <SectionHeading
        id="activity-title"
        title="Recent activity"
        description="The latest actions reported by your admin activity service."
        icon={Clock3}
      />

      <RecentActivity data={activity} />
    </section>
  );
}

/* Page */

export default async function AdminDashboardPage() {
  const user = await requirePermission(P.ADMIN_ACCESS);

  // Start both requests early so the dashboard shell can stream immediately.
  const dataPromise = getDashboardData(user.role);
  const activityPromise = getRecentActivity(user.role);

  const actions = quickActions.filter(
    (action) => can(user.role, action.permission) && isNavReady(action.href),
  );

  const first =
    (user.name || user.email || "").split(/[ @]/)[0].trim() || "there";

  const roleLabel = user.role ? String(user.role).replace(/[_-]/g, " ") : null;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-7 pb-8 sm:space-y-9">
      {/* Welcome header */}

      <section
        aria-labelledby="admin-dashboard-title"
        className={`${enter} relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-purple-500/5 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-1/3 size-56 rounded-full bg-yellow-400/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between lg:p-8">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 rounded-lg border-purple-500/20 bg-purple-500/5 px-2.5 py-1 text-purple-700 dark:text-purple-300"
              >
                <LayoutDashboard className="size-3.5" aria-hidden="true" />
                Admin workspace
              </Badge>

              {roleLabel ? (
                <Badge variant="secondary" className="rounded-lg capitalize">
                  <ShieldCheck className="mr-1 size-3.5" aria-hidden="true" />
                  {roleLabel}
                </Badge>
              ) : null}
            </div>

            <div className="space-y-2">
              <h1
                id="admin-dashboard-title"
                className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
              >
                Welcome back,{" "}
                <span className="text-purple-600 dark:text-purple-400">
                  {first}
                </span>
                <span className="text-yellow-500">.</span>
              </h1>

              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Your university at a glance. Manage learning, monitor activity
                and jump into your most-used tools.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span className="size-2 rounded-full bg-emerald-500" />
                Personalized workspace
              </span>

              <span className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-xs font-medium text-muted-foreground">
                <ShieldCheck
                  className="size-3.5 text-purple-500"
                  aria-hidden="true"
                />
                Permission-aware access
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <Suspense fallback={<ChipSkeleton />}>
              <UpdatedChip dataPromise={dataPromise} />
            </Suspense>
          </div>
        </div>

        <div className="flex h-1 w-full">
          <div className="w-1/2 bg-yellow-400" />
          <div className="w-1/2 bg-purple-500" />
        </div>
      </section>

      {/* Quick actions */}

      {actions.length > 0 && (
        <section
          aria-labelledby="quick-actions-title"
          className={`${enter} delay-75 space-y-4`}
        >
          <SectionHeading
            id="quick-actions-title"
            title="Quick actions"
            description="Get where you need to go without navigating through the entire sidebar."
            icon={Sparkles}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {actions.map((action, index) => {
              const Icon = action.icon;

              const accentStyles = [
                "bg-purple-500/10 text-purple-600 dark:text-purple-400",
                "bg-yellow-400/15 text-amber-600 dark:text-yellow-400",
                "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                "bg-blue-500/10 text-blue-600 dark:text-blue-400",
              ];

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Card className="relative h-full gap-0 overflow-hidden rounded-2xl border-border/70 bg-card py-0 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                    <CardContent className="flex h-full items-center gap-3.5 p-4 sm:p-5">
                      <div
                        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                          accentStyles[index % accentStyles.length]
                        } transition-transform duration-300 group-hover:scale-105`}
                      >
                        {Icon ? (
                          <Icon aria-hidden="true" className="size-5" />
                        ) : (
                          <ArrowUpRight aria-hidden="true" className="size-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                          {action.label}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Open workspace
                        </p>
                      </div>

                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                      />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Statistics */}

      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection dataPromise={dataPromise} />
      </Suspense>

      {/* Analytics */}

      <Suspense fallback={<ChartsSkeleton />}>
        <ChartsSection dataPromise={dataPromise} />
      </Suspense>

      {/* Recent activity */}

      <Suspense fallback={<ActivitySkeleton />}>
        <ActivitySection activityPromise={activityPromise} />
      </Suspense>

      {/* Workspace footer */}

      <footer className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400/15 text-amber-600 dark:text-yellow-400">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Your workspace is ready
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
              Use the available tools to manage your university. Access to
              actions and data follows your assigned permissions.
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-2 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Secure admin access
        </span>
      </footer>
    </div>
  );
}
