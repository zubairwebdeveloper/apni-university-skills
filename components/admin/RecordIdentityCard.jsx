"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  Mail,
  ShieldCheck,
} from "lucide-react";

const ACCENT = "#ef07a2";

export function RecordIdentityCard({
  record,
  title,
  subtitle,
  status,
  email,
  role,
  metadata = [],
}) {
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative isolate overflow-hidden rounded-2xl border border-white/10 bg-[#111116] p-5 text-white shadow-xl sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full border border-white/[0.06]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full border border-white/[0.08]"
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border"
          style={{
            backgroundColor: "rgba(239,7,162,0.10)",
            borderColor: "rgba(239,7,162,0.28)",
            color: ACCENT,
          }}
        >
          <CircleUserRound size={32} strokeWidth={1.5} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Record identity
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-zinc-300">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: ACCENT }}
              />
              {recordStatus}
            </span>
          </div>

          <h2 className="mt-3 break-words text-xl font-semibold tracking-tight sm:text-2xl">
            {name}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            {description}
          </p>
        </div>

        <ArrowUpRight
          aria-hidden="true"
          className="hidden shrink-0 text-zinc-500 sm:block"
          size={20}
        />
      </div>

      {details.length > 0 && (
        <div className="relative mt-6 grid gap-3 border-t border-white/[0.08] pt-5 sm:grid-cols-2">
          {details.map((item, index) => {
            const Icon = item.icon || BookOpen;

            return (
              <div
                key={`${item.label}-${index}`}
                className="flex min-w-0 items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5 transition-colors duration-200 hover:border-white/15 hover:bg-white/[0.045]"
              >
                <Icon
                  size={18}
                  className="mt-0.5 shrink-0"
                  style={{ color: ACCENT }}
                />

                <div className="min-w-0">
                  <p className="text-xs text-zinc-500">{item.label}</p>

                  <p className="mt-1 break-words text-sm font-medium text-zinc-200">
                    {item.value ?? "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {record?.createdAt && (
        <div className="relative mt-4 flex items-center gap-2 text-xs text-zinc-500">
          <Clock3 size={14} />
          <span>Instructor record available</span>
          <CheckCircle2 size={14} className="ml-auto text-emerald-400" />
        </div>
      )}
    </motion.section>
  );
}

export default RecordIdentityCard;
