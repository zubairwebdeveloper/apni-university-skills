// components/student/CertificateCard.jsx

import Link from "next/link";

import { FiAward, FiExternalLink, FiSlash } from "react-icons/fi";

import { Card } from "@/components/ui/card";

import { formatDate } from "@/lib/utils/format";

export function CertificateCard({ certificate: c }) {
  const revoked = c.status === "revoked";

  return (
    <Card
      className={`gap-0 p-1.5 ${
        revoked ? "border-destructive/40" : "border-highlight/50"
      }`}
    >
      {/* Inner frame gives the card a certificate-like double border. */}
      <div
        className={`flex flex-1 flex-col gap-4 rounded-lg border p-5 sm:p-6 ${
          revoked ? "border-destructive/30" : "border-highlight/40"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className={`grid size-12 shrink-0 place-items-center rounded-full ${
              revoked
                ? "bg-muted text-muted-foreground"
                : "bg-highlight/30 text-highlight-foreground"
            }`}
          >
            <FiAward className="size-6" aria-hidden="true" />
          </span>

          {revoked && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
              <FiSlash className="size-3.5" aria-hidden="true" />
              Revoked
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">
            Certificate of completion
          </p>

          <h3
            className={`text-balance break-words font-serif text-xl font-semibold leading-snug sm:text-2xl ${
              revoked ? "text-muted-foreground" : ""
            }`}
          >
            {c.courseTitle}
          </h3>

          <p className="text-sm text-muted-foreground">
            Awarded to{" "}
            <span className="font-medium text-foreground">{c.studentName}</span>
          </p>
        </div>

        <dl className="mt-auto grid grid-cols-1 gap-3 border-t pt-4 text-xs min-[400px]:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-muted-foreground">Issued</dt>
            <dd className="mt-0.5 text-sm font-medium">
              {formatDate(c.issuedAt)}
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-muted-foreground">Certificate no.</dt>
            <dd className="mt-0.5 break-all font-mono text-sm font-medium">
              {c.certificateNumber}
            </dd>
          </div>
        </dl>

        {c.verificationCode && !revoked && (
          <Link
            href={`/verify/${c.verificationCode}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            View public verification
            <FiExternalLink className="size-4" aria-hidden="true" />
          </Link>
        )}

        {revoked && (
          <p className="text-sm text-destructive">
            This certificate has been revoked and can no longer be verified.
          </p>
        )}
      </div>
    </Card>
  );
}
