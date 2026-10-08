// services/settingsService.js
import "server-only";
import { unstable_cache } from "next/cache";
import { siteConfig } from "@/config/site";
import { settingsRepository } from "@/repositories/admin/settingsRepository";

export const SETTINGS_DEFAULTS = {
  general: {
    siteName: siteConfig.name,
    tagline: siteConfig.tagline,
    description:
      "Master practical technology skills, build real projects, explore AI, and prepare for the future of work.",
    logo: "",
    contactEmail: siteConfig.supportEmail || "",
    phone: "",
    address: "",
    social: {
      linkedin: "",
      x: "",
      youtube: "",
      github: "",
      ...siteConfig.social,
    },
    seoTitle: "",
    seoDescription: "",
    ogImage: "",
  },
  security: { sessionDays: 5, staffSessionDays: 5 },
  notifications: {
    emailsEnabled: true,
    welcome: true,
    enrollment: true,
    payment: true,
    completion: true,
    certificate: true,
    notifyOnContact: false,
    adminAlertEmail: "",
  },
};
const merged = async (id) => ({
  ...SETTINGS_DEFAULTS[id],
  ...((await settingsRepository.get(id)) ?? {}),
});
const cached = Object.fromEntries(
  Object.keys(SETTINGS_DEFAULTS).map((id) => [
    id,
    unstable_cache(() => merged(id), [`settings:${id}`], {
      revalidate: 60,
      tags: ["settings"],
    }),
  ]),
);
const safeGet = async (id) => {
  try {
    return await cached[id]();
  } catch (e) {
    console.error("[settings]", id, e?.message ?? e);
    return SETTINGS_DEFAULTS[id];
  }
};

export const settingsService = {
  getGeneral: () => safeGet("general"),
  getSecurity: () => safeGet("security"),
  getNotifications: () => safeGet("notifications"),
  async getPublic() {
    const { id, updatedAt, updatedBy, ...rest } = await safeGet("general");
    return rest;
  }, // public pages never see the other documents
  forEdit: merged, // uncached, includes updatedAt for the edit lock
};

