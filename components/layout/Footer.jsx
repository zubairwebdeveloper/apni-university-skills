import { settingsService } from "@/services/settingsService";
import { FooterView } from "./FooterView";

export async function getGeneralSettings() {
  try {
    const settings = await settingsService.getPublic();
    return settings ?? {};
  } catch (error) {
    console.error("[Footer] Failed to load public settings:", error);
    return {};
  }
}

export async function Footer(props) {
  const settings = await getGeneralSettings();

  return (
    <FooterView
      {...props}
      settings={settings}
      siteName={props.siteName ?? settings.siteName}
      tagline={props.tagline ?? settings.tagline}
      description={props.description ?? settings.description}
      contactEmail={props.contactEmail ?? settings.contactEmail}
      phone={props.phone ?? settings.phone}
      address={props.address ?? settings.address}
      social={props.social ?? settings.social}
    />
  );
}
