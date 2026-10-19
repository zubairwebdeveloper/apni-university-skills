// components/student/WishlistGrid.jsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowRight, Heart, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { CourseCard } from "@/components/public/CourseCard";
import { removeFromWishlist } from "@/app/actions/student";
import { cn } from "@/lib/utils";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function WishlistGrid({ courses }) {
  const router = useRouter();
  const [items, setItems] = useState(courses);
  const [pending, start] = useTransition();
  const [confirmingId, setConfirmingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [announcement, setAnnouncement] = useState("");

  function remove(c) {
    setRemovingId(c.id);

    start(async () => {
      try {
        const res = await removeFromWishlist(c.id);

        if (!res?.ok) {
          toast.error(res?.error || "Couldn't remove this course. Try again.");
          return;
        }

        setItems((l) => l.filter((x) => x.id !== c.id));
        setConfirmingId(null);
        setAnnouncement("Course removed from your wishlist.");
        toast.success("Removed from your wishlist");
        router.refresh();
      } catch {
        toast.error("Couldn't remove this course. Try again.");
      } finally {
        setRemovingId(null);
      }
    });
  }

  if (!items.length)
    return (
      <MotionConfig reducedMotion="user">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save courses you're interested in and find them here."
            action={
              <Link
                href="/courses"
                className={cn(buttonVariants(), "group gap-2")}
              >
                Browse courses
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          />
          <p className="sr-only" role="status" aria-live="polite">
            {announcement}
          </p>
        </motion.div>
      </MotionConfig>
    );

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label="Saved courses" className="space-y-5">
        {/* Summary bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <span className="grid size-8 place-items-center rounded-lg bg-[#FACC15] text-[#111318]">
              <Heart className="size-4" aria-hidden="true" />
            </span>
            <span>
              <span className="font-bold tabular-nums text-foreground">
                {items.length}
              </span>{" "}
              saved {items.length === 1 ? "course" : "courses"}
            </span>
          </p>

          <Link
            href="/courses"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "group gap-1.5",
            )}
          >
            Find more courses
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Grid */}
        <ul className="grid list-none gap-5 p-0 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((c, index) => {
              const confirming = confirmingId === c.id;
              const removing = removingId === c.id && pending;

              return (
                <motion.li
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.25,
                    ease: "easeOut",
                    delay: Math.min(index, 6) * 0.04,
                  }}
                  className="flex flex-col gap-2"
                >
                  <div className="flex-1">
                    <CourseCard course={c} />
                  </div>

                  {/* Remove action: two steps so a stray click can't delete */}
                  <div
                    onKeyDown={(event) => {
                      if (event.key === "Escape" && confirming && !removing)
                        setConfirmingId(null);
                    }}
                  >
                    {confirming ? (
                      <div
                        role="group"
                        aria-label="Confirm removal"
                        className="flex items-center gap-2"
                      >
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(c)}
                          disabled={pending}
                          className={cn("flex-1 gap-2", FOCUS)}
                        >
                          {removing ? (
                            <Loader2
                              className="size-4 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <Trash2 className="size-4" aria-hidden="true" />
                          )}
                          {removing ? "Removing…" : "Yes, remove"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmingId(null)}
                          disabled={removing}
                          aria-label="Cancel removal"
                          className={cn("gap-1.5", FOCUS)}
                        >
                          <X className="size-4" aria-hidden="true" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmingId(c.id)}
                        disabled={pending}
                        className={cn(
                          "w-full gap-2 text-muted-foreground hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive",
                          FOCUS,
                        )}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        Remove from wishlist
                      </Button>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
      </section>
    </MotionConfig>
  );
}
