// app/(public)/verify/[code]/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiEye,
  FiLock,
  FiSearch,
  FiXCircle,
} from "react-icons/fi";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/public/technology/Reveal";
import { TechScene } from "@/components/public/technology/TechScene";
import {
  VerifyActions,
  VerifyAnother,
} from "@/components/public/VerifyTools";
import { rateLimit } from "@/lib/security/rateLimit";
import { certificateRepository } from "@/repositories/certificateRepository";
import { formatDate } from "@/lib/utils/format";

export const metadata = {
  title: "Verify a certificate",
  robots: { index: false, follow: false },
};

const guidance = [
  {
    icon: FiSearch,
    title: "Compare the details",
    text: "Check that the name and course below match the certificate you were given.",
  },
  {
    icon: FiEye,
    title: "Only what is printed",
    text: "We show only what a certificate itself states. No other student information is public.",
  },
  {
    icon: FiLock,
    title: "Revoked certificates",
    text: "If a certificate has been revoked, only its number is shown.",
  },
];

const labelClass =
  "text-xs font-medium uppercase tracking-wider text-muted-foreground";

export default async function VerifyPage({ params }) {
  const { code } = await params;
  if (!/^[a-f0-9]{16}$/.test(code)) notFound();
  if (!(await rateLimit("verify", { limit: 30, windowSec: 600 })).ok)
    return (
      <Container className="max-w-xl py-20">
        <Card role="alert" className="items-center gap-3 p-8 text-center">
          <FiAlertTriangle
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-muted-foreground">
            Too many lookups. Please try again in a few minutes.
          </p>
        </Card>
      </Container>
    );
  const c = await certificateRepository.findByVerificationCode(code);
  if (!c) notFound();
  const valid = (c.status ?? "valid") === "valid";
  // Public projection only: nothing about the student beyond what a certificate itself states
  return (
    <>
      <PageHeader
        title="Certificate verification"
        description="Confirm whether a certificate was issued by Apni University."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Verify" }]}
      />
      <Container className="max-w-3xl space-y-6 py-10">
        <Reveal>
          <Card
            className="relative gap-6 overflow-hidden p-6 sm:p-8 print:shadow-none"
            role="status"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 top-0 h-1 ${
                valid
                  ? "bg-gradient-to-r from-primary to-highlight"
                  : "bg-destructive"
              }`}
            />

            <div className="flex items-start gap-4">
              <span
                className={`grid size-14 shrink-0 place-items-center rounded-2xl ${
                  valid
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {valid ? (
                  <FiCheckCircle className="size-7" aria-hidden="true" />
                ) : (
                  <FiXCircle className="size-7" aria-hidden="true" />
                )}
              </span>
              <div>
                <h2 className="text-balance text-[clamp(1.25rem,2.5vw,1.75rem)] font-semibold leading-tight tracking-tight">
                  {valid
                    ? "This certificate is valid"
                    : "This certificate has been revoked"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {valid
                    ? "The details below match our records."
                    : "This certificate is no longer valid."}
                </p>
              </div>
            </div>

            <div
              className={
                valid
                  ? "grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_12rem]"
                  : ""
              }
            >
              <dl className="grid gap-5 text-sm sm:grid-cols-2">
                <div>
                  <dt className={labelClass}>Certificate number</dt>
                  <dd className="mt-1 break-all font-mono text-base font-medium">
                    {c.certificateNumber}
                  </dd>
                </div>
                {valid && (
                  <>
                    <div>
                      <dt className={labelClass}>Awarded to</dt>
                      <dd className="mt-1 text-base font-medium">
                        {c.studentName}
                      </dd>
                    </div>
                    <div>
                      <dt className={labelClass}>Course</dt>
                      <dd className="mt-1 text-base font-medium">
                        {c.courseTitle}
                      </dd>
                    </div>
                    <div>
                      <dt className={labelClass}>Issued</dt>
                      <dd className="mt-1 text-base font-medium">
                        {formatDate(c.issuedAt)}
                      </dd>
                    </div>
                  </>
                )}
              </dl>

              {/* Restrained 3D accent, valid results only, large screens only */}
              {valid && (
                <div className="relative hidden h-40 md:block print:hidden">
                  <TechScene
                    minWidth={768}
                    scrollLinked={false}
                    className="absolute inset-0"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <VerifyActions certificateNumber={c.certificateNumber} />
              {!valid && (
                <Link
                  href="/contact"
                  className={`${buttonVariants({ variant: "outline", size: "sm" })} print:hidden`}
                >
                  Think this is a mistake? Contact us
                </Link>
              )}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="grid gap-4 sm:grid-cols-3">
            {guidance.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="rounded-2xl border bg-card p-5 print:hidden"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-sans text-sm font-semibold">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <VerifyAnother />
        </Reveal>
      </Container>
    </>
  );
}
