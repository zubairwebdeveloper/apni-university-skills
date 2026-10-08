// components/admin/people/PeopleTables.jsx
"use client";
import Link from "next/link";
import {
  FiCheckCircle,
  FiEye,
  FiUserCheck,
  FiUserX,
  FiUsers,
} from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataTable } from "@/components/admin/table/DataTable";
import { BulkActionBar } from "@/components/admin/table/BulkActionBar";
import { RowActions } from "@/components/admin/table/RowActions";
import { useSelection } from "@/hooks/useSelection";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { formatDate } from "@/lib/utils/format";
import {
  bulkSetStudentsActive,
  setStudentActive,
} from "@/app/actions/admin/students";
import { setUserActive } from "@/app/actions/admin/users";

const Person = ({ r, href }) => (
  <div className="flex items-center gap-3">
    <Avatar className="size-9">
      <AvatarImage src={r.photoURL || undefined} alt="" />
      <AvatarFallback>{r.displayName?.charAt(0)?.toUpperCase()}</AvatarFallback>
    </Avatar>
    <div className="min-w-0">
      {r.slug ? (
        <Link href={href} className="font-medium hover:underline">
          {r.displayName}
        </Link>
      ) : (
        <span className="font-medium">{r.displayName}</span>
      )}
      <p className="truncate text-xs text-muted-foreground">{r.email}</p>
    </div>
  </div>
);
const active = (r) =>
  r.isActive === false ? (
    <Badge variant="destructive">Inactive</Badge>
  ) : (
    <Badge variant="secondary">Active</Badge>
  );
const verified = (r) =>
  r.emailVerified ? (
    <>
      <FiCheckCircle className="size-4 text-primary" aria-hidden="true" />
      <span className="sr-only">Verified</span>
    </>
  ) : (
    <span className="text-xs text-muted-foreground">Not verified</span>
  );

function columns({ base, extra, actions }) {
  return [
    {
      key: "person",
      header: "Name",
      className: "min-w-56",
      cell: (r) => <Person r={r} href={`${base}/${r.slug}`} />,
    },
    ...extra,
    { key: "status", header: "Status", cell: active },
    { key: "verified", header: "Email", cell: verified },
    {
      key: "joined",
      header: "Joined",
      className: "whitespace-nowrap text-muted-foreground",
      cell: (r) => formatDate(r.createdAt),
    },
    {
      key: "login",
      header: "Last login",
      className: "whitespace-nowrap text-muted-foreground",
      cell: (r) => formatDate(r.lastLoginAt) || "—",
    },
    {
      key: "actions",
      header: "Actions",
      srOnlyHeader: true,
      className: "w-12",
      cell: actions,
    },
  ];
}

export function StudentsTable({ rows, perms }) {
  const { selected, setSelected, clear, ids } = useSelection(rows);
  const canEdit = perms.includes("students.update");
  const cols = columns({
    base: "/admin/students",
    extra: [],
    actions: (r) => (
      <RowActions
        label={r.displayName}
        items={[
          {
            key: "view",
            label: "View",
            icon: FiEye,
            href: `/admin/students/${r.slug}`,
            hidden: !r.slug,
          },
          {
            key: "deactivate",
            label: "Deactivate",
            icon: FiUserX,
            destructive: true,
            separatorBefore: true,
            hidden: !canEdit || r.isActive === false,
            run: () => setStudentActive({ slug: r.slug, active: false }),
            success: "Student deactivated successfully.",
            confirm: {
              title: `Deactivate ${r.displayName}?`,
              description:
                "They are signed out everywhere and can't log in until you reactivate the account.",
              confirmLabel: "Deactivate",
            },
          },
          {
            key: "activate",
            label: "Activate",
            icon: FiUserCheck,
            hidden: !canEdit || r.isActive !== false,
            run: () => setStudentActive({ slug: r.slug, active: true }),
            success: "Student activated successfully.",
          },
        ]}
      />
    ),
  });
  return (
    <>
      <DataTable
        columns={cols}
        rows={rows}
        caption="Students"
        selectable={canEdit}
        selected={selected}
        onSelectedChange={setSelected}
        empty={
          <EmptyState
            icon={FiUsers}
            title="No students match"
            description="Try a different search or filter."
          />
        }
      />
      {canEdit && (
        <BulkActionBar
          selectedIds={ids}
          onClear={clear}
          run={(action, selectedIds) =>
            bulkSetStudentsActive({
              ids: selectedIds,
              active: action === "activate",
            })
          }
          actions={[
            { key: "activate", label: "Activate", icon: FiUserCheck },
            {
              key: "deactivate",
              label: "Deactivate",
              icon: FiUserX,
              destructive: true,
              confirm: {
                title: "Deactivate {n} students?",
                description:
                  "They are signed out everywhere and can't log in until reactivated.",
                confirmLabel: "Deactivate",
              },
            },
          ]}
        />
      )}
    </>
  );
}

export function UsersTable({ rows, perms, selfUid }) {
  const canEdit = perms.includes("users.update");
  const cols = columns({
    base: "/admin/users",
    extra: [
      {
        key: "role",
        header: "Role",
        cell: (r) => (
          <Badge variant="outline">{ROLE_LABELS[r.role] ?? r.role}</Badge>
        ),
      },
    ],
    actions: (r) => (
      <RowActions
        label={r.displayName}
        items={[
          {
            key: "view",
            label: "View",
            icon: FiEye,
            href: `/admin/users/${r.slug}`,
            hidden: !r.slug,
          },
          {
            key: "deactivate",
            label: "Deactivate",
            icon: FiUserX,
            destructive: true,
            separatorBefore: true,
            hidden: !canEdit || r.isActive === false || r.id === selfUid,
            run: () => setUserActive({ slug: r.slug, active: false }),
            success: "User deactivated successfully.",
            confirm: {
              title: `Deactivate ${r.displayName}?`,
              description:
                "They are signed out everywhere and can't log in until you reactivate the account.",
              confirmLabel: "Deactivate",
            },
          },
          {
            key: "activate",
            label: "Activate",
            icon: FiUserCheck,
            hidden: !canEdit || r.isActive !== false,
            run: () => setUserActive({ slug: r.slug, active: true }),
            success: "User activated successfully.",
          },
        ]}
      />
    ),
  });
  return (
    <DataTable
      columns={cols}
      rows={rows}
      caption="Users"
      empty={
        <EmptyState
          icon={FiUsers}
          title="No users match"
          description="Try a different search or filter."
        />
      }
    />
  );
}

