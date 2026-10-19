// app/(public)/verify/[code]/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiAward,
  FiBook,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiHash,
  FiLock,
  FiSearch,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/public/technology/Reveal";
import { TechScene } from "@/components/public/technology/TechScene";
import { VerifyActions, VerifyAnother } from "@/components/public/VerifyTools";
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
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function Detail({ icon: Icon, label, children, mono = false, className = "" }) {
  return (
    <div
      className={`min-w-0 rounded-xl border bg-background/60 p-4 sm:p-5 ${className}`}
    >
      <dt className="flex items-center gap-2">
        <Icon aria-hidden="true" className="size-4 text-primary" />
        <span className={labelClass}>{label}</span>
      </dt>
      <dd
        className={`mt-2 text-balance break-words text-lg font-semibold leading-snug text-foreground ${
          mono ? "break-all font-mono text-base sm:text-lg" : ""
        }`}
      >
        {children}
      </dd>
    </div>
  );
}

export default async function VerifyPage({ params }) {
  const { code } = await params;
  if (!/^[a-f0-9]{16}$/.test(code)) notFound();
  if (!(await rateLimit("verify", { limit: 30, windowSec: 600 })).ok)
    return (
      <Container className="max-w-xl py-16 sm:py-20">
        <Card
          role="alert"
          className="items-center gap-4 p-8 text-center shadow-sm sm:p-10"
        >
          <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <FiClock className="size-7" aria-hidden="true" />
          </span>
          <h1 className="text-balance text-2xl font-semibold leading-tight tracking-tight">
            Too many lookups
          </h1>
          <p className="max-w-sm leading-7 text-muted-foreground">
            Too many lookups. Please try again in a few minutes.
          </p>
          <Link
            href="/"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: `mt-2 min-h-11 ${focusRing}`,
            })}
          >
            Back to home
          </Link>
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
      <Container className="max-w-3xl space-y-8 py-10 sm:py-14">
        <Reveal>
          <Card
            className="relative gap-7 overflow-hidden p-6 shadow-md sm:p-9 print:shadow-none"
            role="status"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 top-0 h-1.5 ${
                valid
                  ? "bg-gradient-to-r from-primary to-highlight"
                  : "bg-destructive"
              }`}
            />

            {/* Result banner */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <span
                className={`grid size-16 shrink-0 place-items-center rounded-2xl ${
                  valid
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {valid ? (
                  <FiCheckCircle className="size-8" aria-hidden="true" />
                ) : (
                  <FiXCircle className="size-8" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0">
                <p
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                    valid
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                  }`}
                >
                  {valid ? "Verified" : "Revoked"}
                </p>
                <h2 className="mt-3 text-balance text-[clamp(1.5rem,3vw,2.125rem)] font-semibold leading-[1.1] tracking-tight">
                  {valid
                    ? "This certificate is valid"
                    : "This certificate has been revoked"}
                </h2>
                <p className="mt-2 text-base leading-7 text-muted-foreground">
                  {valid
                    ? "The details below match our records."
                    : "This certificate is no longer valid."}
                </p>
              </div>
            </div>

            {/* Record details */}
            <div
              className={
                valid
                  ? "grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_12rem]"
                  : ""
              }
            >
              <dl className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4">
                <Detail
                  icon={FiHash}
                  label="Certificate number"
                  mono
                  className="sm:col-span-2"
                >
                  {c.certificateNumber}
                </Detail>
                {valid && (
                  <>
                    <Detail icon={FiUser} label="Awarded to">
                      {c.studentName}
                    </Detail>
                    <Detail icon={FiCalendar} label="Issued">
                      {formatDate(c.issuedAt)}
                    </Detail>
                    <Detail
                      icon={FiBook}
                      label="Course"
                      className="sm:col-span-2"
                    >
                      {c.courseTitle}
                    </Detail>
                  </>
                )}
              </dl>

              {/* Restrained 3D accent, valid results only, large screens only */}
              {valid && (
                <div className="relative hidden h-44 md:block print:hidden">
                  <TechScene
                    minWidth={768}
                    scrollLinked={false}
                    className="absolute inset-0"
                  />
                </div>
              )}
            </div>

            {valid && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiAward
                  aria-hidden="true"
                  className="size-4 shrink-0 text-primary"
                />
                Issued by Apni University.
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
              <VerifyActions certificateNumber={c.certificateNumber} />
              {!valid && (
                <Link
                  href="/contact"
                  className={`${buttonVariants({
                    variant: "outline",
                    size: "default",
                    className: `group/btn min-h-11 ${focusRing}`,
                  })} print:hidden`}
                >
                  Think this is a mistake? Contact us
                  <FiArrowRight
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover/btn:translate-x-1 motion-reduce:transition-none"
                  />
                </Link>
              )}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <section aria-labelledby="verify-guidance" className="print:hidden">
            <h2
              id="verify-guidance"
              className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary"
            >
              How to read this result
            </h2>
            <ul className="grid gap-4 sm:grid-cols-3">
              {guidance.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="min-w-0 rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 motion-reduce:transition-none"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-sans text-base font-semibold leading-snug">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    {text}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        <Reveal delay={0.15}>
          <VerifyAnother />
        </Reveal>
      </Container>
    </>
  );
}
