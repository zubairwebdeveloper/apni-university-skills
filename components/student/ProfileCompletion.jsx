"use client";

import { motion } from "framer-motion";
import { FiCheck, FiCircle } from "react-icons/fi";
import { Card } from "@/components/ui/card";

export function ProfileCompletion({ profile }) {
  const checks = [
    { label: "Profile photo", done: !!profile.photoURL },
    { label: "Display name", done: !!profile.displayName },
    { label: "Headline", done: !!profile.headline },
    { label: "Short bio", done: !!profile.bio },
    { label: "Location", done: !!profile.location },
    { label: "Verified email", done: !!profile.emailVerified },
  ];
  const done = checks.filter((c) => c.done).length;
  const pct = Math.round((done / checks.length) * 100);

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Profile strength</h3>
        <span className="text-sm font-semibold text-primary">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <ul className="mt-4 space-y-2">
        {checks.map(({ label, done }) => (
          <li key={label} className="flex items-center gap-2 text-sm">
            {done ? (
              <FiCheck className="text-emerald-500" />
            ) : (
              <FiCircle className="text-muted-foreground/50" />
            )}
            <span
              className={done ? "text-foreground" : "text-muted-foreground"}
            >
              {label}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
