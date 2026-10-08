// components/admin/certificates/CertificateControls.jsx: revoke needs a reason, so it lives on the detail page
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  reinstateCertificate,
  revokeCertificate,
} from "@/app/actions/admin/certificates";

export function CertificateControls({ slug, status }) {
  const router = useRouter();
  const [open, setOpen] = useState(false),
    [reinstate, setReinstate] = useState(false);
  const [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false);

  async function revoke() {
    setBusy(true);
    const res = await revokeCertificate({ slug, reason });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Certificate revoked.");
    setOpen(false);
    setReason("");
    router.refresh();
  }
  async function restore() {
    const res = await reinstateCertificate({ slug });
    if (!res.ok) return toast.error(res.error);
    toast.success("Certificate reinstated.");
    router.refresh();
  }
  return (
    <Card className="gap-3 p-5">
      <h2 className="text-lg">Validity</h2>
      <p className="text-sm text-muted-foreground">
        A revoked certificate stays on record, but the public verification page
        reports it as revoked.
      </p>
      {status === "revoked" ? (
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
          onClick={() => setOpen(true)}
        >
          Revoke certificate
        </Button>
      )}
      <Dialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Revoke this certificate?</DialogTitle>
            <DialogDescription>
              Anyone verifying it will see that it was revoked. Give an internal
              reason for the audit log.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="revoke-reason">Reason</FieldLabel>
            <Textarea
              id="revoke-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={200}
            />
          </Field>
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
              type="button"
              variant="destructive"
              onClick={revoke}
              disabled={busy || reason.trim().length < 5}
            >
              {busy ? "Revoking…" : "Revoke"}
            </Button>
          </DialogFooter>
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

