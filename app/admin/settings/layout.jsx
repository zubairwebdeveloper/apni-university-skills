// app/admin/settings/layout.jsx
import { SettingsNav } from "@/components/admin/settings/SettingsNav";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
export default async function SettingsLayout({ children }) {
  await requirePermission(P.SETTINGS_READ);
  return (<><AdminPageHeader title="Settings" description="Site details, sessions and email." /><SettingsNav />{children}</>);
}


