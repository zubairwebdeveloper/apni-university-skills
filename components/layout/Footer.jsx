// components/layout/Footer.jsx
// Server component: reads the saved General settings (same record the
// GeneralSettingsForm writes to) and feeds contact + social data into
// FooterView. Use this in your layout instead of importing FooterView
// directly, so the footer always reflects what's saved in Admin -> Settings.

import { FooterView } from "./FooterView";

// TODO: point this at whatever ACTUALLY reads the saved settings record
// in your project -- not the admin page component. Likely candidates:
//   - a function already used inside app/admin/settings/general/page.jsx
//     to build the `record` prop passed to <GeneralSettingsForm record={...} />
//   - a Firestore/DB helper near your updateGeneralSettings action
//     (e.g. app/actions/admin/settings.js)
// Until this is wired to a real function, it safely returns {} so the
// build doesn't break and the footer just renders with no contact/social
// info (same as if no props were passed at all).
export async function getGeneralSettings() {
  return {};
}

export async function Footer(props) {
  const settings = (await getGeneralSettings().catch(() => ({}))) ?? {};

  return (
    <FooterView
      siteName={settings?.siteName}
      contactEmail={settings?.contactEmail}
      phone={settings?.phone}
      address={settings?.address}
      social={settings?.social}
      {...props}
    />
  );
}
