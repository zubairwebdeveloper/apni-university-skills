// app/(public)/jobs/[slug]/page.jsx

import { cache } from "react";

import Image from "next/image";
import { notFound } from "next/navigation";

import { FiMapPin } from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { JsonLd } from "@/components/shared/JsonLd";
import { Paragraphs } from "@/components/shared/Paragraphs";

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

const List = ({ id, title, items }) =>
  items?.length > 0 && (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-3 text-xl">
        {title}
      </h2>

      <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );

export default async function JobPage({ params }) {
  const { slug } = await params;

  const job = await getJob(slug);

  if (!job) {

    notFound();
  }

  const expired = !!job.expiresAt && job.expiresAt < getCurrentTime();

  const applyUrl = safeExternalUrl(job.applyUrl);

  const salary =
    job.salaryMin != null && job.salaryMax != null
      ? `${formatPrice(job.salaryMin, job.currency)} – ${formatPrice(
          job.salaryMax,
          job.currency,
        )}`
      : null;

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

      <div className="border-b bg-secondary/40">
        <Container className="py-8 sm:py-12">
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

          <div className="mt-6 flex items-start gap-4">
            <div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border bg-card font-serif text-xl">
              {job.companyLogo ? (
                <Image
                  src={job.companyLogo}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-contain p-1.5"
                />
              ) : (
                job.company?.charAt(0)
              )}
            </div>

            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl">{job.title}</h1>

              <p className="mt-1 text-muted-foreground">{job.company}</p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="about-role">
            <h2 id="about-role" className="mb-3 text-xl">
              About the role
            </h2>

            <Paragraphs text={job.description} />
          </section>

          <List
            id="resp"
            title="Responsibilities"
            items={job.responsibilities}
          />

          <List id="reqs" title="Requirements" items={job.requirements} />

          {job.skills?.length > 0 && (
            <section aria-labelledby="skills-job">
              <h2 id="skills-job" className="mb-3 text-xl">
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
        </div>

        <aside>
          <Card className="gap-4 p-5 lg:sticky lg:top-24">
            <ul className="space-y-2 text-sm">
              {job.location && (
                <li className="flex items-center gap-2 text-muted-foreground">
                  <FiMapPin aria-hidden="true" />
                  {job.location}
                  {job.remote && " · Remote"}
                </li>
              )}

              <li className="text-muted-foreground">
                {employmentLabel(job.employmentType)}
                {job.experienceLevel &&
                  ` · ${experienceLabel(job.experienceLevel)}`}
              </li>

              {salary && <li className="font-medium">{salary}</li>}

              {job.publishedAt && (
                <li className="text-muted-foreground">
                  Posted {formatDate(job.publishedAt)}
                </li>
              )}

              {job.expiresAt && (
                <li
                  className={
                    expired
                      ? "font-medium text-destructive"
                      : "text-muted-foreground"
                  }
                >
                  {expired
                    ? `Expired ${formatDate(job.expiresAt)}`
                    : `Applications close ${formatDate(job.expiresAt)}`}
                </li>
              )}
            </ul>

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
    </>
  );
}
