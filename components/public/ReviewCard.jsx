// components/public/ReviewCard.jsx: denormalized studentName/courseTitle are stored on the review at creation
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Rating } from "@/components/shared/Rating";

export function ReviewCard({ review: r }) {
  return (
    <Card className="h-full gap-4 p-6">
      <Rating value={r.rating} count={1} />
      {r.title && (
        <h3 className="font-serif text-lg font-semibold">{r.title}</h3>
      )}
      <blockquote className="text-sm leading-relaxed text-muted-foreground">
        {r.comment}
      </blockquote>
      <div className="mt-auto flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarImage src={r.studentPhotoURL} alt="" />
          <AvatarFallback>{r.studentName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-sm">
          <p className="font-medium">{r.studentName}</p>
          {r.courseTitle && (
            <p className="text-xs text-muted-foreground">{r.courseTitle}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

