// components/public/InstructorCard.jsx
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Rating } from "@/components/shared/Rating";
import { formatCompact } from "@/lib/utils/format";

export function InstructorCard({ instructor: i }) {
  return (
    <Link
      href={`/instructors/${i.slug}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="h-full items-center gap-3 p-6 text-center transition-shadow group-hover:shadow-md">
        <Avatar className="size-20">
          <AvatarImage src={i.avatar} alt="" />
          <AvatarFallback className="font-serif text-xl">
            {i.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-serif text-lg font-semibold">{i.name}</h3>
        <p className="text-sm text-muted-foreground">{i.designation}</p>
        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
          <Rating value={i.rating} count={i.reviewCount ?? i.studentsCount} />
          <span>{formatCompact(i.studentsCount ?? 0)} students</span>
        </div>
      </Card>
    </Link>
  );
}

