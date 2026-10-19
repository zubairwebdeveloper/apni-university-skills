"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  name = "Apni University",
  width = 180,
  height = 85,
  priority = false,
  showLabel = false,
}) {
  return (
    <Link
      href="/"
      aria-label={`${name} home`}
      className={cn(
        "group inline-flex min-w-0 shrink-0 items-center rounded-lg",
        "outline-none transition-opacity duration-200 hover:opacity-90",
        "focus-visible:ring-2 focus-visible:ring-amber-500",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <Image
        src="/apni-university-yellow-purple.gif"
        alt={name}
        width={width}
        height={height}
        priority={priority}
        unoptimized
        draggable={false}
        className={cn(
          "h-auto w-[140px] object-contain sm:w-[160px] lg:w-[180px]",
          "transition-transform duration-300 group-hover:scale-[1.02]",
          "motion-reduce:transform-none",
        )}
      />

      {showLabel && <span className="sr-only">{name}</span>}
    </Link>
  );
}
