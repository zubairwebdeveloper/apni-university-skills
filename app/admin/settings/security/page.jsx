// app/admin/settings/security/page.jsx
import { Card } from "@/components/ui/card";
import { SecuritySettingsForm } from "@/components/admin/settings/SettingsForms";
import { RolesPermissionsExplorer } from "./RolesPermissionsExplorer";
import { requirePermission } from "@/lib/auth/authorize";
import {
  PERMISSIONS as P,
  ROLE_PERMISSIONS,
} from "@/lib/constants/permissions";
import { ROLE_LABELS, ROLE_LIST } from "@/lib/constants/roles";
import { settingsService } from "@/services/settingsService";

export const metadata = { title: "Security settings" };

function Stat({ value, label }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default async function SecuritySettingsPage() {
  await requirePermission(P.SETTINGS_READ);
  const record = await settingsService.forEdit("security");

  // Every permission is "resource.action"
  const allPermissions = Object.values(P);
  const resources = [...new Set(allPermissions.map((p) => p.split(".")[0]))];

  // All actions that exist per resource (used to show what a role does NOT have)
  const available = {};
  for (const p of allPermissions) {
    const [res, action] = p.split(".");
    (available[res] ??= []).includes(action) || available[res].push(action);
  }

  // Plain, serialisable data for the client component
  const roles = ROLE_LIST.map((id) => {
    const perms = ROLE_PERMISSIONS[id] ?? [];
    const byResource = {};
    for (const p of perms) {
      const [res, action] = p.split(".");
      (byResource[res] ??= []).push(action);
    }
    return {
      id,
      label: ROLE_LABELS[id] ?? id,
      total: perms.length,
      byResource,
    };
  });

  const staffRoles = roles.filter((r) => r.id !== "student");

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Security</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Control how people sign in and see what each role is allowed to do.
        </p>
      </header>

      <section aria-labelledby="security-controls" className="space-y-3">
        <h2 id="security-controls" className="text-lg font-medium">
          Sign-in and session controls
        </h2>
        <SecuritySettingsForm record={record} />
      </section>

      <section aria-labelledby="roles-permissions" className="space-y-3">
        <div className="space-y-1">
          <h2 id="roles-permissions" className="text-lg font-medium">
            Roles and permissions
          </h2>
          <p className="max-w-prose text-sm text-muted-foreground">
            Read-only on purpose. Permissions are defined in code and checked on
            the server for every action. To change someone&apos;s access, change
            their role from Users &amp; Roles.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat value={staffRoles.length} label="Staff roles" />
          <Stat value={resources.length} label="Areas protected" />
          <Stat value={allPermissions.length} label="Permissions defined" />
        </div>

        <Card className="p-4 sm:p-5">
          <RolesPermissionsExplorer
            roles={roles}
            resources={resources}
            available={available}
          />
        </Card>
      </section>
    </div>
  );
}
