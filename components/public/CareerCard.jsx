// components/public/CareerCard.jsx
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function CareerCard({ career: c }) {
  return (
    <Link
      href={`/careers/${c.slug}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="h-full gap-3 p-6 transition-shadow group-hover:shadow-md">
        <h3 className="font-serif text-lg font-semibold">{c.title}</h3>
        <p className="text-sm text-muted-foreground">{c.summary}</p>
        <ul className="flex flex-wrap gap-1.5">
          {(c.skills ?? []).slice(0, 3).map((s) => (
            <li key={s}>
              <Badge variant="secondary">{s}</Badge>
            </li>
          ))}
        </ul>
        <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary">
          View roadmap <FiArrowRight aria-hidden="true" />
        </span>
      </Card>
    </Link>
  );
}

