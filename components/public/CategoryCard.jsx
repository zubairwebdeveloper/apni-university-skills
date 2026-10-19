// components/public/CategoryCard.jsx
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/shared/CategoryIcon";

export function CategoryCard({ category }) {
  // Accepts either spelling; see the note about CategoriesExplorer.
  const rawCount = category.coursesCount ?? category.courseCount;
  const hasCount = typeof rawCount === "number";

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card
        className={cn(
          "h-full gap-4 p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-300 sm:p-6",
          "group-hover:border-primary/40 group-hover:shadow-xl",
          "motion-safe:group-hover:-translate-y-0.5",
        )}
      >
        {/* Icon tile fills with the accent color on hover */}
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-xl border border-primary/20 bg-accent text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
        >
          <CategoryIcon name={category.icon} className="size-5" />
        </span>

        <div className="flex flex-col gap-1.5">
          <h3 className="font-serif text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
            {category.name}
          </h3>
          {hasCount && (
            <p className="text-sm tabular-nums text-muted-foreground">
              {rawCount} {rawCount === 1 ? "course" : "courses"}
            </p>
          )}
        </div>

        {/* Footer call to action */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
          <span className="text-sm font-medium text-primary">
            Browse courses
          </span>
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
