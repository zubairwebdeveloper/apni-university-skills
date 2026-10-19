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
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiExternalLink,
  FiFileText,
  FiList,
  FiMapPin,
  FiTarget,
  FiZap,
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
import { cn } from "@/lib/utils";

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

const iconTile =
  "grid shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15";

// Section heading with an icon tile that reinforces what the block is about.
function SectionTitle({ id, icon: Icon, children }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className={cn(iconTile, "size-10")}>
        <Icon aria-hidden="true" className="size-[18px]" />
      </span>
      <h2
        id={id}
        className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
      >
        {children}
      </h2>
    </div>
  );
}

function List({ id, title, icon, items }) {
  if (!items?.length) return null;

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 border-t border-border pt-10"
    >
      <SectionTitle id={`${id}-title`} icon={icon}>
        {title}
      </SectionTitle>

      <ul className="max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
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
      <span className={cn(iconTile, "size-9 rounded-lg")}>
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium text-foreground">
          {children}
        </dd>
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
      <div className="relative overflow-x-clip border-b border-border bg-secondary/40">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 size-[28rem] rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
        />
        <Container className="relative py-8 sm:py-12 lg:py-14">
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
              <div className="absolute inset-0 grid place-items-center overflow-hidden rounded-2xl border border-border bg-card font-serif text-2xl text-foreground shadow-lg [transform:translateZ(22px)] sm:text-3xl">
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
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                >
                  {employmentLabel(job.employmentType)}
                </Badge>
                {job.experienceLevel && (
                  <Badge
                    variant="secondary"
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                  >
                    {experienceLabel(job.experienceLevel)}
                  </Badge>
                )}
                {job.remote && (
                  <Badge
                    variant="outline"
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                  >
                    Remote
                  </Badge>
                )}
                {expired && (
                  <Badge
                    variant="destructive"
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                  >
                    Expired
                  </Badge>
                )}
                {closingSoon && (
                  <Badge className="gap-1 rounded-full bg-highlight px-3 py-1 text-xs font-semibold text-highlight-foreground">
                    <FiClock aria-hidden="true" className="size-3" />
                    {daysLeftLabel}
                  </Badge>
                )}
              </div>

              <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {job.title}
              </h1>

              <p className="mt-2 flex flex-wrap items-center gap-x-2 text-lg text-muted-foreground">
                <span className="font-medium text-foreground">
                  {job.company}
                </span>
                {job.location && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <FiMapPin aria-hidden="true" className="size-4" />
                      {job.location}
                    </span>
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
                    className="inline-flex min-h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm outline-none transition-colors duration-200 hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
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
        className={cn(
          "grid gap-10 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14 lg:pb-14",
          showStickyApply ? "pb-28" : "pb-10",
        )}
      >
        <div className="min-w-0 space-y-10">
          <section
            id="role"
            aria-labelledby="about-role"
            className="scroll-mt-24"
          >
            <SectionTitle id="about-role" icon={FiFileText}>
              About the role
            </SectionTitle>

            <div className="max-w-3xl leading-relaxed text-muted-foreground">
              <Paragraphs text={job.description} />
            </div>
          </section>

          <List
            id="resp"
            title="Responsibilities"
            icon={FiList}
            items={job.responsibilities}
          />

          <List
            id="reqs"
            title="Requirements"
            icon={FiTarget}
            items={job.requirements}
          />

          {job.skills?.length > 0 && (
            <section
              id="skills-job"
              aria-labelledby="skills-job-title"
              className="scroll-mt-24 border-t border-border pt-10"
            >
              <SectionTitle id="skills-job-title" icon={FiZap}>
                Skills
              </SectionTitle>

              <ul className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <li key={skill}>
                    <Badge variant="secondary" className="px-3 py-1 text-sm">
                      {skill}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="border-t border-border pt-8">
            <Link
              href="/jobs"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "group",
              )}
            >
              <FiArrowLeft
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              />
              Back to all jobs
            </Link>
          </div>
        </div>

        <aside aria-label="Job summary">
          <Card className="gap-5 p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Job summary
            </h2>

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
                  <span className="tabular-nums">{salary}</span>
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
                      className={cn(
                        "ml-2 text-xs font-normal",
                        closingSoon
                          ? "font-medium text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      ({daysLeftLabel})
                    </span>
                  )}
                </Fact>
              )}
            </dl>

            {expired ? (
              <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground">
                This listing has expired and is no longer accepting
                applications.
              </p>
            ) : applyUrl ? (
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={cn(
                  buttonVariants({
                    size: "lg",
                  }),
                  "group w-full",
                )}
              >
                Apply on company site
                <FiExternalLink
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">
                No application link is available for this listing.
              </p>
            )}

            {!expired && (
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <FiCheckCircle
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0 text-primary"
                />
                <span>
                  You will leave Apni University to apply. We don&apos;t review
                  applications.
                </span>
              </p>
            )}
          </Card>
        </aside>
      </Container>

      {/* Mobile apply bar: keeps the main action reachable on long listings */}
      {showStickyApply && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_-8px_rgb(0_0_0/0.2)] backdrop-blur lg:hidden">
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
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      )}
    </>
  );
}
