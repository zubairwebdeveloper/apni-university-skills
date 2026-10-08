// components/public/TechnologyCard.jsx
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/shared/CategoryIcon";

export function TechnologyCard({ technology: t }) {
  return (
    <Link
      href={`/technology/${t.slug}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="h-full gap-3 p-6 transition-shadow group-hover:shadow-md">
        <span className="grid size-11 place-items-center rounded-lg bg-accent text-primary">
          <CategoryIcon name={t.icon} className="size-5" />
        </span>
        <h3 className="font-serif text-lg font-semibold">{t.title}</h3>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {t.summary}
        </p>
      </Card>
    </Link>
  );
}

