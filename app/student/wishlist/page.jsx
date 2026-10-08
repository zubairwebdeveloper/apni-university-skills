import Link from "next/link";
import { Heart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import {
  WishlistExtras,
  WishlistView,
} from "@/components/student/WishlistView";
import { requireUser } from "@/lib/auth/session";
import { wishlistService } from "@/services/wishlistService";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await requireUser();
  const courses = await wishlistService.getWishlistCourses(user.uid);

  return (
    <>
      <StudentPageHeader
        title="Wishlist"
        description="Courses you've saved for later."
      />
      {courses.length ? (
        <WishlistView courses={courses} />
      ) : (
        <>
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save courses you are interested in and they will show up here, ready for when you want to start."
            action={
              <Link href="/courses" className={buttonVariants()}>
                Browse courses
              </Link>
            }
          />
          <WishlistExtras />
        </>
      )}
    </>
  );
}
