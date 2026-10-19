// components/admin/coupons/CouponsTable.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FiCheck, FiCopy, FiTag } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LifecycleTable } from "@/components/admin/table/LifecycleTable";
import { describeCoupon } from "@/lib/utils/coupon";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { bulkCouponAction, runCouponAction } from "@/app/actions/admin/coupons";

function CopyCode({ code }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  // Clear the pending reset so state is never set after unmount
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={copy}
        aria-label={`Copy code ${code}`}
      >
        {copied ? (
          <FiCheck
            className="size-3.5 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
        ) : (
          <FiCopy className="size-3.5" aria-hidden="true" />
        )}
      </Button>
      <span role="status" className="sr-only">
        {copied ? `${code} copied` : ""}
      </span>
    </>
  );
}

function UsageBar({ redeemed = 0, limit, reserved }) {
  const reduce = useReducedMotion();
  const pct = limit ? Math.min(100, Math.round((redeemed / limit) * 100)) : 0;
  const tone =
    pct >= 100 ? "bg-destructive" : pct >= 80 ? "bg-amber-500" : "bg-primary";
  return (
    <div className="min-w-32">
      <p className="flex items-baseline gap-1 text-sm tabular-nums">
        <span className="font-medium">{redeemed}</span>
        {limit ? (
          <span className="text-muted-foreground">/ {limit}</span>
        ) : null}
        {reserved ? (
          <span className="text-xs text-muted-foreground">
            (+{reserved} pending)
          </span>
        ) : null}
      </p>
      {limit ? (
        <div className="mt-1.5 flex items-center gap-2">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-valuenow={redeemed}
            aria-valuetext={`${redeemed} of ${limit} used`}
            aria-label="Coupon usage"
          >
            <motion.div
              className={cn("h-full rounded-full", tone)}
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
            {pct}%
          </span>
        </div>
      ) : (
        <p className="mt-0.5 text-xs text-muted-foreground">No limit</p>
      )}
    </div>
  );
}

// "Scheduled" / "Active" / "Expired" from the dates, or null if the dates
// can't be parsed (never guess).
function windowState(r) {
  const now = Date.now();
  const start = r.startsAt ? new Date(r.startsAt).getTime() : null;
  const end = r.expiresAt ? new Date(r.expiresAt).getTime() : null;
  if (
    (start != null && Number.isNaN(start)) ||
    (end != null && Number.isNaN(end))
  )
    return null;
  if (start != null && start > now) return "Scheduled";
  if (end != null && end < now) return "Expired";
  return "Active";
}

const STATE_STYLES = {
  Scheduled: "bg-primary/10 text-primary",
  Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Expired: "bg-muted text-muted-foreground",
};
const STATE_DOT = {
  Scheduled: "bg-primary",
  Active: "bg-emerald-500",
  Expired: "bg-muted-foreground/60",
};

export function CouponsTable({ rows, perms }) {
  const columns = [
    {
      key: "code",
      header: "Code",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <span
            className="hidden size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15 sm:flex"
            aria-hidden="true"
          >
            <FiTag className="size-4" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/coupons/${r.slug}/edit`}
                className="rounded-sm font-mono text-sm font-semibold tracking-wide underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                {r.code}
              </Link>
              <CopyCode code={r.code} />
            </div>
            {r.description && (
              <p className="max-w-56 truncate text-xs text-muted-foreground">
                {r.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      className: "whitespace-nowrap",
      cell: (r) => (
        <span className="inline-flex rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-sm font-semibold tabular-nums text-primary">
          {describeCoupon(r)}
        </span>
      ),
    },
    {
      key: "usage",
      header: "Used",
      cell: (r) => (
        <UsageBar
          redeemed={r.redeemed ?? 0}
          limit={r.usageLimit}
          reserved={r.reserved}
        />
      ),
    },
    {
      key: "valid",
      header: "Valid",
      className: "whitespace-nowrap",
      cell: (r) => {
        const state = windowState(r);
        return (
          <div className="space-y-1.5">
            <p className="text-sm tabular-nums text-muted-foreground">
              {r.startsAt || r.expiresAt
                ? `${formatDate(r.startsAt) || "Now"} → ${formatDate(r.expiresAt) || "No end"}`
                : "Always"}
            </p>
            {state && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                  STATE_STYLES[state],
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn("size-1.5 rounded-full", STATE_DOT[state])}
                />
                {state}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      className: "whitespace-nowrap",
      cell: (r) => (
        <div className="space-y-1">
          <StatusBadge status={r.status} />
          <p className="text-xs tabular-nums text-muted-foreground">
            Updated {formatDate(r.updatedAt)}
          </p>
        </div>
      ),
    },
  ];
  return (
    <LifecycleTable
      rows={rows}
      perms={perms}
      prefix="coupons"
      noun="Coupon"
      plural="coupons"
      caption="Coupons"
      columns={columns}
      basePath="/admin/coupons"
      titleKey="code"
      hasView={false}
      run={runCouponAction}
      bulk={bulkCouponAction}
      emptyIcon={FiTag}
      emptyTitle="No coupons match"
      minWidth="min-w-[760px]"
    />
  );
}
