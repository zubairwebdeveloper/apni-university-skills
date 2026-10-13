// app/admin/settings/notifications/page.jsx
import { NotificationSettingsForm } from "@/components/admin/settings/SettingsForms";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { settingsService } from "@/services/settingsService";

export const metadata = { title: "Notification settings" };

export default async function NotificationSettingsPage() {
  await requirePermission(P.SETTINGS_READ);
  const record = await settingsService.forEdit("notifications");
  return <NotificationSettingsForm record={record} />;
}
