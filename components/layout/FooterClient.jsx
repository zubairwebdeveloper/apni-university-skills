"use client";
// components/layout/FooterClient.jsx
// Small client-only pieces used by FooterView (which stays a server component).

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, PlayCircle } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client/auth";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ft-a))] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060913]";

/* ------------------------------------------------------------------ */
/* useAuthState: "loading" | "in" | "out"                              */
/* ------------------------------------------------------------------ */
// If `forced` is a boolean (passed from the server) it wins and Firebase is
// not subscribed at all.
function useAuthState(forced) {
  const isForced = typeof forced === "boolean";
  const [state, setState] = useState("loading");

  useEffect(() => {
    if (isForced) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      setState(user ? "in" : "out");
    });
    return unsub;
  }, [isForced]);

  return isForced ? (forced ? "in" : "out") : state;
}

/* ------------------------------------------------------------------ */
/* SpotlightCard: a link whose hover background follows the cursor     */
/* ------------------------------------------------------------------ */
export function SpotlightCard({ href, className = "", children }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={onMove}
      className={`group relative isolate block overflow-hidden rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[rgb(var(--ft-a)/0.5)] hover:shadow-xl hover:shadow-[rgb(var(--ft-a)/0.12)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${FOCUS} ${className}`}
    >
      {/* cursor-follow glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{
          background:
            "radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgb(var(--ft-a) / 0.20), rgb(var(--ft-d) / 0.10) 45%, transparent 70%)",
        }}
      />
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* CTA heading + buttons: both change with login state                 */
/* ------------------------------------------------------------------ */
export function FooterCtaText({ isLoggedIn }) {
  const state = useAuthState(isLoggedIn);
  const loggedIn = state === "in";

  return (
    <div className="max-w-xl">
      <h2 className="text-balance text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-tight tracking-tight">
        {loggedIn
          ? "Welcome back, keep learning"
          : "Your next skill starts here"}
      </h2>
      <p className="mt-2 text-pretty text-muted-foreground">
        {loggedIn
          ? "Resume your course where you left off, or explore something new."
          : "Create a free account, pick a course and build something real at your own pace."}
      </p>
    </div>
  );
}

const Shine = () => (
  <span
    aria-hidden="true"
    className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-[320%] motion-reduce:hidden"
  />
);

const BTN_PRIMARY =
  "group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-[rgb(var(--ft-a))] via-[rgb(var(--ft-c))] to-[rgb(var(--ft-b))] bg-[length:200%_100%] bg-left px-6 text-sm font-semibold text-[#080B12] shadow-lg shadow-[rgb(var(--ft-a)/0.25)] transition-all duration-500 hover:bg-right hover:shadow-xl hover:shadow-[rgb(var(--ft-b)/0.35)] active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100";
const BTN_SECONDARY =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background/60 px-6 text-sm font-semibold backdrop-blur-sm transition-all duration-300 hover:border-[rgb(var(--ft-a)/0.6)] hover:bg-[rgb(var(--ft-a)/0.10)] hover:text-[rgb(var(--ft-a))] active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100";
const BTN_GHOST =
  "inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:bg-[rgb(var(--ft-d)/0.12)] hover:text-foreground";

// Shared responsive wrapper: a single stacked column on mobile, an
// auto-fit row (each button sized to its own content) from `sm` up —
// avoids fixed grid-cols fighting with w-auto sizing.
const BTN_GROUP =
  "grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-flow-col sm:auto-cols-fr";
const BTN_FULL_ON_MOBILE = "w-full justify-center sm:w-auto";

export function FooterCtaButtons({
  isLoggedIn, // optional: if a boolean is passed from the server, it wins
  registerHref = "/register",
  loginHref = "/login",
  dashboardHref = "/dashboard",
  myCoursesHref = "/dashboard/courses",
  coursesHref = "/courses",
}) {
  const state = useAuthState(isLoggedIn);

  // While Firebase is checking, show a skeleton so a logged-in user never
  // sees "Create free account" flash for a moment.
  if (state === "loading") {
    return (
      <div aria-hidden="true" className="flex h-11 items-center gap-3">
        <span className="h-11 w-40 animate-pulse rounded-lg bg-white/10" />
        <span className="h-11 w-28 animate-pulse rounded-lg bg-white/5" />
      </div>
    );
  }

  if (state === "in") {
    return (
      <div className={BTN_GROUP}>
        <Link
          href="/student"
          className={`${BTN_PRIMARY} ${FOCUS} ${BTN_FULL_ON_MOBILE}`}
        >
          <Shine />
          <LayoutDashboard aria-hidden="true" className="relative size-4" />
          <span className="relative">Go to dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={BTN_GROUP}>
      <Link
        href={registerHref}
        className={`${BTN_PRIMARY} ${FOCUS} ${BTN_FULL_ON_MOBILE}`}
      >
        <Shine />
        <span className="relative">Create free account</span>
        <ArrowRight
          aria-hidden="true"
          className="relative size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        />
      </Link>
      <Link
        href={loginHref}
        className={`${BTN_SECONDARY} ${FOCUS} ${BTN_FULL_ON_MOBILE}`}
      >
        Log in
      </Link>
      <Link
        href={coursesHref}
        className={`${BTN_GHOST} ${FOCUS} ${BTN_FULL_ON_MOBILE}`}
      >
        Browse courses
      </Link>
    </div>
  );
}
