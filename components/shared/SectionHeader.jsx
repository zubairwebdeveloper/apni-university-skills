// components/shared/SectionHeader.jsx
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  href,
  hrefLabel = "View all",
  center = false,
}) {
  return (
    <div
      className={`mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${center ? "items-center text-center sm:flex-col sm:items-center" : ""}`}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-sm font-medium text-primary">{eyebrow}</p>
        )}
        <h2 id={id} className="text-3xl sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-muted-foreground">{description}</p>
        )}
      </div>
      {href && (
        <Link href={href} className={buttonVariants({ variant: "outline" })}>
          {hrefLabel}
        </Link>
      )}
    </div>
  );
}

