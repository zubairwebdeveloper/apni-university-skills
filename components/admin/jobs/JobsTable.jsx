// components/admin/jobs/JobsTable.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiBriefcase, FiStar } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LifecycleTable } from "@/components/admin/table/LifecycleTable";
import { employmentLabel, experienceLabel } from "@/config/jobs";
import { formatDate, formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import {
  bulkJobAction,
  runJobAction,
  setJobFeatured,
} from "@/app/actions/admin/jobs";

const DAY_MS = 24 * 60 * 60 * 1000;
const SOON_DAYS = 7;

export function JobsTable({ rows, perms }) {
  // "Now" is read after mount so server and client render the same markup
  const [now, setNow] = useState(null);
  useEffect(() => {
    const timeout = window.setTimeout(() => setNow(Date.now()), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  // Expiry cell: the date, plus a pill when it has passed or is close
  function expiryCell(r) {
    const date = formatDate(r.expiresAt) || "—";
    if (!r.expiresAt || now === null) return date;
    if (r.expiresAt < now)
      return (
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium text-destructive">{date}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-destructive"
            />
            Expired
          </span>
        </span>
      );
    const days = Math.ceil((r.expiresAt - now) / DAY_MS);
    if (days <= SOON_DAYS)
      return (
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium text-foreground">{date}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium tabular-nums text-amber-700 dark:text-amber-400">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-amber-500"
            />
            {days}d left
          </span>
        </span>
      );
    return date;
  }

  const columns = [
    {
      key: "title",
      header: "Job",
      className: "min-w-64",
      cell: (r) => (
        <div className="min-w-0">
          <Link
            href={`/admin/jobs/${r.slug}/edit`}
            className="line-clamp-2 rounded-sm text-sm font-semibold leading-snug underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            {r.title}
          </Link>
          <p className="mt-0.5 max-w-64 truncate text-xs text-muted-foreground">
            {r.company}
          </p>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      className: "text-sm text-muted-foreground",
      cell: (r) =>
        r.location || r.remote ? (
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
            {r.location && (
              <span className="max-w-40 truncate">{r.location}</span>
            )}
            {r.remote && <Badge variant="secondary">Remote</Badge>}
          </span>
        ) : (
          <span aria-label="No location">—</span>
        ),
    },
    {
      key: "type",
      header: "Type",
      className: "whitespace-nowrap",
      cell: (r) => (
        <div className="leading-tight">
          <p className="text-sm">{employmentLabel(r.employmentType)}</p>
          <p className="text-xs text-muted-foreground">
            {experienceLabel(r.experienceLevel)}
          </p>
        </div>
      ),
    },
    {
      key: "salary",
      header: "Salary",
      className: "whitespace-nowrap text-sm tabular-nums",
      cell: (r) =>
        r.salaryMin && r.salaryMax ? (
          <span className="font-medium">
            {formatPrice(r.salaryMin, r.currency)}–
            {formatPrice(r.salaryMax, r.currency)}
          </span>
        ) : (
          <span className="text-muted-foreground" aria-label="No salary">
            —
          </span>
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "featured",
      header: "Featured",
      cell: (r) =>
        r.featured ? (
          <>
            <FiStar
              className="size-4 fill-current text-highlight"
              aria-hidden="true"
            />
            <span className="sr-only">Featured</span>
          </>
        ) : (
          <span className="text-muted-foreground" aria-label="Not featured">
            —
          </span>
        ),
    },
    {
      key: "expires",
      header: "Expires",
      className: "whitespace-nowrap text-sm tabular-nums text-muted-foreground",
      cell: expiryCell,
    },
    {
      key: "updated",
      header: "Updated",
      className: "whitespace-nowrap text-sm tabular-nums text-muted-foreground",
      cell: (r) => formatDate(r.updatedAt),
    },
  ];
  return (
    <LifecycleTable
      rows={rows}
      perms={perms}
      prefix="jobs"
      noun="Job"
      plural="jobs"
      caption="Jobs"
      columns={columns}
      basePath="/admin/jobs"
      hasView={false}
      run={runJobAction}
      bulk={bulkJobAction}
      emptyIcon={FiBriefcase}
      emptyTitle="No jobs match"
      minWidth="min-w-[1080px]"
      extraItems={(r) => [
        {
          key: "feature",
          label: r.featured ? "Remove featured" : "Feature",
          icon: FiStar,
          hidden: !perms.includes("jobs.update") || r.status === "deleted",
          run: () => setJobFeatured({ slug: r.slug, featured: !r.featured }),
          success: r.featured
            ? "Job is no longer featured."
            : "Job featured successfully.",
        },
      ]}
    />
  );
}
