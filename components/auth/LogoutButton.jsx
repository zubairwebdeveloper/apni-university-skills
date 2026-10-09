// components/auth/LogoutButton.jsx
"use client";

import { useState } from "react";
import { signOut } from "firebase/auth";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiLoader, FiLogOut } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { auth, endServerSession } from "@/lib/firebase/client/auth";
import { cn } from "@/lib/utils";

const swap = { type: "spring", stiffness: 420, damping: 26 };

export function LogoutButton({
  className,
  variant = "default",
  compact = false,
}) {
  const reduce = useReducedMotion();
  const [busy, setBusy] = useState(false);

  async function logout() {
    if (busy) return; // double click ignore
    setBusy(true);

    // 1. Pehle Firebase client logout (warna AuthProvider cookie dobara set kar dega)
    await signOut(auth).catch(() => {});
    // 2. Phir server cookie delete
    await endServerSession();
    // 3. Full reload: purana client/server state bilkul saaf
    window.location.assign("/login");
  }

  return (
    <Button
      type="button"
      variant={variant}
      onClick={logout}
      disabled={busy}
      aria-label="Log out"
      aria-busy={busy}
      className={cn(
        "group relative w-full cursor-pointer gap-2 overflow-hidden",
        className,
      )}
    >
      {/* Shine sweep on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[320%] group-disabled:hidden motion-reduce:hidden"
      />

      {/* Icon: door slides out on hover, spinner while logging out */}
      <span className="relative grid size-4 place-items-center">
        <AnimatePresence mode="wait" initial={false}>
          {busy ? (
            <motion.span
              key="busy"
              initial={reduce ? false : { scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={swap}
              className="absolute"
            >
              <FiLoader aria-hidden="true" className="animate-spin" />
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={swap}
              className="absolute"
            >
              <FiLogOut
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              />
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      {/* Label: crossfade */}
      <span className={cn("relative inline-flex", compact && "sr-only")}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={busy ? "busy" : "idle"}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {busy ? "Logging out…" : "Log out"}
          </motion.span>
        </AnimatePresence>
      </span>

      <span role="status" className="sr-only">
        {busy ? "Logging out" : ""}
      </span>
    </Button>
  );
}
