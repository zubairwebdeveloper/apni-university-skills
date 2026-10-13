// app/student/page.jsx

import Link from "next/link";
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiChevronRight,
  FiCompass,
  FiLayers,
  FiPlay,
} from "react-icons/fi";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { EnrolledCourseCard } from "@/components/student/EnrolledCourseCard";

import {
  HelpCard,
  Milestones,
  QuickActions,
  Reveal,
  StaggerGrid,
  StaggerItem,
  TipCard,
} from "@/components/student/DashboardSections";

import {
  AchievementShelf,
  CompletionOrb,
  HeroScene3D,
  Stats3D,
  Tilt3D,
} from "@/components/student/Dashboard3D";

import { requireUser } from "@/lib/auth/session";
import { userService } from "@/services/userService";
import { enrollmentService } from "@/services/enrollmentService";

export const metadata = {
  title: "Dashboard",
  description: "Continue learning and track your progress at Apni University.",
};

const VISIBLE_COURSES = 4;

function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  count,
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ef07a2]">
            <span className="size-1.5 rounded-full bg-[#ef07a2]" />
            {eyebrow}
          </p>
        )}

        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>

        {description && (
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm font-bold text-foreground transition-colors hover:bg-[#ef07a2]/[0.06] hover:text-[#ef07a2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef07a2]"
        >
          {linkLabel}
          {count !== undefined && (
            <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground group-hover:border-[#ef07a2]/30 group-hover:text-[#ef07a2]">
              {count}
            </span>
          )}
          <FiArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

function DashboardShortcut({ href, icon: Icon, title, description }) {
  return (
    <Tilt3D className="rounded-xl" max={6}>
      <Link
        href={href}
        className="group flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors duration-200 hover:border-[#ef07a2]/40 hover:bg-[#ef07a2]/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef07a2]"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-muted/60 text-muted-foreground transition-colors group-hover:border-[#ef07a2]/25 group-hover:bg-[#ef07a2]/10 group-hover:text-[#ef07a2]">
          <Icon className="size-[18px]" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-foreground transition-colors group-hover:text-[#ef07a2]">
            {title}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {description}
          </span>
        </span>

        <FiChevronRight className="size-4 shrink-0 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#ef07a2]" />
      </Link>
    </Tilt3D>
  );
}

export default async function StudentDashboard() {
  const user = await requireUser();

  const [profile, items] = await Promise.all([
    userService.getProfile(user.uid),
    enrollmentService.getStudentCourses(user.uid),
  ]);

  const active = items.filter((item) => item.status === "active");
  const completed = items.filter((item) => item.status === "completed");

  const first = (profile?.displayName ?? "").trim().split(/\s+/)[0] || "there";

  const resume = active[0];
  const rest = active.slice(1, VISIBLE_COURSES);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-8 sm:space-y-10">
      {/* 3D Hero */}
      <Reveal>
        <HeroScene3D
          first={first}
          total={items.length}
          active={active.length}
          completed={completed.length}
        />
      </Reveal>

      {/* Stats */}
      <Reveal>
        <Stats3D
          total={items.length}
          active={active.length}
          completed={completed.length}
        />
      </Reveal>

      {/* Quick actions */}
      <Reveal>
        <QuickActions />
      </Reveal>

      <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0 space-y-8">
          {/* Resume learning */}
          {resume && (
            <section aria-labelledby="resume-title" className="scroll-mt-24">
              <SectionHeading
                eyebrow="Jump back in"
                title="Resume learning"
                description="Aap ka sab se pehla active course, ek click door."
              />

              <Reveal>
                <Tilt3D className="rounded-2xl" max={5}>
                  <div className="relative overflow-hidden rounded-2xl border border-[#ef07a2]/30 bg-gradient-to-br from-[#ef07a2]/[0.07] via-card to-card p-4 sm:p-5">
                    <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#ef07a2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      <FiPlay className="size-3" />
                      Up next
                    </span>
                    <EnrolledCourseCard item={resume} />
                  </div>
                </Tilt3D>
              </Reveal>
            </section>
          )}

          {/* Continue learning */}
          <section
            id="continue"
            aria-labelledby="continue-title"
            className="scroll-mt-24"
          >
            <SectionHeading
              eyebrow="Your learning space"
              title="Continue learning"
              description="Pick up where you left off and keep making progress."
              href={
                active.length > VISIBLE_COURSES ? "/student/courses" : undefined
              }
              linkLabel="View all courses"
              count={
                active.length > VISIBLE_COURSES ? active.length : undefined
              }
            />

            {rest.length > 0 ? (
              <StaggerGrid className="grid min-w-0 gap-5 sm:grid-cols-2">
                {rest.map((item) => (
                  <StaggerItem key={item.id}>
                    <Tilt3D className="rounded-2xl" max={6}>
                      <EnrolledCourseCard item={item} />
                    </Tilt3D>
                  </StaggerItem>
                ))}
              </StaggerGrid>
            ) : active.length > 0 ? (
              <p className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                Abhi sirf ek active course hai. Upar se resume karein.
              </p>
            ) : items.length > 0 ? (
              <Reveal>
                <EmptyState
                  icon={FiAward}
                  title="You've completed everything"
                  description="Amazing progress. Find your next course and keep building your skills."
                  action={
                    <Link href="/courses" className={buttonVariants()}>
                      Browse courses
                      <FiArrowRight className="ml-2 size-4" />
                    </Link>
                  }
                />
              </Reveal>
            ) : (
              <Reveal>
                <EmptyState
                  icon={FiBookOpen}
                  title="Your learning journey starts here"
                  description="Explore the course catalog and enroll in a course to get started."
                  action={
                    <Link
                      href="/courses?price=free"
                      className={buttonVariants()}
                    >
                      Explore free courses
                      <FiArrowRight className="ml-2 size-4" />
                    </Link>
                  }
                />
              </Reveal>
            )}
          </section>

          {/* Quick navigation */}
          <section aria-labelledby="explore-title">
            <SectionHeading
              eyebrow="Keep moving forward"
              title="Explore your workspace"
              description="Jump straight to the next part of your learning journey."
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <DashboardShortcut
                href="/student/courses"
                icon={FiLayers}
                title="My courses"
                description="Access your enrolled courses"
              />
              <DashboardShortcut
                href="/courses"
                icon={FiCompass}
                title="Discover courses"
                description="Find your next learning goal"
              />
              <DashboardShortcut
                href="/student/certificates"
                icon={FiAward}
                title="Certificates"
                description="Explore your achievements"
              />
              <DashboardShortcut
                href="/student/reviews"
                icon={FiCheckCircle}
                title="My reviews"
                description="Manage your course feedback"
              />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="min-w-0 space-y-5 xl:sticky xl:top-6 xl:self-start">
          <Reveal>
            <CompletionOrb total={items.length} completed={completed.length} />
          </Reveal>

          <Reveal>
            <AchievementShelf
              total={items.length}
              active={active.length}
              completed={completed.length}
            />
          </Reveal>

          <Reveal>
            <Milestones total={items.length} completed={completed.length} />
          </Reveal>

          <Reveal>
            <TipCard />
          </Reveal>
        </aside>
      </div>

      <Reveal>
        <HelpCard />
      </Reveal>
    </div>
  );
}
