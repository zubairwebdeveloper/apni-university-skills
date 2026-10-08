// components/admin/payments/RefundCard.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

export function RefundCard({ slug, amount, currency }) {
  const router = useRouter();
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
  return (
    <Card className="gap-3 p-5">
      <h2 className="text-lg">Refund</h2>
      <p className="text-sm text-muted-foreground">
        Refunds the full amount through Stripe. Status and the student&apos;s access
        change only when Stripe confirms, usually within seconds.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger className="w-56" aria-label="Refund reason">
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
        <Button
          type="button"
          variant="destructive"
          onClick={() => setOpen(true)}
        >
          Refund {formatPrice(amount, currency)}
        </Button>
      </div>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Refund ${formatPrice(amount, currency)}?`}
        description="The student's payment is returned and their enrollment is revoked once Stripe confirms. This can't be undone."
        confirmLabel="Request refund"
        destructive
        onConfirm={go}
      />
    </Card>
  );
}

