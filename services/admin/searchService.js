// services/admin/searchService.js
import "server-only";
import { db } from "@/lib/firebase/admin/firestore";
import { can, PERMISSIONS as P } from "@/lib/constants/permissions";
import { toKeyword } from "@/lib/utils/search";
import { userAdminRepository } from "@/repositories/admin/userAdminRepository";

const LIVE = ["draft", "pending", "published", "scheduled", "archived"];
const kw = (c, k, fields, map) => async () =>
  (
    await db
      .collection(c)
      .where("status", "in", LIVE)
      .where("searchKeywords", "array-contains", k)
      .limit(5)
      .select(...fields)
      .get()
  ).docs.map(map);
const eq = (c, f, v, fields, map) => async () =>
  (
    await db
      .collection(c)
      .where(f, "==", v)
      .limit(5)
      .select(...fields)
      .get()
  ).docs.map(map);

export async function searchAdmin(q, role) {
  const k = toKeyword(q),
    low = q.toLowerCase();
  const student = q.includes("@")
    ? await userAdminRepository.findByEmail(low).catch(() => null)
    : null;
  const jobs = [];
  const add = (perm, label, run) =>
    can(role, perm) && jobs.push({ label, run });

  if (k) {
    add(
      P.COURSES_READ,
      "Courses",
      kw("courses", k, ["title", "category", "slug"], (d) => ({
        id: d.id,
        title: d.get("title"),
        sub: d.get("category"),
        href: `/admin/courses/${d.get("slug")}`,
      })),
    );
    add(
      P.INSTRUCTORS_READ,
      "Instructors",
      kw("instructors", k, ["name", "designation", "slug"], (d) => ({
        id: d.id,
        title: d.get("name"),
        sub: d.get("designation"),
        href: `/admin/instructors/${d.get("slug")}`,
      })),
    );
    add(
      P.BLOG_READ,
      "Blog",
      kw("blogPosts", k, ["title", "category", "slug"], (d) => ({
        id: d.id,
        title: d.get("title"),
        sub: d.get("category"),
        href: `/admin/blog/${d.get("slug")}`,
      })),
    );
    add(
      P.JOBS_READ,
      "Jobs",
      kw("jobs", k, ["title", "company", "slug"], (d) => ({
        id: d.id,
        title: d.get("title"),
        sub: d.get("company"),
        href: `/admin/jobs/${d.get("slug")}/edit`,
      })),
    );
    add(
      P.CAREERS_READ,
      "Careers",
      kw("careers", k, ["title", "slug"], (d) => ({
        id: d.id,
        title: d.get("title"),
        sub: "Career guide",
        href: `/admin/careers/${d.get("slug")}/edit`,
      })),
    );
    const people = (extra) => async () =>
      (
        await extra(
          db.collection("users").where("searchKeywords", "array-contains", k),
        )
          .limit(5)
          .select("displayName", "email", "slug", "role")
          .get()
      ).docs
        .filter((d) => d.get("slug"))
        .map((d) => ({
          id: d.id,
          title: d.get("displayName"),
          sub: d.get("email"),
          href: `${d.get("role") === "student" && !can(role, P.USERS_READ) ? "/admin/students" : can(role, P.USERS_READ) ? "/admin/users" : "/admin/students"}/${d.get("slug")}`,
        }));
    if (can(role, P.USERS_READ))
      add(
        P.USERS_READ,
        "Users",
        people((x) => x),
      );
    else
      add(
        P.STUDENTS_READ,
        "Students",
        people((x) => x.where("role", "==", "student")),
      );
  }
  if (/^pay-[a-z0-9]{6}$/.test(low))
    add(
      P.PAYMENTS_READ,
      "Payments",
      eq("payments", "slug", low, ["slug", "courseTitle", "status"], (d) => ({
        id: d.id,
        title: d.get("slug"),
        sub: `${d.get("courseTitle")} · ${d.get("status")}`,
        href: `/admin/payments/${d.get("slug")}`,
      })),
    );
  else if (student)
    add(
      P.PAYMENTS_READ,
      "Payments",
      eq(
        "payments",
        "studentId",
        student.id,
        ["slug", "courseTitle", "status"],
        (d) => ({
          id: d.id,
          title: d.get("slug"),
          sub: `${d.get("courseTitle")} · ${d.get("status")}`,
          href: `/admin/payments/${d.get("slug")}`,
        }),
      ),
    );
  if (/^enr-[a-z0-9]{6}$/.test(low))
    add(
      P.ENROLLMENTS_READ,
      "Enrollments",
      eq("enrollments", "slug", low, ["slug", "courseTitle"], (d) => ({
        id: d.id,
        title: d.get("slug"),
        sub: d.get("courseTitle"),
        href: `/admin/enrollments/${d.get("slug")}`,
      })),
    );
  else if (student)
    add(
      P.ENROLLMENTS_READ,
      "Enrollments",
      eq(
        "enrollments",
        "studentId",
        student.id,
        ["slug", "courseTitle"],
        (d) => ({
          id: d.id,
          title: d.get("courseTitle"),
          sub: student.displayName,
          href: `/admin/enrollments/${d.get("slug")}`,
        }),
      ),
    );
  if (/^au-[a-f0-9]{10}$/.test(low))
    add(
      P.CERTIFICATES_READ,
      "Certificates",
      eq(
        "certificates",
        "slug",
        q.toUpperCase(),
        ["slug", "courseTitle"],
        (d) => ({
          id: d.id,
          title: d.get("slug"),
          sub: d.get("courseTitle"),
          href: `/admin/certificates/${d.get("slug")}`,
        }),
      ),
    );

  const settled = await Promise.allSettled(jobs.map((j) => j.run()));
  return jobs
    .map((j, i) => ({
      label: j.label,
      items: settled[i].status === "fulfilled" ? settled[i].value : [],
    }))
    .filter((g) => g.items.length);
}

