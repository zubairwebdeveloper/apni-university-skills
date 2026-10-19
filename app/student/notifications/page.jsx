// app/student/notifications/page.jsx
import { Bell } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { MarkReadButton } from "@/components/student/MarkReadButton";
import {
  NotificationsExtras,
  NotificationsView,
} from "@/components/student/NotificationsView";
import { NotificationsBackdrop } from "@/components/student/NotificationsBackdrop";
import { NotificationsStats } from "@/components/student/NotificationsStats";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { requireUser } from "@/lib/auth/session";
import { safeNext } from "@/lib/utils/url";
import { notificationInboxRepository } from "@/repositories/notificationInboxRepository";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Notifications" };

const enter =
  "animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 motion-reduce:animate-none";

// Handles ms, ISO strings and Firestore Timestamps
const toMs = (v) => {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Date.parse(v) || 0;
  if (typeof v.toMillis === "function") return v.toMillis();
  const s = v.seconds ?? v._seconds;
  return s ? s * 1000 : 0;
};

export default async function StudentNotificationsPage() {
  const user = await requireUser();
  const raw = await notificationInboxRepository.listByUser(user.uid);
  // Only plain, serializable fields go to the client component
  const items = raw.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body ?? "",
    href: n.link && safeNext(n.link, "") ? n.link : null,
    read: Boolean(n.readAt),
    createdAt: toMs(n.createdAt),
    dateLabel: formatDateTime(n.createdAt),
  }));

  const unread = items.filter((n) => !n.read).length;
  const hasUnread = unread > 0;
  const latest = items.reduce(
    (a, b) => (b.createdAt > (a?.createdAt ?? 0) ? b : a),
    null,
  );

  const description = hasUnread
    ? `You have ${unread} unread ${
        unread === 1 ? "notification" : "notifications"
      }. Announcements and updates from our team.`
    : "Announcements and updates from our team.";

  return (
    <div className="relative isolate">
      <NotificationsBackdrop />

      <StudentPageHeader title="Notifications" description={description}>
        {hasUnread && <MarkReadButton />}
      </StudentPageHeader>

      {!items.length ? (
        <>
          <div className={enter}>
            <EmptyState
              icon={Bell}
              title="Nothing yet"
              description="Announcements from our team will appear here."
            />
          </div>
          <NotificationsExtras />
        </>
      ) : (
        <div className={cn("space-y-6", enter)}>
          <NotificationsStats
            total={items.length}
            unread={unread}
            latestLabel={latest?.dateLabel}
          />
          <NotificationsView items={items} now={latest?.createdAt ?? 0} />
        </div>
      )}
    </div>
  );
}
