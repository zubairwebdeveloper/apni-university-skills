// app/(public)/verify/[code]/page.jsx
import { notFound } from "next/navigation";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { rateLimit } from "@/lib/security/rateLimit";
import { certificateRepository } from "@/repositories/certificateRepository";
import { formatDate } from "@/lib/utils/format";

export const metadata = {
  title: "Verify a certificate",
  robots: { index: false, follow: false },
};

export default async function VerifyPage({ params }) {
  const { code } = await params;
  if (!/^[a-f0-9]{16}$/.test(code)) notFound();
  if (!(await rateLimit("verify", { limit: 30, windowSec: 600 })).ok)
    return (
      <Container className="py-20">
        <p role="alert" className="text-center text-muted-foreground">
          Too many lookups. Please try again in a few minutes.
        </p>
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
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Verify" }]}
      />
      <Container className="max-w-2xl py-10">
        <Card className="gap-4 p-6" role="status">
          <div className="flex items-center gap-3">
            {valid ? (
              <FiCheckCircle
                className="size-8 text-primary"
                aria-hidden="true"
              />
            ) : (
              <FiXCircle
                className="size-8 text-destructive"
                aria-hidden="true"
              />
            )}
            <h2 className="text-xl">
              {valid
                ? "This certificate is valid"
                : "This certificate has been revoked"}
            </h2>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">
                Certificate number
              </dt>
              <dd className="font-mono font-medium">{c.certificateNumber}</dd>
            </div>
            {valid && (
              <>
                <div>
                  <dt className="text-xs text-muted-foreground">Awarded to</dt>
                  <dd className="font-medium">{c.studentName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Course</dt>
                  <dd className="font-medium">{c.courseTitle}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Issued</dt>
                  <dd className="font-medium">{formatDate(c.issuedAt)}</dd>
                </div>
              </>
            )}
          </dl>
        </Card>
      </Container>
    </>
  );
}
