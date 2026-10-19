// app/student/wishlist/page.jsx
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Reveal } from "@/components/student/Reveal";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import {
  WishlistExtras,
  WishlistView,
} from "@/components/student/WishlistView";
import {
  MotionRoot,
  WishlistBackdrop,
  WishlistHero,
} from "@/components/student/WishlistMotion";
import { requireUser } from "@/lib/auth/session";
import { wishlistService } from "@/services/wishlistService";
import { cn } from "@/lib/utils";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await requireUser();
  const courses = await wishlistService.getWishlistCourses(user.uid);

  const description = courses.length
    ? `${courses.length} ${
        courses.length === 1 ? "course" : "courses"
      } saved for later.`
    : "Courses you've saved for later.";

  return (
    <MotionRoot>
      <div className="relative isolate">
        <WishlistBackdrop />

        <div className="space-y-8">
          <StudentPageHeader title="Wishlist" description={description} />

          <WishlistHero count={courses.length} />

          {courses.length ? (
            <section
              id="saved-courses"
              aria-label="Saved courses"
              className="scroll-mt-24"
            >
              <Reveal>
                <WishlistView courses={courses} />
              </Reveal>
            </section>
          ) : (
            <>
              <Reveal>
                <EmptyState
                  icon={Heart}
                  title="Your wishlist is empty"
                  description="Save courses you are interested in and they will show up here, ready for when you want to start."
                  action={
                    <Link
                      href="/courses"
                      className={cn(
                        buttonVariants(),
                        "group gap-2 shadow-[0_3px_0_0_color-mix(in_oklab,var(--primary)_55%,black)] transition-[transform,box-shadow] duration-100",
                        "active:translate-y-[3px] active:shadow-none motion-reduce:transition-none motion-reduce:active:translate-y-0",
                      )}
                    >
                      Browse courses
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                      />
                    </Link>
                  }
                />
              </Reveal>
              <Reveal delay={0.1}>
                <WishlistExtras />
              </Reveal>
            </>
          )}
        </div>
      </div>
    </MotionRoot>
  );
}
