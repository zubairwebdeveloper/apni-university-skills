// components/auth/LogoutButton.jsx
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { auth, endServerSession } from "@/lib/firebase/client/auth";
import { cn } from "@/lib/utils";

const swap = { type: "spring", stiffness: 420, damping: 26 };

function formatSignIn(value) {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function LogoutButton({
  className,
  variant = "default",
  compact = false,
  userName,
  userEmail,
  userPhoto,
  redirectTo = "/login",
  onLoggedOut,
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [me, setMe] = useState(null);

  // Props win; otherwise fall back to the signed-in Firebase user.
  useEffect(() => {
    return onAuthStateChanged(auth, (u) =>
      setMe(
        u
          ? {
              name: u.displayName,
              email: u.email,
              photo: u.photoURL,
              lastSignIn: u.metadata?.lastSignInTime,
            }
          : null,
      ),
    );
  }, []);

  const email = userEmail ?? me?.email ?? "";
  const fullName = userName ?? me?.name ?? (email ? email.split("@")[0] : "");
  const firstName = fullName.trim().split(/\s+/)[0] || "";
  const photo = userPhoto ?? me?.photo ?? undefined;
  const initial = (fullName || email || "?").charAt(0).toUpperCase();
  const lastSignIn = formatSignIn(me?.lastSignIn);

  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      // 1. Firebase client logout first (otherwise AuthProvider re-sets the cookie)
      await signOut(auth).catch(() => {});
      // 2. Then delete the server cookie
      await endServerSession();
      setDone(true);
      onLoggedOut?.();
      // 3. Full reload so no stale client/server state remains
      await new Promise((r) => setTimeout(r, reduce ? 0 : 600));
      window.location.assign(redirectTo);
    } catch {
      toast.error("Couldn't log out. Please try again.");
      setBusy(false);
      setDone(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        onClick={() => setOpen(true)}
        aria-label="Log out"
        aria-haspopup="dialog"
        className={cn(
          "group relative w-full cursor-pointer gap-2 overflow-hidden",
          "shadow-[0_3px_0_0_rgba(0,0,0,0.25)] transition-[transform,box-shadow] duration-100",
          "active:translate-y-[3px] active:shadow-none motion-reduce:transition-none motion-reduce:active:translate-y-0",
          className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[320%] motion-reduce:hidden"
        />
        <LogOut
          aria-hidden="true"
          className="relative size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        />
        <span className={cn("relative", compact && "sr-only")}>Log out</span>
      </Button>

      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (busy) return; // keep the dialog open while logging out
          setOpen(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-1 sm:mx-0">
              <div className="relative size-14 [perspective:400px]">
                {!reduce && !done && (
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-2xl bg-destructive/25"
                    animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                )}
                <motion.div
                  aria-hidden="true"
                  initial={
                    reduce ? false : { rotateX: 40, rotateY: -30, scale: 0.7 }
                  }
                  animate={{ rotateX: 0, rotateY: 0, scale: 1 }}
                  transition={swap}
                  className={cn(
                    "relative grid size-14 place-items-center rounded-2xl ring-1 ring-inset [transform-style:preserve-3d]",
                    done
                      ? "bg-primary/10 text-primary ring-primary/30"
                      : "bg-destructive/10 text-destructive shadow-[0_6px_0_0_color-mix(in_oklab,var(--destructive)_25%,transparent)] ring-destructive/30",
                  )}
                >
                  {done ? (
                    <Check className="size-6 [transform:translateZ(12px)]" />
                  ) : (
                    <LogOut className="size-6 [transform:translateZ(12px)]" />
                  )}
                </motion.div>
              </div>
            </div>

            <AlertDialogTitle>
              {done
                ? firstName
                  ? `Signed out. See you soon, ${firstName}!`
                  : "Signed out. See you soon!"
                : firstName
                  ? `Log out, ${firstName}?`
                  : "Log out of your account?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {done
                ? "Taking you to the login page…"
                : "You will be signed out on this device and taken to the login page. Any unsaved changes will be lost."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Signed-in account card */}
          {(fullName || email) && (
            <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
              <Avatar className="size-10">
                <AvatarImage src={photo} alt="" />
                <AvatarFallback className="font-medium">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-medium">{fullName || email}</p>
                {fullName && email ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {email}
                  </p>
                ) : null}
                {lastSignIn ? (
                  <p className="truncate text-xs text-muted-foreground">
                    Signed in {lastSignIn}
                  </p>
                ) : null}
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              Stay signed in
            </Button>
            <Button
              type="button"
              variant="default"
              disabled={busy}
              aria-busy={busy}
              onClick={logout}
              className="gap-2"
            >
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
                      {done ? (
                        <Check aria-hidden="true" />
                      ) : (
                        <Loader2 aria-hidden="true" className="animate-spin" />
                      )}
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
                      <LogOut aria-hidden="true" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              {done ? "Signed out" : busy ? "Logging out…" : "Log out"}
            </Button>
          </AlertDialogFooter>

          <span role="status" aria-live="polite" className="sr-only">
            {done ? "Signed out" : busy ? "Logging out" : ""}
          </span>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
