// app/student/page.jsx
import Link from "next/link";
import { FiAward, FiBookOpen } from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { EnrolledCourseCard } from "@/components/student/EnrolledCourseCard";
import {
  DashboardHero,
  HelpCard,
  Milestones,
  QuickActions,
  Reveal,
  StaggerGrid,
  StaggerItem,
  StatsRow,
  TipCard,
} from "@/components/student/DashboardSections";
import { requireUser } from "@/lib/auth/session";
import { userService } from "@/services/userService";
import { enrollmentService } from "@/services/enrollmentService";

export const metadata = { title: "Dashboard" };

const VISIBLE_COURSES = 4;

export default async function StudentDashboard() {
  const user = await requireUser();
  const [profile, items] = await Promise.all([
    userService.getProfile(user.uid),
    enrollmentService.getStudentCourses(user.uid),
  ]);
  const active = items.filter((i) => i.status === "active");
  const completed = items.filter((i) => i.status === "completed");
  const first = (profile?.displayName ?? "").split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      <DashboardHero
        first={first}
        total={items.length}
        active={active.length}
        completed={completed.length}
      />

      <StatsRow
        total={items.length}
        active={active.length}
        completed={completed.length}
      />

      <QuickActions />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_21rem]">
        {/* Main column */}
        <section
          id="continue"
          aria-labelledby="continue-title"
          className="scroll-mt-24"
        >
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 id="continue-title" className="text-xl font-semibold">
                Continue learning
              </h2>
              <p className="text-sm text-muted-foreground">
                Pick up where you left off.
              </p>
            </div>
            {active.length > VISIBLE_COURSES && (
              <Link
                href="/student/courses"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                View all ({active.length})
              </Link>
            )}
          </div>

          {active.length ? (
            <StaggerGrid className="grid gap-5 sm:grid-cols-2">
              {active.slice(0, VISIBLE_COURSES).map((i) => (
                <StaggerItem key={i.id}>
                  <EnrolledCourseCard item={i} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          ) : items.length ? (
            <Reveal>
              <EmptyState
                icon={FiAward}
                title="You've completed everything"
                description="Find your next course and keep building."
                action={
                  <Link href="/courses" className={buttonVariants()}>
                    Browse courses
                  </Link>
                }
              />
            </Reveal>
          ) : (
            <Reveal>
              <EmptyState
                icon={FiBookOpen}
                title="You haven't enrolled in a course yet"
                description="Start with a free course and build momentum."
                action={
                  <Link href="/courses?price=free" className={buttonVariants()}>
                    Explore free courses
                  </Link>
                }
              />
            </Reveal>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <Milestones total={items.length} completed={completed.length} />
          <TipCard />
        </aside>
      </div>

      <Reveal>
        <HelpCard />
      </Reveal>
    </div>
  );
}
