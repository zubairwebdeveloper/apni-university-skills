import Link from "next/link";
import { Award } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { CertificateCard } from "@/components/student/CertificateCard";
import {
  CertificatesExtras,
  CertificatesView,
} from "@/components/student/CertificatesView";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { requireUser } from "@/lib/auth/session";
import { certificateService } from "@/services/certificateService";
import { enrollmentService } from "@/services/enrollmentService";

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

  if (!certs.length) {
    return (
      <>
        <StudentPageHeader
          title="Certificates"
          description="Issued automatically when you complete every lesson in a course."
        />
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete a course to earn your first certificate."
          action={
            <Link href="/student/courses" className={buttonVariants()}>
              Go to my courses
            </Link>
          }
        />
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

  // Rendered on the server, so CertificateCard stays unchanged
  const cards = Object.fromEntries(
    certs.map((c) => [c.id, <CertificateCard key={c.id} certificate={c} />]),
  );

  return (
    <>
      <StudentPageHeader
        title="Certificates"
        description="Issued automatically when you complete every lesson in a course."
      />
      <CertificatesView meta={meta} cards={cards} inProgress={inProgress} />
    </>
  );
}
