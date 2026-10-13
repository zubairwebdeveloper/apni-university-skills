// app/(public)/jobs/[slug]/page.jsx

import { cache } from "react";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  FiArrowLeft,
  FiArrowRight,
  FiBarChart2,
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiMapPin,
} from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { JsonLd } from "@/components/shared/JsonLd";
import { Paragraphs } from "@/components/shared/Paragraphs";
import { TiltCard } from "@/components/public/TiltCard";

import { jobService } from "@/services/jobService";

import { safe } from "@/lib/utils/safe";
import { safeExternalUrl } from "@/lib/utils/url";
import { formatDate, formatPrice } from "@/lib/utils/format";

import {
  EMPLOYMENT_TYPES,
  employmentLabel,
  experienceLabel,
} from "@/config/jobs";

export const revalidate = 300;

const getJob = cache((slug) => jobService.getJobBySlug(slug));

const getCurrentTime = cache(() => Date.now());

const iso = (ms) => (ms ? new Date(ms).toISOString() : undefined);

const DAY_MS = 24 * 60 * 60 * 1000;

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const job = await safe(getJob(slug), null);

  if (!job) {
    return {
      title: "Job not found",
      robots: {
        index: false,
      },
    };
  }

  const expired = !!job.expiresAt && job.expiresAt < getCurrentTime();

  const title = `${job.title} at ${job.company}`;

  const description = `${job.title} at ${job.company}${
    job.location ? ` in ${job.location}` : ""
  }${job.remote ? " (remote)" : ""}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/jobs/${job.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/jobs/${job.slug}`,
    },
    robots: expired
      ? {
          index: false,
        }
      : undefined,
  };
}

function List({ id, title, items }) {
  if (!items?.length) return null;

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 border-t pt-10"
    >
      <h2 id={`${id}-title`} className="mb-4 text-xl sm:text-2xl">
        {title}
      </h2>

      <ul className="max-w-3xl space-y-3 text-sm text-muted-foreground sm:text-base">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary"
            />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Fact({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-primary"
      />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium text-foreground">{children}</dd>
      </div>
    </div>
  );
}

export default async function JobPage({ params }) {
  const { slug } = await params;

  const job = await getJob(slug);

  if (!job) {
    notFound();
  }

  const now = getCurrentTime();
  const expired = !!job.expiresAt && job.expiresAt < now;

  const applyUrl = safeExternalUrl(job.applyUrl);

  const salary =
    job.salaryMin != null && job.salaryMax != null
      ? `${formatPrice(job.salaryMin, job.currency)} – ${formatPrice(
          job.salaryMax,
          job.currency,
        )}`
      : null;

  // Time left to apply (real expiry date only)
  const daysLeft =
    job.expiresAt && !expired
      ? Math.max(1, Math.ceil((job.expiresAt - now) / DAY_MS))
      : null;
  const closingSoon = daysLeft !== null && daysLeft <= 7;
  const daysLeftLabel =
    daysLeft === null
      ? null
      : daysLeft === 1
        ? "1 day left"
        : `${daysLeft} days left`;

  const showStickyApply = !expired && !!applyUrl;

  // In-page navigation lists only sections that render
  const sections = [
    { id: "role", label: "The role" },
    ...(job.responsibilities?.length
      ? [{ id: "resp", label: "Responsibilities" }]
      : []),
    ...(job.requirements?.length
      ? [{ id: "reqs", label: "Requirements" }]
      : []),
    ...(job.skills?.length ? [{ id: "skills-job", label: "Skills" }] : []),
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: job.title,
          description: job.description,
          datePosted: iso(job.publishedAt),
          validThrough: iso(job.expiresAt),
          employmentType: EMPLOYMENT_TYPES.find(
            (type) => type.value === job.employmentType,
          )?.schema,
          hiringOrganization: {
            "@type": "Organization",
            name: job.company,
            logo: job.companyLogo,
          },
          jobLocationType: job.remote ? "TELECOMMUTE" : undefined,
          jobLocation: job.location
            ? {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: job.location,
                },
              }
            : undefined,
        }}
      />

      {/* Job header */}
      <div className="overflow-x-clip border-b bg-secondary/40">
        <Container className="py-8 sm:py-12 lg:py-14">
          <PageBreadcrumbs
            items={[
              {
                label: "Home",
                href: "/",
              },
              {
                label: "Jobs",
                href: "/jobs",
              },
              {
                label: job.title,
              },
            ]}
          />

          <div className="mt-8 flex items-start gap-5 sm:gap-6">
            {/* 3D company tile: depth layers, tilts toward the pointer on desktop */}
            <TiltCard className="size-16 shrink-0 sm:size-20" max={14}>
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl bg-highlight/40 [transform:translateZ(-14px)_translate(6px,6px)]"
              />
              <div className="absolute inset-0 grid place-items-center overflow-hidden rounded-2xl border bg-card font-serif text-2xl text-foreground shadow-lg [transform:translateZ(22px)] sm:text-3xl">
                {job.companyLogo ? (
                  <Image
                    src={job.companyLogo}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                ) : (
                  job.company?.charAt(0)
                )}
              </div>
            </TiltCard>

            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {employmentLabel(job.employmentType)}
                </Badge>
                {job.experienceLevel && (
                  <Badge variant="secondary">
                    {experienceLabel(job.experienceLevel)}
                  </Badge>
                )}
                {job.remote && <Badge variant="outline">Remote</Badge>}
                {expired && <Badge variant="destructive">Expired</Badge>}
                {closingSoon && (
                  <Badge className="bg-highlight text-highlight-foreground">
                    {daysLeftLabel}
                  </Badge>
                )}
              </div>

              <h1 className="text-balance text-3xl tracking-tight sm:text-4xl lg:text-5xl">
                {job.title}
              </h1>

              <p className="mt-2 text-lg text-muted-foreground">
                {job.company}
                {job.location && (
                  <>
                    <span aria-hidden="true"> · </span>
                    {job.location}
                  </>
                )}
              </p>
            </div>
          </div>

          <nav aria-label="On this page" className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="inline-flex min-h-9 items-center rounded-full border bg-card px-4 text-sm font-medium text-foreground outline-none transition-colors hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>

      <Container
        className={`grid gap-10 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14 lg:pb-14 ${
          showStickyApply ? "pb-28" : "pb-10"
        }`}
      >
        <div className="min-w-0 space-y-10">
          <section
            id="role"
            aria-labelledby="about-role"
            className="scroll-mt-24"
          >
            <h2 id="about-role" className="mb-4 text-xl sm:text-2xl">
              About the role
            </h2>

            <div className="max-w-3xl">
              <Paragraphs text={job.description} />
            </div>
          </section>

          <List
            id="resp"
            title="Responsibilities"
            items={job.responsibilities}
          />

          <List id="reqs" title="Requirements" items={job.requirements} />

          {job.skills?.length > 0 && (
            <section
              id="skills-job"
              aria-labelledby="skills-job-title"
              className="scroll-mt-24 border-t pt-10"
            >
              <h2 id="skills-job-title" className="mb-4 text-xl sm:text-2xl">
                Skills
              </h2>

              <ul className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <li key={skill}>
                    <Badge variant="secondary">{skill}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="border-t pt-8">
            <Link
              href="/jobs"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <FiArrowLeft aria-hidden="true" />
              Back to all jobs
            </Link>
          </div>
        </div>

        <aside>
          <Card className="gap-5 p-5 sm:p-6 lg:sticky lg:top-24">
            <dl className="space-y-4">
              {job.location && (
                <Fact icon={FiMapPin} label="Location">
                  {job.location}
                  {job.remote && " · Remote"}
                </Fact>
              )}

              <Fact icon={FiBriefcase} label="Employment type">
                {employmentLabel(job.employmentType)}
              </Fact>

              {job.experienceLevel && (
                <Fact icon={FiBarChart2} label="Experience">
                  {experienceLabel(job.experienceLevel)}
                </Fact>
              )}

              {salary && (
                <Fact icon={FiDollarSign} label="Salary">
                  {salary}
                </Fact>
              )}

              {job.publishedAt && (
                <Fact icon={FiCalendar} label="Posted">
                  {formatDate(job.publishedAt)}
                </Fact>
              )}

              {job.expiresAt && (
                <Fact icon={FiClock} label={expired ? "Expired" : "Closes"}>
                  <span className={expired ? "text-destructive" : undefined}>
                    {formatDate(job.expiresAt)}
                  </span>
                  {daysLeftLabel && (
                    <span
                      className={`ml-2 text-xs font-normal ${
                        closingSoon
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      ({daysLeftLabel})
                    </span>
                  )}
                </Fact>
              )}
            </dl>

            {expired ? (
              <p className="rounded-md border p-3 text-sm text-muted-foreground">
                This listing has expired and is no longer accepting
                applications.
              </p>
            ) : applyUrl ? (
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={buttonVariants({
                  size: "lg",
                  className: "w-full",
                })}
              >
                Apply on company site
                <FiArrowRight aria-hidden="true" />
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">
                No application link is available for this listing.
              </p>
            )}

            {!expired && (
              <p className="text-xs text-muted-foreground">
                You will leave Apni University to apply. We don&apos;t review
                applications.
              </p>
            )}
          </Card>
        </aside>
      </Container>

      {/* Mobile apply bar: keeps the main action reachable on long listings */}
      {showStickyApply && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={buttonVariants({
              size: "lg",
              className: "w-full",
            })}
          >
            Apply on company site
            <FiArrowRight aria-hidden="true" />
          </a>
        </div>
      )}
    </>
  );
}
