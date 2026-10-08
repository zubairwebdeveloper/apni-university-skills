import { Bell } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { MarkReadButton } from "@/components/student/MarkReadButton";
import {
  NotificationsExtras,
  NotificationsView,
} from "@/components/student/NotificationsView";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { requireUser } from "@/lib/auth/session";
import { safeNext } from "@/lib/utils/url";
import { notificationInboxRepository } from "@/repositories/notificationInboxRepository";
import { formatDateTime } from "@/lib/utils/format";

export const metadata = { title: "Notifications" };

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

  const hasUnread = items.some((n) => !n.read);

  return (
    <>
      <StudentPageHeader
        title="Notifications"
        description="Announcements and updates from our team."
      >
        {hasUnread && <MarkReadButton />}
      </StudentPageHeader>

      {!items.length ? (
        <>
          <EmptyState
            icon={Bell}
            title="Nothing yet"
            description="Announcements from our team will appear here."
          />
          <NotificationsExtras />
        </>
      ) : (
        <NotificationsView
          items={items}
          now={Math.max(0, ...items.map((item) => item.createdAt))}
        />
      )}
    </>
  );
}
