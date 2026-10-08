// components/admin/dashboard/RecentActivity.jsx (server component)
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatAuditAction } from "@/lib/constants/audit";
import { isNavReady } from "@/config/adminNav";
import { formatDateTime, formatPrice } from "@/lib/utils/format";

const SECTIONS = [
  {
    key: "enrollments",
    label: "Enrollments",
    href: "/admin/enrollments",
    row: (e) => ({
      title: e.studentName,
      sub: e.courseTitle,
      status: e.status,
      at: e.enrolledAt,
    }),
  },
  {
    key: "payments",
    label: "Payments",
    href: "/admin/payments",
    row: (p) => ({
      title: p.courseTitle,
      sub: formatPrice(p.amount, p.currency),
      status: p.status,
      at: p.createdAt,
    }),
  },
  {
    key: "reviews",
    label: "Reviews",
    href: "/admin/reviews",
    row: (r) => ({
      title: r.courseTitle,
      sub: `${r.studentName} · ${r.rating}/5`,
      status: r.status,
      at: r.createdAt,
    }),
  },
  {
    key: "users",
    label: "Users",
    href: "/admin/users",
    row: (u) => ({
      title: u.displayName,
      sub: u.email,
      status: u.role,
      at: u.createdAt,
    }),
  },
  {
    key: "courses",
    label: "Courses",
    href: "/admin/courses",
    row: (c) => ({
      title: c.title,
      sub: c.category,
      status: c.status,
      at: c.createdAt,
    }),
  },
  {
    key: "blog",
    label: "Blog posts",
    href: "/admin/blog",
    row: (b) => ({
      title: b.title,
      sub: b.authorName,
      status: b.status,
      at: b.createdAt,
    }),
  },
  {
    key: "audit",
    label: "Admin actions",
    href: "/admin/audit",
    row: (a) => ({
      title: formatAuditAction(a.action),
      sub: `${a.actorEmail ?? "system"}${a.resourceSlug ? ` · ${a.resourceSlug}` : ""}`,
      at: a.createdAt,
    }),
  },
];

export function RecentActivity({ data }) {
  const sections = SECTIONS.filter((s) => data[s.key] !== undefined);
  if (!sections.length) return null;
  return (
    <section aria-labelledby="activity-title">
      <h2 id="activity-title" className="mb-3 text-xl">
        Recent activity
      </h2>
      <Card className="p-4">
        <Tabs defaultValue={sections[0].key}>
          <TabsList className="h-auto w-full justify-start overflow-x-auto">
            {sections.map((s) => (
              <TabsTrigger key={s.key} value={s.key}>
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {sections.map((s) => {
            const items = data[s.key];
            return (
              <TabsContent key={s.key} value={s.key} className="pt-3">
                {items === null ? (
                  <p className="py-6 text-sm text-muted-foreground">
                    Couldn&apos;t load this list.
                  </p>
                ) : !items.length ? (
                  <p className="py-6 text-sm text-muted-foreground">
                    Nothing here yet.
                  </p>
                ) : (
                  <ul className="divide-y">
                    {items.map((item) => {
                      const r = s.row(item);
                      return (
                        <li
                          key={item.id}
                          className="flex items-center gap-3 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {r.title}
                            </p>
                            {r.sub && (
                              <p className="truncate text-xs text-muted-foreground">
                                {r.sub}
                              </p>
                            )}
                          </div>
                          {r.status && <StatusBadge status={r.status} />}
                          <time
                            className="hidden shrink-0 text-xs text-muted-foreground sm:block"
                            dateTime={
                              r.at ? new Date(r.at).toISOString() : undefined
                            }
                          >
                            {formatDateTime(r.at)}
                          </time>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {isNavReady(s.href) && (
                  <p className="mt-2 text-right text-sm">
                    <Link
                      href={s.href}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      View all
                    </Link>
                  </p>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </Card>
    </section>
  );
}

