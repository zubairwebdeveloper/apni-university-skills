// components/shared/StatusBadge.jsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// [label, badge variant, semantic tone]
const MAP = {
  // components/shared/StatusBadge.jsx: extend MAP
  paid: ["Paid", "default", "success"],
  cancelled: ["Cancelled", "outline", "neutral"],
  draft: ["Draft", "outline", "neutral"],
  published: ["Published", "default", "success"],
  archived: ["Archived", "secondary", "neutral"],
  deleted: ["Deleted", "destructive", "danger"],
  new: ["New", "default", "info"],
  succeeded: ["Paid", "default", "success"],
  refunded: ["Refunded", "secondary", "neutral"],
  failed: ["Failed", "destructive", "danger"],
  pending: ["Pending review", "outline", "warning"],
  approved: ["Approved", "default", "success"],
  rejected: ["Rejected", "destructive", "danger"],
  active: ["In progress", "secondary", "info"],
  completed: ["Completed", "default", "success"],
  scheduled: ["Scheduled", "outline", "info"],
  read: ["Read", "secondary", "neutral"],
  replied: ["Replied", "default", "success"],
  spam: ["Spam", "destructive", "danger"],
  sending: ["Sending", "outline", "warning"],
  sent: ["Sent", "default", "success"],
  valid: ["Valid", "default", "success"],
  revoked: ["Revoked", "destructive", "danger"],
};

const DOT = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-destructive",
  info: "bg-primary",
  neutral: "bg-muted-foreground/50",
};

export function StatusBadge({ status }) {
  const [label, variant, tone = "neutral"] = MAP[status] ?? [status, "outline"];
  return (
    <Badge variant={variant} className="gap-1.5">
      <span
        aria-hidden="true"
        className={cn("size-1.5 shrink-0 rounded-full", DOT[tone])}
      />
      {label}
    </Badge>
  );
}
