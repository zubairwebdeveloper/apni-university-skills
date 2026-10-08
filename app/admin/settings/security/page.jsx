// app/admin/settings/security/page.jsx
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SecuritySettingsForm } from "@/components/admin/settings/SettingsForms";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P, ROLE_PERMISSIONS } from "@/lib/constants/permissions";
import { ROLE_LABELS, ROLE_LIST } from "@/lib/constants/roles";
import { settingsService } from "@/services/settingsService";
export const metadata = { title: "Security settings" };

export default async function SecuritySettingsPage() {
  await requirePermission(P.SETTINGS_READ);
  const record = await settingsService.forEdit("security");
  const resources = [...new Set(Object.values(P).map((p) => p.split(".")[0]))];
  const cell = (role, r) =>
    (ROLE_PERMISSIONS[role] ?? [])
      .filter((p) => p.startsWith(`${r}.`))
      .map((p) => p.split(".")[1])
      .join(", ") || "—";
  return (
    <div className="space-y-6">
      <SecuritySettingsForm record={record} />
      <Card className="gap-3 p-5">
        <h2 className="text-lg">Roles and permissions</h2>
        <p className="text-sm text-muted-foreground">
          Read-only on purpose. Permissions are defined in code and checked on
          the server for every action. Change someone&apos;s role from Users &amp;
          Roles.
        </p>
        <div className="overflow-x-auto rounded-lg border">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Area</TableHead>
                {ROLE_LIST.filter((r) => r !== "student").map((r) => (
                  <TableHead key={r} scope="col">
                    {ROLE_LABELS[r]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((r) => (
                <TableRow key={r}>
                  <TableCell className="font-medium capitalize">{r}</TableCell>
                  {ROLE_LIST.filter((x) => x !== "student").map((role) => (
                    <TableCell
                      key={role}
                      className="text-xs text-muted-foreground"
                    >
                      {cell(role, r)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

