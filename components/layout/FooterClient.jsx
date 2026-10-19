"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowRight, BookOpen, LayoutDashboard } from "lucide-react";

import { auth } from "@/lib/firebase/client/auth";

export function useAuthState(forcedValue) {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(forcedValue));

  useEffect(() => {
    if (typeof forcedValue === "boolean") {
      setIsLoggedIn(forcedValue);
      return;
    }

    if (!auth) {
      setIsLoggedIn(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(Boolean(user));
    });

    return unsubscribe;
  }, [forcedValue]);

  return isLoggedIn;
}

export function FooterCtaText({
  title = "Build skills for your future",
  description = "Learn practical technology skills and turn your ideas into real projects.",
  className = "",
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
        Apni University
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-blue-600 sm:text-base">
        {description}
      </p>
    </div>
  );
}

export function FooterCtaButtons({
  isLoggedIn: forcedValue,
  dashboardHref = "/student",
  myCoursesHref = "/student/courses",
  primaryHref = "/register",
  secondaryHref = "/courses",
  className = "",
}) {
  const isLoggedIn = useAuthState(forcedValue);

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {isLoggedIn ? (
        <>
          <Link
            href={dashboardHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            <LayoutDashboard size={16} aria-hidden="true" />
            Dashboard
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          <Link
            href={myCoursesHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-amber-600 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            <BookOpen size={16} aria-hidden="true" />
            My courses
          </Link>
        </>
      ) : (
        <>
          <Link
            href={primaryHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            Get started
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          <Link
            href={secondaryHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-amber-600 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            Explore courses
          </Link>
        </>
      )}
    </div>
  );
}
