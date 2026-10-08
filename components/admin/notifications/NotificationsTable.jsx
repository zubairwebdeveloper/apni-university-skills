// components/admin/notifications/NotificationsTable.jsx
"use client";
import { FiBell, FiSend, FiX } from "react-icons/fi";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/admin/table/DataTable";
import { RowActions } from "@/components/admin/table/RowActions";
import { AUDIENCES } from "@/lib/validations/notification";
import { formatDateTime } from "@/lib/utils/format";
import {
  cancelNotification,
  sendNotification,
} from "@/app/actions/admin/notifications";

const audienceLabel = (a) =>
  a.kind === "course"
    ? `Course: ${a.courseTitle}`
    : a.kind === "users"
      ? `${a.targetIds?.length ?? 0} specific users`
      : (AUDIENCES.find((x) => x.value === a.kind)?.label ?? a.kind);

export function NotificationsTable({ rows }) {
  const columns = [
    {
      key: "title",
      header: "Notification",
      className: "min-w-64",
      cell: (r) => (
        <div>
          <p className="font-medium">{r.title}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground capitalize">
            {r.type} · {r.body}
          </p>
        </div>
      ),
    },
    {
      key: "audience",
      header: "Audience",
      className: "text-muted-foreground",
      cell: (r) => audienceLabel(r.audience),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "recipients",
      header: "Delivered",
      className: "tabular-nums",
      cell: (r) => r.recipientCount ?? 0,
    },
    {
      key: "when",
      header: "When",
      className: "whitespace-nowrap text-muted-foreground",
      cell: (r) => formatDateTime(r.sentAt ?? r.scheduledFor ?? r.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      srOnlyHeader: true,
      className: "w-12",
      cell: (r) => (
        <RowActions
          label={r.title}
          items={[
            {
              key: "send",
              label: "Send now",
              icon: FiSend,
              hidden: !["draft", "scheduled"].includes(r.status),
              run: () => sendNotification({ slug: r.slug }),
              success: "Notification sent successfully.",
              confirm: {
                title: "Send now?",
                description: `“${r.title}” is delivered to ${audienceLabel(r.audience)} and can't be recalled.`,
                confirmLabel: "Send now",
              },
            },
            {
              key: "cancel",
              label: "Cancel",
              icon: FiX,
              destructive: true,
              hidden: !["draft", "scheduled"].includes(r.status),
              run: () => cancelNotification({ slug: r.slug }),
              success: "Notification cancelled.",
              confirm: {
                title: "Cancel this notification?",
                description: "It won't be sent.",
                confirmLabel: "Cancel notification",
              },
            },
          ]}
        />
      ),
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={rows}
      caption="Notifications"
      minWidth="min-w-[880px]"
      empty={
        <EmptyState
          icon={FiBell}
          title="No notifications yet"
          description="Announce something to your students."
        />
      }
    />
  );
}

