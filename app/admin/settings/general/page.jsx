// app/admin/settings/general/page.jsx  (security and notifications are identical with their own form + id)
import { GeneralSettingsForm } from "@/components/admin/settings/SettingsForms";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { settingsService } from "@/services/settingsService";
export const metadata = { title: "General settings" };
export default async function GeneralSettingsPage() {
  await requirePermission(P.SETTINGS_READ);
  return (
    <GeneralSettingsForm record={await settingsService.forEdit("general")} />
  );
}

