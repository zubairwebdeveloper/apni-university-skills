"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";

// Status text comes from the record, so match loosely and fall back to neutral.
function statusTone(status) {
  const s = String(status ?? "").toLowerCase();
  if (["active", "approved", "published", "verified"].includes(s)) {
    return {
      pill: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
      dot: "bg-emerald-400",
    };
  }
  if (["pending", "draft", "review"].includes(s)) {
    return {
      pill: "border-[#FACC15]/30 bg-[#FACC15]/10 text-[#FACC15]",
      dot: "bg-[#FACC15]",
    };
  }
  if (
    ["inactive", "rejected", "deleted", "archived", "suspended"].includes(s)
  ) {
    return {
      pill: "border-red-400/25 bg-red-400/10 text-red-300",
      dot: "bg-red-400",
    };
  }
  return {
    pill: "border-white/10 bg-white/[0.04] text-[#94A3B8]",
    dot: "bg-[#94A3B8]",
  };
}

export function RecordIdentityCard({
  record,
  title,
  subtitle,
  status,
  email,
  role,
  metadata = [],
}) {
  const reduceMotion = useReducedMotion();

  const name =
    title ||
    record?.displayName ||
    record?.name ||
    record?.fullName ||
    record?.title ||
    "Instructor";

  const description =
    subtitle ||
    record?.bio ||
    record?.description ||
    "Instructor profile and account information";

  const recordStatus = status || record?.status || "Unknown";

  const recordEmail = email || record?.email || "";

  const recordRole = role || record?.role || "Instructor";

  const tone = statusTone(recordStatus);

  const details = [
    ...(recordEmail
      ? [
          {
            label: "Email address",
            value: recordEmail,
            icon: Mail,
          },
        ]
      : []),
    {
      label: "Account role",
      value: recordRole,
      icon: ShieldCheck,
    },
    ...(Array.isArray(metadata) ? metadata : []),
  ];

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      aria-label={`${name} identity`}
      className="relative isolate w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111318] p-5 text-[#F8FAFC] shadow-sm sm:p-6"
    >
      {/* Single accent line along the top edge */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 bg-[#FACC15]"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <div
          aria-hidden="true"
          className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#A78BFA]"
        >
          <CircleUserRound className="size-8" strokeWidth={1.5} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
              Record identity
            </span>

            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium leading-4",
                tone.pill,
              )}
            >
              <span
                aria-hidden="true"
                className={cn("size-1.5 rounded-full", tone.dot)}
              />
              <span className="sr-only">Status: </span>
              {recordStatus}
            </span>
          </div>

          <h2 className="mt-3 break-words text-xl font-semibold leading-tight tracking-tight text-[#F8FAFC] sm:text-2xl">
            {name}
          </h2>

          <p className="mt-2 line-clamp-3 max-w-2xl text-sm leading-6 text-[#94A3B8] sm:text-base sm:leading-7">
            {description}
          </p>
        </div>
      </div>

      {details.length > 0 && (
        <dl className="mt-6 grid gap-3 border-t border-white/[0.08] pt-5 sm:grid-cols-2">
          {details.map((item, index) => {
            const Icon = item.icon || BookOpen;

            return (
              <div
                key={`${item.label}-${index}`}
                className="flex min-w-0 items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5 transition-colors duration-200 hover:border-[#8B5CF6]/30 hover:bg-white/[0.045] motion-reduce:transition-none"
              >
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-[#A78BFA]"
                >
                  <Icon className="size-4" />
                </span>

                <div className="min-w-0">
                  <dt className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
                    {item.label}
                  </dt>
                  <dd className="mt-1 break-words text-sm font-medium leading-5 text-[#F8FAFC]">
                    {item.value ?? "—"}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      )}

      {record?.createdAt && (
        <div className="mt-4 flex items-center gap-2 text-xs text-[#94A3B8]">
          <Clock3 aria-hidden="true" className="size-3.5" />
          <span>Instructor record available</span>
          <CheckCircle2
            aria-hidden="true"
            className="ml-auto size-3.5 text-emerald-400"
          />
        </div>
      )}
    </motion.section>
  );
}

export default RecordIdentityCard;
