// components/public/CategoryCard.jsx
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/shared/CategoryIcon";

export function CategoryCard({ category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="h-full gap-3 p-5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
        <span className="grid size-11 place-items-center rounded-lg bg-accent text-primary">
          <CategoryIcon name={category.icon} className="size-5" />
        </span>
        <h3 className="font-serif text-lg font-semibold">{category.name}</h3>
        {typeof category.coursesCount === "number" && (
          <p className="text-sm text-muted-foreground">
            {category.coursesCount}{" "}
            {category.coursesCount === 1 ? "course" : "courses"}
          </p>
        )}
      </Card>
    </Link>
  );
}

