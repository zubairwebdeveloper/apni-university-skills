// components/student/PaymentHistory.jsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, formatPrice } from "@/lib/utils/format";

export function PaymentHistory({ payments }) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Course</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDate(p.createdAt)}
              </TableCell>
              <TableCell className="min-w-48 font-medium">
                {p.courseTitle}
              </TableCell>
              <TableCell className="text-right">
                {formatPrice(p.amount, p.currency)}
              </TableCell>
              <TableCell>
                <StatusBadge status={p.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

