// components/admin/payments/RefundCard.jsx
"use client";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { FiAlertTriangle, FiInfo, FiRotateCcw } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatPrice } from "@/lib/utils/format";
import { refundPayment } from "@/app/actions/admin/payments";

const REASONS = [
  ["requested_by_customer", "Requested by customer"],
  ["duplicate", "Duplicate payment"],
  ["fraudulent", "Fraudulent"],
];

const REASON_HINTS = {
  requested_by_customer: "The student asked for their money back.",
  duplicate: "The student was charged more than once for the same purchase.",
  fraudulent: "The payment was unauthorized or suspicious.",
};

export function RefundCard({ slug, amount, currency }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const reasonId = useId();
  const hintId = useId();
  const [reason, setReason] = useState("requested_by_customer");
  const [open, setOpen] = useState(false);

  async function go() {
    const res = await refundPayment({ slug, reason });
    if (!res.ok) return toast.error(res.error);
    toast.success(
      "Refund requested. The payment updates when Stripe confirms it.",
    );
    router.refresh();
  }

  const formattedAmount = formatPrice(amount, currency);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full min-w-0"
    >
      <Card className="gap-0 overflow-hidden p-0">
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-border p-5 sm:p-6">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
          >
            <FiRotateCcw className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="text-lg font-semibold leading-6 tracking-tight text-foreground">
                Refund
              </h2>
              <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium leading-4 text-muted-foreground">
                Full amount
              </span>
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Refunds the full amount through Stripe. Status and the
              student&apos;s access change only when Stripe confirms, usually
              within seconds.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="flex min-w-0 flex-col gap-2">
              <label
                htmlFor={reasonId}
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                Reason
              </label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger
                  id={reasonId}
                  className="w-full sm:w-72"
                  aria-label="Refund reason"
                  aria-describedby={hintId}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p
                id={hintId}
                aria-live="polite"
                className="flex items-start gap-1.5 text-xs leading-5 text-muted-foreground"
              >
                <FiInfo
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0"
                />
                <span>{REASON_HINTS[reason]}</span>
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Refund amount
              </span>
              <span className="text-2xl font-semibold leading-none tabular-nums tracking-tight text-foreground">
                {formattedAmount}
              </span>
            </div>
          </div>

          {/* Irreversibility notice */}
          <div
            role="note"
            className="flex items-start gap-2.5 rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-3.5 py-3 text-sm leading-5 text-yellow-800 dark:text-yellow-200"
          >
            <FiAlertTriangle
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-yellow-600 dark:text-yellow-400"
            />
            <p>
              Refunds can&apos;t be undone. Enrollment is revoked once Stripe
              confirms.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setOpen(true)}
              className="w-full gap-2 transition-transform active:scale-[0.98] sm:w-auto motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <FiRotateCcw aria-hidden="true" className="size-4" />
              Refund {formattedAmount}
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Refund ${formattedAmount}?`}
        description="The student's payment is returned and their enrollment is revoked once Stripe confirms. This can't be undone."
        confirmLabel="Request refund"
        destructive
        onConfirm={go}
      />
    </motion.div>
  );
}
