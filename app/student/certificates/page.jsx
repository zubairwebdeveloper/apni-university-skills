// app/student/certificates/page.jsx
import Link from "next/link";
import { Award, BookOpenCheck, CalendarCheck, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  CertificatesExtras,
  CertificatesView,
} from "@/components/student/CertificatesView";
import { CertificateCard } from "@/components/student/CertificateCard";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { requireUser } from "@/lib/auth/session";
import { certificateService } from "@/services/certificateService";
import { enrollmentService } from "@/services/enrollmentService";
import { cn } from "@/lib/utils";

export const metadata = { title: "Certificates" };

// Handles ms, ISO strings and Firestore Timestamps
const toMs = (v) => {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Date.parse(v) || 0;
  if (typeof v.toMillis === "function") return v.toMillis();
  const s = v.seconds ?? v._seconds;
  return s ? s * 1000 : 0;
};

const formatDate = (ms) =>
  ms
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
        new Date(ms),
      )
    : "—";

const enter =
  "animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 motion-reduce:animate-none";

// Full class strings stay literal so Tailwind can detect them.
const TONES = {
  primary: {
    icon: "bg-primary/10 text-primary ring-primary/20 shadow-[0_3px_0_0_color-mix(in_oklab,var(--primary)_25%,transparent)]",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-600 ring-violet-500/25 shadow-[0_3px_0_0_rgb(139_92_246/0.25)] dark:text-violet-400",
  },
  yellow: {
    icon: "bg-yellow-400/15 text-yellow-700 ring-yellow-400/35 shadow-[0_3px_0_0_rgb(250_204_21/0.35)] dark:text-yellow-400",
  },
};

// 3D stat tile: perspective tilt on hover
function StatTile({ icon: Icon, label, value, hint, tone = "primary", index }) {
  return (
    <li className="[perspective:700px]">
      <div
        className={cn(
          "flex h-full items-start gap-3.5 rounded-2xl border bg-card p-4 shadow-[0_3px_0_0_var(--border)] sm:p-5",
          "transition-transform duration-200 hover:shadow-md",
          "hover:[transform:rotateX(6deg)_rotateY(-6deg)_translateY(-2px)]",
          "motion-reduce:transition-none motion-reduce:hover:[transform:none]",
          enter,
        )}
        style={{ animationDelay: `${index * 80}ms` }}
      >
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset",
            TONES[tone].icon,
          )}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-0.5 truncate text-xl font-semibold leading-tight tracking-tight tabular-nums">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function Stats({ total, latest, latestTitle, inProgressCount }) {
  return (
    <ul
      aria-label="Certificate summary"
      className="mb-8 grid gap-3 sm:grid-cols-3 sm:gap-4"
    >
      <StatTile
        index={0}
        icon={Award}
        label="Certificates earned"
        value={total}
        hint={
          total
            ? "Each one is verified and downloadable"
            : "Issued when you finish every lesson"
        }
      />
      <StatTile
        index={1}
        tone="violet"
        icon={CalendarCheck}
        label="Latest certificate"
        value={formatDate(latest)}
        hint={latestTitle || "Nothing issued yet"}
      />
      <StatTile
        index={2}
        tone="yellow"
        icon={BookOpenCheck}
        label="Courses in progress"
        value={inProgressCount}
        hint={
          inProgressCount
            ? "Finish them to earn the next certificate"
            : "Start a course to begin"
        }
      />
    </ul>
  );
}

// Empty state: floating 3D badge
function EmptyBadge() {
  return (
    <div className="relative mx-auto mb-7 size-28 [perspective:700px]">
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-y-3 rounded-3xl bg-primary/25 blur-xl"
      />
      <div className="relative size-28 animate-[cert-float_4s_ease-in-out_infinite] motion-reduce:animate-none">
        <span className="grid size-28 place-items-center rounded-3xl bg-primary text-primary-foreground shadow-[0_8px_0_0_color-mix(in_oklab,var(--primary)_55%,black)] ring-1 ring-inset ring-white/20 [transform:rotateX(14deg)_rotateY(-14deg)]">
          <Award aria-hidden="true" className="size-12" />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-black/10"
          />
        </span>
      </div>
    </div>
  );
}

// The process is a real sequence, so numbering is meaningful here.
const HOW_IT_WORKS = [
  "Complete every lesson in a course",
  "Your certificate is issued automatically",
  "Download it from this page",
];

export default async function CertificatesPage() {
  const user = await requireUser();
  const [certs, enrollments] = await Promise.all([
    certificateService.listForStudent(user.uid),
    enrollmentService.getStudentCourses(user.uid),
  ]);

  // Real in-progress courses (plain fields only)
  const inProgress = enrollments
    .filter((e) => e.status !== "completed" && (e.progress ?? 0) > 0)
    .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))
    .slice(0, 3)
    .map((e) => ({
      id: e.id,
      courseTitle: e.courseTitle,
      courseSlug: e.courseSlug,
      progress: Math.max(0, Math.min(100, Math.round(e.progress ?? 0))),
    }));

  const header = (
    <StudentPageHeader
      title="Certificates"
      description="Issued automatically when you complete every lesson in a course."
    />
  );

  if (!certs.length) {
    const closest = inProgress[0];

    return (
      <>
        {header}
        <Stats
          total={0}
          latest={0}
          latestTitle=""
          inProgressCount={inProgress.length}
        />
        <section
          aria-labelledby="no-certs-title"
          className={cn(
            "rounded-2xl border bg-gradient-to-b from-primary/[0.06] to-transparent px-6 py-12 text-center sm:py-14",
            enter,
          )}
        >
          <EmptyBadge />
          <h2
            id="no-certs-title"
            className="text-balance text-2xl font-semibold tracking-tight"
          >
            No certificates yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            {closest
              ? `You are ${closest.progress}% through ${closest.courseTitle}. Finish it to earn your first certificate.`
              : "Complete a course to earn your first certificate."}
          </p>

          <ol className="mx-auto mt-8 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <li
                key={step}
                className="flex items-start gap-3 rounded-xl border bg-card/70 p-4"
              >
                <span
                  aria-hidden="true"
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-violet-500/10 text-xs font-semibold tabular-nums text-violet-600 ring-1 ring-inset ring-violet-500/25 dark:text-violet-400"
                >
                  {i + 1}
                </span>
                <span className="text-sm leading-snug text-card-foreground">
                  {step}
                </span>
              </li>
            ))}
          </ol>

          <Link
            href="/student/courses"
            className={cn(
              buttonVariants(),
              "group mt-8 gap-2 shadow-[0_3px_0_0_color-mix(in_oklab,var(--primary)_55%,black)] transition-[transform,box-shadow] duration-100",
              "active:translate-y-[3px] active:shadow-none motion-reduce:transition-none motion-reduce:active:translate-y-0",
            )}
          >
            Go to my courses
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            />
          </Link>
        </section>
        <CertificatesExtras inProgress={inProgress} />
      </>
    );
  }

  // Adjust these field names if your certificate documents differ
  const meta = certs.map((c) => ({
    id: c.id,
    title: c.courseTitle ?? c.title ?? "Certificate",
    issuedAt: toMs(c.issuedAt ?? c.createdAt),
  }));
  const latest = Math.max(0, ...meta.map((m) => m.issuedAt));
  const latestTitle = meta.find((m) => m.issuedAt === latest)?.title ?? "";

  // Rendered on the server, so CertificateCard stays unchanged
  const cards = Object.fromEntries(
    certs.map((c) => [c.id, <CertificateCard key={c.id} certificate={c} />]),
  );

  return (
    <>
      {header}
      <Stats
        total={certs.length}
        latest={latest}
        latestTitle={latestTitle}
        inProgressCount={inProgress.length}
      />
      <CertificatesView meta={meta} cards={cards} inProgress={inProgress} />
    </>
  );
}
