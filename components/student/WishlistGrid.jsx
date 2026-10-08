// components/student/WishlistGrid.jsx: the remove button is a sibling of the card link
"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiHeart } from "react-icons/fi";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { CourseCard } from "@/components/public/CourseCard";
import { removeFromWishlist } from "@/app/actions/student";

export function WishlistGrid({ courses }) {
  const router = useRouter();
  const [items, setItems] = useState(courses);
  const [pending, start] = useTransition();

  function remove(c) {
    start(async () => {
      const res = await removeFromWishlist(c.id);
      if (!res.ok) return toast.error(res.error);
      setItems((l) => l.filter((x) => x.id !== c.id));
      toast.success("Removed from your wishlist");
      router.refresh();
    });
  }

  if (!items.length)
    return (
      <EmptyState
        icon={FiHeart}
        title="Your wishlist is empty"
        description="Save courses you're interested in and find them here."
        action={
          <Link href="/courses" className={buttonVariants()}>
            Browse courses
          </Link>
        }
      />
    );

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((c) => (
        <div key={c.id} className="flex flex-col gap-2">
          <div className="flex-1">
            <CourseCard course={c} />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => remove(c)}
            disabled={pending}
          >
            Remove from wishlist
          </Button>
        </div>
      ))}
    </div>
  );
}

