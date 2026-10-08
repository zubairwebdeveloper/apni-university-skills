// services/email/emailService.js
import "server-only";
import { getProvider } from "@/lib/email/provider";
import { templates } from "@/lib/email/templates";
import { settingsService } from "@/services/settingsService";

export const emailService = {
  /** Never throws: a mail problem must not fail a payment, a signup or a form. flag = a notifications setting that must be on. */
  async send(template, to, data, { flag } = {}) {
    try {
      if (!to || !Object.hasOwn(templates, template)) return;
      const [n, g] = await Promise.all([
        settingsService.getNotifications(),
        settingsService.getGeneral(),
      ]);
      if (!n.emailsEnabled || (flag && !n[flag])) return;
      const site = {
        siteName: g.siteName,
        url: process.env.NEXT_PUBLIC_SITE_URL,
      };
      const from = `${g.siteName} <${process.env.EMAIL_FROM || "noreply@example.com"}>`;
      await getProvider().send({
        to,
        from,
        template,
        ...templates[template](data, site),
      });
    } catch (e) {
      console.error("[email]", template, e?.message ?? e);
    }
  },
};

