// components/admin/jobs/JobsTable.jsx
"use client";
import Link from "next/link";
import { FiBriefcase, FiStar } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LifecycleTable } from "@/components/admin/table/LifecycleTable";
import { employmentLabel, experienceLabel } from "@/config/jobs";
import { formatDate, formatPrice } from "@/lib/utils/format";
import {
  bulkJobAction,
  runJobAction,
  setJobFeatured,
} from "@/app/actions/admin/jobs";

export function JobsTable({ rows, perms }) {
  const columns = [
    {
      key: "title",
      header: "Job",
      className: "min-w-56",
      cell: (r) => (
        <div className="min-w-0">
          <Link
            href={`/admin/jobs/${r.slug}/edit`}
            className="line-clamp-2 font-medium hover:underline"
          >
            {r.title}
          </Link>
          <p className="text-xs text-muted-foreground">{r.company}</p>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      className: "text-muted-foreground",
      cell: (r) => (
        <>
          {r.location}
          {r.remote && (
            <Badge variant="secondary" className="ml-2">
              Remote
            </Badge>
          )}
        </>
      ),
    },
    {
      key: "type",
      header: "Type",
      className: "whitespace-nowrap text-muted-foreground",
      cell: (r) =>
        `${employmentLabel(r.employmentType)} · ${experienceLabel(r.experienceLevel)}`,
    },
    {
      key: "salary",
      header: "Salary",
      className: "whitespace-nowrap",
      cell: (r) =>
        r.salaryMin && r.salaryMax
          ? `${formatPrice(r.salaryMin, r.currency)}–${formatPrice(r.salaryMax, r.currency)}`
          : "—",
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
      className: "whitespace-nowrap text-muted-foreground",
      cell: (r) => formatDate(r.expiresAt) || "—",
    },
    {
      key: "updated",
      header: "Updated",
      className: "whitespace-nowrap text-muted-foreground",
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

