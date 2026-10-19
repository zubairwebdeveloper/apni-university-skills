// components/admin/certificates/CertificateControls.jsx: revoke needs a reason, so it lives on the detail page
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiAlertCircle, FiCheckCircle, FiSlash } from "react-icons/fi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  reinstateCertificate,
  revokeCertificate,
} from "@/app/actions/admin/certificates";

const MIN_REASON = 5;
const MAX_REASON = 200;

export function CertificateControls({ slug, status }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reinstate, setReinstate] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const revoked = status === "revoked";
  const statusLabel = status
    ? `${status.charAt(0).toUpperCase()}${status.slice(1)}`
    : "";
  const reasonLength = reason.trim().length;
  const tooShort = reasonLength < MIN_REASON;

  function openDialog() {
    setReason("");
    setError("");
    setOpen(true);
  }

  async function revoke(event) {
    event?.preventDefault();
    if (busy || tooShort) return;

    setError("");
    setBusy(true);
    try {
      const res = await revokeCertificate({ slug, reason });
      if (!res.ok) {
        setError(res.error);
        return toast.error(res.error);
      }
      toast.success("Certificate revoked.");
      setOpen(false);
      setReason("");
      router.refresh();
    } catch {
      // Network or server failure: never leave the button stuck on "Revoking…".
      const message = "Couldn't revoke the certificate. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    try {
      const res = await reinstateCertificate({ slug });
      if (!res.ok) return toast.error(res.error);
      toast.success("Certificate reinstated.");
      router.refresh();
    } catch {
      toast.error("Couldn't reinstate the certificate. Please try again.");
    }
  }

  return (
    <Card className="gap-3 border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Validity</h2>
        {statusLabel && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              revoked
                ? "bg-destructive/10 text-destructive"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {revoked ? (
              <FiSlash aria-hidden="true" className="size-3.5" />
            ) : (
              <FiCheckCircle aria-hidden="true" className="size-3.5" />
            )}
            {statusLabel}
          </span>
        )}
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        A revoked certificate stays on record, but the public verification page
        reports it as revoked.
      </p>
      {revoked ? (
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => setReinstate(true)}
        >
          Reinstate
        </Button>
      ) : (
        <Button
          type="button"
          variant="destructive"
          className="w-fit"
          onClick={openDialog}
        >
          Revoke certificate
        </Button>
      )}

      {/* Can't be dismissed mid-request, so a result is never missed. */}
      <Dialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={revoke} noValidate className="space-y-5">
            <DialogHeader>
              <DialogTitle>Revoke this certificate?</DialogTitle>
              <DialogDescription>
                Anyone verifying it will see that it was revoked. Give an
                internal reason for the audit log.
              </DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor="revoke-reason">Reason</FieldLabel>
              <Textarea
                id="revoke-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError("");
                }}
                rows={3}
                maxLength={MAX_REASON}
                aria-invalid={error ? true : undefined}
                aria-describedby={
                  error ? "revoke-reason-error" : "revoke-reason-help"
                }
              />
              <FieldDescription
                id="revoke-reason-help"
                className="tabular-nums"
              >
                At least {MIN_REASON} characters. Only admins see this.
                <span className="ml-1">
                  ({reason.length}/{MAX_REASON})
                </span>
              </FieldDescription>
            </Field>

            {error && (
              <p
                id="revoke-reason-error"
                role="alert"
                className="flex items-start gap-2 text-sm text-destructive"
              >
                <FiAlertCircle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
                {error}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={busy || tooShort}
              >
                {busy ? "Revoking…" : "Revoke"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={reinstate}
        onOpenChange={setReinstate}
        title="Reinstate this certificate?"
        description="It will verify as valid again."
        confirmLabel="Reinstate"
        onConfirm={restore}
      />
    </Card>
  );
}
