"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, CalendarDays, Receipt } from "lucide-react";
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

export function PaymentHistory({ payments = [] }) {
  const reduceMotion = useReducedMotion();
  const count = payments.length;

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.05 } },
  };

  const item = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.25, ease: "easeOut" },
    },
  };

  return (
    <section
      aria-labelledby="payment-history-title"
      className="overflow-hidden rounded-2xl border bg-card shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FACC15]/15 text-[#CA9A04] dark:text-[#FACC15]"
          >
            <Receipt className="size-5" />
          </span>
          <div className="space-y-1">
            <h2
              id="payment-history-title"
              className="text-lg font-semibold leading-none tracking-tight"
            >
              Payment history
            </h2>
            <p className="text-sm text-muted-foreground">
              A complete record of your course purchases and their status.
            </p>
          </div>
        </div>

        {count > 0 && (
          <span className="inline-flex w-fit items-center rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            {count} {count === 1 ? "transaction" : "transactions"}
          </span>
        )}
      </div>

      {count === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6]"
          >
            <Receipt className="size-6" />
          </span>
          <div className="space-y-1">
            <p className="font-medium">No payments yet</p>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              When you purchase a course, your receipts and payment status will
              appear here.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile: stacked list */}
          <motion.ul
            variants={container}
            initial="hidden"
            animate="show"
            className="divide-y md:hidden"
          >
            {payments.map((p) => (
              <motion.li
                key={p.id}
                variants={item}
                className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2">
                    <BookOpen
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-[#8B5CF6]"
                    />
                    <p className="break-words font-medium leading-snug">
                      {p.courseTitle}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarDays aria-hidden="true" className="size-3.5" />
                    {formatDate(p.createdAt)}
                  </span>
                  <span className="text-base font-semibold tabular-nums">
                    {formatPrice(p.amount, p.currency)}
                  </span>
                </div>
              </motion.li>
            ))}
          </motion.ul>

          {/* Tablet / desktop: table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-11 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Course
                  </TableHead>
                  <TableHead className="h-11 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Amount
                  </TableHead>
                  <TableHead className="h-11 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.25,
                      delay: reduceMotion ? 0 : Math.min(i * 0.04, 0.4),
                      ease: "easeOut",
                    }}
                    className="border-b transition-colors last:border-b-0 hover:bg-muted/40"
                  >
                    <TableCell className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays aria-hidden="true" className="size-4" />
                        {formatDate(p.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="min-w-48 py-4 font-medium">
                      {p.courseTitle}
                    </TableCell>
                    <TableCell className="py-4 text-right font-semibold tabular-nums">
                      {formatPrice(p.amount, p.currency)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <StatusBadge status={p.status} />
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </section>
  );
}
