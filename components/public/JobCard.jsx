// components/public/JobCard.jsx
import Link from "next/link";
import Image from "next/image";
import { FiMapPin } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils/format";
import { employmentLabel } from "@/config/jobs";
export function JobCard({ job }) {
  const salary =
    job.salaryMin && job.salaryMax
      ? `${formatPrice(job.salaryMin, job.currency)} – ${formatPrice(job.salaryMax, job.currency)}`
      : null;
  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="flex-row items-start gap-4 p-5 transition-shadow group-hover:shadow-md">
        <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted font-serif text-lg">
          {job.companyLogo ? (
            <Image
              src={job.companyLogo}
              alt=""
              fill
              sizes="48px"
              className="object-contain p-1"
            />
          ) : (
            job.company?.charAt(0)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-lg font-semibold leading-snug">
            {job.title}
          </h3>
          <p className="text-sm text-muted-foreground">{job.company}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <FiMapPin aria-hidden="true" />
              {job.location}
            </span>
            {job.remote && <Badge variant="secondary">Remote</Badge>}
            <Badge variant="outline">
              {employmentLabel(job.employmentType)}
            </Badge>{" "}
            {salary && <span className="text-muted-foreground">{salary}</span>}
          </div>
        </div>
      </Card>
    </Link>
  );
}

