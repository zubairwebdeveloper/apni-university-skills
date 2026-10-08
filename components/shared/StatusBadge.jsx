// components/shared/StatusBadge.jsx
import { Badge } from "@/components/ui/badge";
const MAP = {
  // components/shared/StatusBadge.jsx: extend MAP
  paid: ["Paid", "default"],
  cancelled: ["Cancelled", "outline"],
  draft: ["Draft", "outline"],
  published: ["Published", "default"],
  archived: ["Archived", "secondary"],
  deleted: ["Deleted", "destructive"],
  new: ["New", "default"],
  succeeded: ["Paid", "default"],
  refunded: ["Refunded", "secondary"],
  failed: ["Failed", "destructive"],
  pending: ["Pending review", "outline"],
  approved: ["Approved", "default"],
  rejected: ["Rejected", "destructive"],
  active: ["In progress", "secondary"],
  completed: ["Completed", "default"],
  scheduled: ["Scheduled", "outline"],
  read: ["Read", "secondary"],
  replied: ["Replied", "default"],
  spam: ["Spam", "destructive"],
  sending: ["Sending", "outline"],
  sent: ["Sent", "default"],
  valid: ["Valid", "default"],
  revoked: ["Revoked", "destructive"],
};
export function StatusBadge({ status }) {
  const [label, variant] = MAP[status] ?? [status, "outline"];
  return <Badge variant={variant}>{label}</Badge>;
}

