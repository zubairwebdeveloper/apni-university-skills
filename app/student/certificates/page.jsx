// app/student/certificates/page.jsx
import Link from "next/link";
import { Award, BookOpenCheck, CalendarCheck } from "lucide-react";
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

// 3D stat tile: hover par perspective tilt
function StatTile({ icon: Icon, label, value, index }) {
  return (
    <div className="[perspective:700px]">
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-[0_3px_0_0_var(--border)]",
          "transition-transform duration-200 hover:shadow-md",
          "hover:[transform:rotateX(6deg)_rotateY(-6deg)_translateY(-2px)]",
          "motion-reduce:transition-none motion-reduce:hover:[transform:none]",
          enter,
        )}
        style={{ animationDelay: `${index * 80}ms` }}
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary shadow-[0_3px_0_0_color-mix(in_oklab,var(--primary)_25%,transparent)] ring-1 ring-inset ring-primary/20">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-semibold tabular-nums">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Stats({ total, latest, inProgressCount }) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      <StatTile
        index={0}
        icon={Award}
        label="Certificates earned"
        value={total}
      />
      <StatTile
        index={1}
        icon={CalendarCheck}
        label="Latest certificate"
        value={formatDate(latest)}
      />
      <StatTile
        index={2}
        icon={BookOpenCheck}
        label="Courses in progress"
        value={inProgressCount}
      />
    </div>
  );
}

// Khali halat: tairta hua 3D badge
function EmptyBadge() {
  return (
    <div className="relative mx-auto mb-6 size-28 [perspective:700px]">
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
    return (
      <>
        {header}
        <Stats total={0} latest={0} inProgressCount={inProgress.length} />
        <section
          aria-labelledby="no-certs-title"
          className={cn(
            "rounded-2xl border bg-gradient-to-b from-primary/[0.06] to-transparent px-6 py-12 text-center",
            enter,
          )}
        >
          <EmptyBadge />
          <h2 id="no-certs-title" className="text-lg font-semibold">
            No certificates yet
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Complete a course to earn your first certificate.
          </p>
          <Link
            href="/student/courses"
            className={cn(
              buttonVariants(),
              "mt-6 shadow-[0_3px_0_0_color-mix(in_oklab,var(--primary)_55%,black)] transition-[transform,box-shadow] duration-100",
              "active:translate-y-[3px] active:shadow-none motion-reduce:transition-none motion-reduce:active:translate-y-0",
            )}
          >
            Go to my courses
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
        inProgressCount={inProgress.length}
      />
      <CertificatesView meta={meta} cards={cards} inProgress={inProgress} />
    </>
  );
}
