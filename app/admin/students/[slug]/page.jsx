// app/admin/students/[slug]/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  ActiveCard,
  StudentProfileForm,
} from "@/components/admin/people/AccountControls";
import { Rating } from "@/components/shared/Rating";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { requirePermission } from "@/lib/auth/authorize";
import { can, PERMISSIONS as P } from "@/lib/constants/permissions";
import { isNavReady } from "@/config/adminNav";
import { adminSlug } from "@/lib/validations/common";
import { userAdminRepository } from "@/repositories/admin/userAdminRepository";
import { getStudentActivity } from "@/services/admin/studentActivityService";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils/format";

export const metadata = { title: "Student" };

const Note = ({ children }) => (
  <p className="py-6 text-sm text-muted-foreground">{children}</p>
);
const List = ({ items, empty, row }) =>
  items === null ? (
    <Note>Couldn&apos;t load this list.</Note>
  ) : !items.length ? (
    <Note>{empty}</Note>
  ) : (
    <ul className="divide-y">
      {items.map((i) => (
        <li
          key={i.id}
          className="flex flex-wrap items-center gap-3 py-3 text-sm"
        >
          {row(i)}
        </li>
      ))}
    </ul>
  );

export default async function AdminStudentPage({ params }) {
  const user = await requirePermission(P.STUDENTS_READ);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const s = await userAdminRepository.findBySlug(parsed.data);
  if (!s || s.role !== "student") notFound();
  const a = await getStudentActivity(s.id, user.role);
  const tabs = [
    ["enrollments", "Enrollments"],
    ["payments", "Payments"],
    ["certificates", "Certificates"],
    ["reviews", "Reviews"],
  ].filter(([k]) => a[k] !== undefined);

  return (
    <>
      <AdminPageHeader
        title={s.displayName}
        description={s.email}
        actions={
          <>
            {s.isActive === false ? (
              <Badge variant="destructive">Inactive</Badge>
            ) : (
              <Badge variant="secondary">Active</Badge>
            )}
            {can(user.role, P.AUDIT_READ) && (
              <Link
                href={`/admin/audit?actor=${s.id}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Their admin activity
              </Link>
            )}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="p-5">
          {tabs.length ? (
            <Tabs defaultValue={tabs[0][0]}>
              <TabsList className="h-auto w-full justify-start overflow-x-auto">
                {tabs.map(([k, l]) => (
                  <TabsTrigger key={k} value={k}>
                    {l}
                  </TabsTrigger>
                ))}
              </TabsList>
              {a.enrollments !== undefined && (
                <TabsContent value="enrollments">
                  <List
                    items={a.enrollments}
                    empty="No enrollments."
                    row={(e) => (
                      <>
                        <div className="min-w-0 flex-1 basis-48">
                          <Link
                            href={`/admin/enrollments/${e.slug}`}
                            className="font-medium hover:underline"
                          >
                            {e.courseTitle}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            Enrolled {formatDate(e.enrolledAt)}
                          </p>
                        </div>
                        <div className="flex w-32 items-center gap-2">
                          <Progress
                            value={e.progress ?? 0}
                            aria-label={`Progress ${e.progress ?? 0}%`}
                            className="h-1.5"
                          />
                          <span className="text-xs tabular-nums">
                            {e.progress ?? 0}%
                          </span>
                        </div>
                        <StatusBadge status={e.status} />
                      </>
                    )}
                  />
                </TabsContent>
              )}
              {a.payments !== undefined && (
                <TabsContent value="payments">
                  <List
                    items={a.payments}
                    empty="No payments."
                    row={(p) => (
                      <>
                        <div className="min-w-0 flex-1 basis-48">
                          <p className="font-medium">{p.courseTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(p.createdAt)}
                            {p.slug && isNavReady("/admin/payments") && (
                              <>
                                {" "}
                                ·{" "}
                                <Link
                                  href={`/admin/payments/${p.slug}`}
                                  className="hover:underline"
                                >
                                  {p.slug}
                                </Link>
                              </>
                            )}
                          </p>
                        </div>
                        <span className="tabular-nums">
                          {formatPrice(p.amount, p.currency)}
                        </span>
                        <StatusBadge status={p.status} />
                      </>
                    )}
                  />
                </TabsContent>
              )}
              {a.certificates !== undefined && (
                <TabsContent value="certificates">
                  <List
                    items={a.certificates}
                    empty="No certificates."
                    row={(c) => (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{c.courseTitle}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {c.certificateNumber}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(c.issuedAt)}
                        </span>
                      </>
                    )}
                  />
                </TabsContent>
              )}
              {a.reviews !== undefined && (
                <TabsContent value="reviews">
                  <List
                    items={a.reviews}
                    empty="No reviews."
                    row={(r) => (
                      <>
                        <div className="min-w-0 flex-1 basis-48">
                          <p className="font-medium">{r.courseTitle}</p>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {r.comment}
                          </p>
                        </div>
                        <Rating value={r.rating} count={1} showCount={false} />
                        <StatusBadge status={r.status} />
                      </>
                    )}
                  />
                </TabsContent>
              )}
            </Tabs>
          ) : (
            <Note>
              You don&apos;t have access to this student&apos;s activity.
            </Note>
          )}
        </Card>

        <aside className="space-y-6">
          <Card className="gap-4 p-5">
            <div className="flex items-center gap-3">
              <Avatar className="size-14">
                <AvatarImage src={s.photoURL || undefined} alt="" />
                <AvatarFallback className="font-serif text-xl">
                  {s.displayName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-sm">
                <p className="truncate font-medium">{s.displayName}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {s.slug}
                </p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">
                  {s.emailVerified ? "Verified" : "Not verified"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Joined</dt>
                <dd className="font-medium">{formatDate(s.createdAt)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Last login</dt>
                <dd className="font-medium">
                  {formatDateTime(s.lastLoginAt) || "—"}
                </dd>
              </div>
            </dl>
          </Card>
          {can(user.role, P.STUDENTS_UPDATE) && (
            <>
              <ActiveCard
                slug={s.slug}
                isActive={s.isActive !== false}
                isSelf={s.id === user.uid}
                scope="student"
                verified={!!s.emailVerified}
              />
              <Card className="gap-4 p-5">
                <h2 className="text-lg">Edit profile</h2>
                <StudentProfileForm student={s} />
              </Card>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
