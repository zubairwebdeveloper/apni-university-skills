"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Award, ShieldCheck, ShieldOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TONES = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  destructive: "bg-destructive/10 text-destructive",
};

const count = new Intl.NumberFormat("en-US");

export function CertificatesStats({ total, valid, revoked }) {
  const reduce = useReducedMotion();
  const totalNum = Number(total ?? 0);

  // Share of everything issued, from the same numbers shown on the cards.
  const share = (n) =>
    totalNum > 0
      ? `${Math.round((Number(n ?? 0) / totalNum) * 100)}% of total`
      : "";

  const items = [
    {
      label: "Total issued",
      value: total,
      icon: Award,
      tone: "primary",
      note: "",
    },
    {
      label: "Valid",
      value: valid,
      icon: ShieldCheck,
      tone: "success",
      note: share(valid),
    },
    {
      label: "Revoked",
      value: revoked,
      icon: ShieldOff,
      tone: "destructive",
      note: share(revoked),
    },
  ];

  return (
    <dl className="grid gap-4 sm:grid-cols-3" aria-label="Certificate summary">
      {items.map(({ label, value, icon: Icon, tone, note }, i) => (
        <motion.div
          key={label}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: reduce ? 0 : i * 0.07 }}
        >
          <Card className="border-border transition-colors duration-200 hover:border-primary/50 motion-reduce:transition-none">
            <CardContent className="flex items-center gap-4 p-5">
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <dt className="text-sm font-medium text-muted-foreground">
                  {label}
                </dt>
                <dd className="text-2xl font-semibold leading-tight tracking-tight tabular-nums">
                  {count.format(Number(value ?? 0))}
                </dd>
                {note && (
                  <dd className="text-xs tabular-nums text-muted-foreground">
                    {note}
                  </dd>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </dl>
  );
}
