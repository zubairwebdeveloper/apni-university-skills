// components/public/CareerCard.jsx
import Link from "next/link";
import { FiArrowRight, FiBriefcase } from "react-icons/fi";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const MAX_SKILLS = 3;

export function CareerCard({ career: c }) {
  const skills = c.skills ?? [];
  const visibleSkills = skills.slice(0, MAX_SKILLS);
  const extra = skills.length - visibleSkills.length;

  return (
    <Link
      href={`/careers/${c.slug}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card
        className={cn(
          "h-full gap-4 p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-300 sm:p-7",
          "group-hover:border-primary/40 group-hover:shadow-xl",
          "motion-safe:group-hover:-translate-y-0.5",
        )}
      >
        {/* Icon tile fills with the accent color on hover */}
        <span
          aria-hidden="true"
          className="grid size-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
        >
          <FiBriefcase className="size-5" />
        </span>

        <div className="flex flex-col gap-2">
          <h3 className="font-serif text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-xl">
            {c.title}
          </h3>
          {c.summary && (
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {c.summary}
            </p>
          )}
        </div>

        {visibleSkills.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Key skills
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {visibleSkills.map((s) => (
                <li key={s}>
                  <Badge variant="secondary">{s}</Badge>
                </li>
              ))}
              {extra > 0 && (
                <li>
                  <Badge variant="outline" className="tabular-nums">
                    +{extra} more
                  </Badge>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Footer call to action */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
          <span className="text-sm font-medium text-primary">View roadmap</span>
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-full border border-primary/20 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
          >
            <FiArrowRight className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
