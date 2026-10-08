// components/layout/Logo.jsx

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className, name = "Apni University" }) {
  return (
    <Link
      href="/"
      aria-label={`${name} home`}
      className={cn(
        "inline-flex items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Image
        src="/apni-university-yellow-purple.gif"
        alt={name}
        width={180}
        height={85}
        priority
        unoptimized
        className="h-100 w-80 object-contain"
      />
    </Link>
  );
}
