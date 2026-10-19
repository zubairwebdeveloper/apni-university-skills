// components/shared/ConfirmDialog.jsx: controlled AlertDialog. The confirm control is a plain Button so
// the dialog stays open (and the button disabled) while the async action runs.
"use client";
import { useState } from "react";
import { FiAlertTriangle, FiLoader } from "react-icons/fi";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
}) {
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      onOpenChange(false);
    }
  }
  return (
    <AlertDialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2.5">
            {destructive && (
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
                <FiAlertTriangle aria-hidden="true" className="size-4" />
              </span>
            )}
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            onClick={go}
            disabled={busy}
            className={cn("gap-2", busy && "cursor-wait")}
          >
            {busy && (
              <FiLoader aria-hidden="true" className="size-4 animate-spin" />
            )}
            {busy ? "Working…" : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
