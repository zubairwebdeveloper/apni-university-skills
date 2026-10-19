"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  FiMapPin,
  FiLink,
  FiCheckCircle,
  FiExternalLink,
} from "react-icons/fi";

export function ProfileHero({ profile }) {
  const reduce = useReducedMotion();
  const name = profile.displayName || "Student";
  const initial = name.charAt(0).toUpperCase();

  return (
    <motion.section
      aria-label="Profile overview"
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      {/* Banner: solid tint with a faded grid, no heavy gradient */}
      <div
        aria-hidden="true"
        className="relative h-28 border-b border-border bg-primary/10 sm:h-36"
      >
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "linear-gradient(to bottom, #000 30%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, #000 30%, transparent 100%)",
          }}
        />
      </div>

      <div className="px-5 pb-6 sm:px-8 sm:pb-8">
        <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:gap-5">
          {profile.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photoURL}
              alt={name}
              className="size-24 shrink-0 rounded-full border-4 border-card bg-muted object-cover shadow-md sm:size-28"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-24 shrink-0 items-center justify-center rounded-full border-4 border-card bg-primary text-3xl font-semibold text-primary-foreground shadow-md sm:size-28 sm:text-4xl"
            >
              {initial}
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-1 sm:pb-1">
            <h2 className="flex items-center gap-2 text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              <span className="min-w-0 break-words">{name}</span>
              {profile.emailVerified && (
                <span className="inline-flex shrink-0" title="Verified email">
                  <FiCheckCircle
                    aria-hidden="true"
                    className="size-5 text-primary"
                  />
                  <span className="sr-only">Verified email</span>
                </span>
              )}
            </h2>
            <p
              className={
                profile.headline
                  ? "text-sm text-foreground/80 sm:text-base"
                  : "text-sm italic text-muted-foreground sm:text-base"
              }
            >
              {profile.headline ||
                "Add a headline to tell people what you're learning"}
            </p>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {profile.bio}
          </p>
        )}

        {(profile.location || profile.website) && (
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.location && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <FiMapPin
                  aria-hidden="true"
                  className="size-3.5 text-primary"
                />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
              >
                <FiLink aria-hidden="true" className="size-3.5 text-primary" />
                <span className="max-w-[16rem] truncate">
                  {profile.website.replace(/^https?:\/\//, "")}
                </span>
                <FiExternalLink
                  aria-hidden="true"
                  className="size-3 opacity-60 transition-opacity group-hover:opacity-100"
                />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}
