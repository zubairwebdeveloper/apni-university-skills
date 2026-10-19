// components/public/JobCard.jsx
import Link from "next/link";
import Image from "next/image";
import { FiArrowRight, FiMapPin } from "react-icons/fi";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils/format";
import { employmentLabel } from "@/config/jobs";

export function JobCard({ job }) {
  const salary =
    job.salaryMin && job.salaryMax
      ? `${formatPrice(job.salaryMin, job.currency)} – ${formatPrice(job.salaryMax, job.currency)}`
      : null;
  const initial = job.company?.trim().charAt(0).toUpperCase();

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card
        className={cn(
          "h-full flex-row items-start gap-4 p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-300 sm:gap-5 sm:p-6",
          "group-hover:border-primary/40 group-hover:shadow-xl",
          "motion-safe:group-hover:-translate-y-0.5",
        )}
      >
        {/* Company logo, or an initial on an accent tint */}
        <div
          aria-hidden="true"
          className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border bg-muted font-serif text-lg text-primary transition-colors duration-300 group-hover:border-primary/30 sm:size-14 sm:text-xl"
        >
          {job.companyLogo ? (
            <Image
              src={job.companyLogo}
              alt=""
              fill
              sizes="56px"
              className="object-contain p-1.5"
            />
          ) : (
            initial
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="min-w-0">
            <h3 className="font-serif text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-xl">
              {job.title}
            </h3>
            {job.company && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {job.company}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
            {job.location && (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <FiMapPin aria-hidden="true" className="size-3.5" />
                {job.location}
              </span>
            )}
            {job.remote && <Badge variant="secondary">Remote</Badge>}
            {job.employmentType && (
              <Badge variant="outline">
                {employmentLabel(job.employmentType)}
              </Badge>
            )}
          </div>

          {/* Footer: salary and call to action */}
          <div className="mt-auto flex items-center justify-between gap-3 border-t pt-3">
            {salary ? (
              <p className="min-w-0 text-sm font-semibold tabular-nums">
                <span className="sr-only">Salary: </span>
                {salary}
              </p>
            ) : (
              <span />
            )}
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary">
              View job
              <FiArrowRight
                aria-hidden="true"
                className="size-3.5 transition-transform duration-300 motion-safe:group-hover:translate-x-1"
              />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
