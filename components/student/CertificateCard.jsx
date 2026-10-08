// components/student/CertificateCard.jsx

import Link from "next/link";

import { FiAward } from "react-icons/fi";

import { Card } from "@/components/ui/card";

import { formatDate } from "@/lib/utils/format";

export function CertificateCard({ certificate: c }) {
  return (
    <Card className="gap-3 border-highlight/50 p-6">
      <span className="grid size-12 place-items-center rounded-full bg-highlight/30 text-highlight-foreground">
        <FiAward className="size-6" aria-hidden="true" />
      </span>

      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Certificate of completion
      </p>

      <h3 className="font-serif text-xl font-semibold leading-snug">
        {c.courseTitle}
      </h3>

      <p className="text-sm text-muted-foreground">
        Awarded to{" "}
        <span className="font-medium text-foreground">{c.studentName}</span>
      </p>

      <dl className="mt-auto grid grid-cols-2 gap-2 border-t pt-3 text-xs">
        <div>
          <dt className="text-muted-foreground">Issued</dt>
          <dd className="font-medium">{formatDate(c.issuedAt)}</dd>
        </div>

        <div>
          <dt className="text-muted-foreground">Certificate no.</dt>
          <dd className="font-mono font-medium">{c.certificateNumber}</dd>
        </div>
      </dl>

      {c.verificationCode && c.status !== "revoked" && (
        <Link
          href={`/verify/${c.verificationCode}`}
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Public verification link
        </Link>
      )}

      {c.status === "revoked" && (
        <p className="text-xs font-medium text-destructive">
          This certificate has been revoked.
        </p>
      )}
    </Card>
  );
}

