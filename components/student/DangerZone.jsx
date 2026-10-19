import Link from "next/link";
import { FiAlertOctagon, FiTrash2, FiArchive } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export function DangerZone() {
  return (
    <Card id="danger" className="scroll-mt-24 gap-5 border-destructive/30 p-6">
      <div className="flex items-start gap-3.5">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20"
          aria-hidden="true"
        >
          <FiAlertOctagon className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-tight tracking-tight text-destructive">
            Delete account
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Deleting your account is permanent and can&apos;t be undone.
          </p>
        </div>
      </div>

      <ul className="grid gap-3 text-sm sm:grid-cols-2">
        <li className="flex items-start gap-2.5 rounded-lg bg-muted/50 p-3.5">
          <FiTrash2
            className="mt-0.5 size-4 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <span className="leading-relaxed">
            <span className="block font-medium">Permanently removed</span>
            <span className="text-muted-foreground">
              Your enrollments, learning progress and reviews.
            </span>
          </span>
        </li>
        <li className="flex items-start gap-2.5 rounded-lg bg-muted/50 p-3.5">
          <FiArchive
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="leading-relaxed">
            <span className="block font-medium">Kept for a limited time</span>
            <span className="text-muted-foreground">
              Purchase records, retained for tax and refund purposes.
            </span>
          </span>
        </li>
      </ul>

      <div>
        <Link
          href="/contact?subject=Delete%20my%20account"
          className={`${buttonVariants({
            variant: "outline",
            size: "sm",
          })} border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:ring-destructive/40`}
        >
          Request account deletion
        </Link>
      </div>
    </Card>
  );
}
