// components/admin/people/PeopleTables.jsx
"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const STAFF_ROLES = ["admin", "editor"];

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "?";
}

function TableReveal({ children }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full min-w-0"
    >
      {children}
    </motion.div>
  );
}

const Person = ({ r, href }) => (
  <div className="flex min-w-0 items-center gap-3">
    <Avatar className="size-9 shrink-0 border border-border">
      <AvatarImage src={r.photoURL || undefined} alt="" />
      <AvatarFallback className="bg-violet-500/10 text-xs font-semibold text-violet-600 dark:text-violet-300">
        {getInitial(r.displayName)}
      </AvatarFallback>
    </Avatar>
    <div className="min-w-0">
      {r.slug ? (
        <Link
          href={href}
          className={`block truncate text-sm font-medium leading-5 text-foreground transition-colors hover:text-violet-600 hover:underline dark:hover:text-violet-300 ${focusRing}`}
        >
          {r.displayName}
        </Link>
      ) : (
        <span className="block truncate text-sm font-medium leading-5 text-foreground">
          {r.displayName}
        </span>
      )}
      <p className="truncate text-xs leading-5 text-muted-foreground">
        {r.email}
      </p>
    </div>
  </div>
);

const active = (r) =>
  r.isActive === false ? (
    <Badge
      variant="outline"
      className="gap-1.5 border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300"
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      Inactive
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="gap-1.5 border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      Active
    </Badge>
  );

const verified = (r) =>
  r.emailVerified ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
      <FiCheckCircle aria-hidden="true" className="size-4" />
      Verified
    </span>
  ) : (
    <span className="text-xs text-muted-foreground">Not verified</span>
  );

const roleCell = (r) => (
  <Badge
    variant="outline"
    className={
      STAFF_ROLES.includes(r.role)
        ? "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300"
        : undefined
    }
  >
    {ROLE_LABELS[r.role] ?? r.role}
  </Badge>
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
      className: "whitespace-nowrap text-sm tabular-nums text-muted-foreground",
      cell: (r) => formatDate(r.createdAt),
    },
    {
      key: "login",
      header: "Last login",
      className: "whitespace-nowrap text-sm tabular-nums text-muted-foreground",
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
      <TableReveal>
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
              description="Try a different search or filter. New students appear here after they sign up."
            />
          }
        />
      </TableReveal>
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
    extra: [{ key: "role", header: "Role", cell: roleCell }],
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
    <TableReveal>
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
    </TableReveal>
  );
}
